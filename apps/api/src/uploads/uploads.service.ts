import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { Readable } from "stream";
import { tmpdir } from "os";
import { promises as fs } from "fs";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { v2 as cloudinary } from "cloudinary";

const execFileAsync = promisify(execFile);

type UploadResult = {
  url: string;
  key?: string;
};

@Injectable()
export class UploadsService {
  private readonly provider: "s3" | "cloudinary" | "disabled";
  private readonly s3?: S3Client;
  private readonly s3Bucket?: string;
  private readonly s3PublicBase?: string;
  private readonly cloudinaryFolder?: string;
  private readonly maxBytes: number;
  private readonly allowedMime: Set<string>;
  private readonly virusScanEnabled: boolean;
  private readonly virusScanCmd: string;

  constructor(private readonly config: ConfigService) {
    this.provider = (this.config.get<string>("STORAGE_PROVIDER") ?? "s3") as
      | "s3"
      | "cloudinary"
      | "disabled";
    this.maxBytes = Number(this.config.get<string>("UPLOAD_MAX_MB") ?? "10") * 1024 * 1024;
    const allowed =
      this.config.get<string>("UPLOAD_ALLOWED_MIME") ??
      "image/jpeg,image/png,image/svg+xml,application/pdf";
    this.allowedMime = new Set(allowed.split(",").map((value) => value.trim()));
    this.virusScanEnabled = (this.config.get<string>("VIRUS_SCAN_ENABLED") ?? "false") === "true";
    this.virusScanCmd = this.config.get<string>("VIRUS_SCAN_CMD") ?? "clamscan";

    if (this.provider === "s3") {
      this.s3Bucket = this.config.get<string>("S3_BUCKET");
      const region = this.config.get<string>("S3_REGION");
      const accessKeyId = this.config.get<string>("S3_ACCESS_KEY_ID");
      const secretAccessKey = this.config.get<string>("S3_SECRET_ACCESS_KEY");
      this.s3PublicBase = this.config.get<string>("S3_PUBLIC_BASE_URL");

      if (!this.s3Bucket || !region || !accessKeyId || !secretAccessKey) {
        throw new Error("S3 storage is enabled but required S3 env vars are missing.");
      }

      this.s3 = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey }
      });
    }

    if (this.provider === "cloudinary") {
      const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
      const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
      const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");
      this.cloudinaryFolder = this.config.get<string>("CLOUDINARY_FOLDER") ?? "food-engineering";

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary storage is enabled but required env vars are missing.");
      }

      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

  async uploadMenuAsset(file: Express.Multer.File): Promise<UploadResult> {
    if (this.provider === "disabled") {
      throw new InternalServerErrorException("Uploads are disabled.");
    }
    if (!file?.buffer) {
      throw new InternalServerErrorException("Upload buffer missing.");
    }

    if (file.size > this.maxBytes) {
      throw new InternalServerErrorException("File exceeds maximum size.");
    }

    const detected = await this.detectMime(file.buffer);
    if (!detected || !this.allowedMime.has(detected)) {
      throw new InternalServerErrorException("Unsupported file type.");
    }

    if (this.virusScanEnabled) {
      await this.scanForViruses(file.buffer);
    }

    const extension = this.extensionForMime(detected) ?? this.safeExtension(file.originalname);
    const key = `menu/${randomUUID()}${extension}`;

    if (this.provider === "cloudinary") {
      return this.uploadCloudinary(file.buffer, key, detected);
    }

    return this.uploadS3(file.buffer, key, detected);
  }

  private async uploadS3(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    if (!this.s3 || !this.s3Bucket) {
      throw new InternalServerErrorException("S3 client not configured.");
    }

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      }
    });

    await upload.done();

    const base =
      this.s3PublicBase ??
      `https://${this.s3Bucket}.s3.${this.config.get<string>("S3_REGION")}.amazonaws.com`;
    return { url: `${base}/${key}`, key };
  }

  private async uploadCloudinary(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    if (!this.cloudinaryFolder) {
      throw new InternalServerErrorException("Cloudinary folder missing.");
    }

    const publicId = key.replace(/\.[^.]+$/, "");

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: this.cloudinaryFolder,
          public_id: publicId,
          resource_type: contentType === "application/pdf" ? "raw" : "image"
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(uploadResult as { secure_url: string });
        }
      );
      Readable.from(buffer).pipe(stream);
    });

    return { url: result.secure_url, key: publicId };
  }

  private async detectMime(buffer: Buffer): Promise<string | null> {
    const type = await fileTypeFromBuffer(buffer);
    if (type?.mime) {
      return type.mime;
    }

    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 200));
    if (text.includes("<svg")) {
      return "image/svg+xml";
    }

    return null;
  }

  private extensionForMime(mime: string) {
    switch (mime) {
      case "image/jpeg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/svg+xml":
        return ".svg";
      case "application/pdf":
        return ".pdf";
      default:
        return undefined;
    }
  }

  private safeExtension(name: string) {
    const index = name.lastIndexOf(".");
    return index >= 0 ? name.slice(index).toLowerCase() : "";
  }

  private async scanForViruses(buffer: Buffer) {
    const filePath = join(tmpdir(), `upload-${randomUUID()}`);
    try {
      await fs.writeFile(filePath, buffer);
      await execFileAsync(this.virusScanCmd, ["--no-summary", filePath]);
    } catch (error) {
      throw new InternalServerErrorException("Virus scan failed.");
    } finally {
      await fs.unlink(filePath).catch(() => undefined);
    }
  }
}
