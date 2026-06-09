import { ConfigService } from "@nestjs/config";

/**
 * Reads JWT_SECRET and fails fast on misconfiguration instead of silently
 * falling back to a publicly-known default.
 * - Always rejects an unset/empty secret.
 * - In production, additionally rejects the insecure default and short secrets.
 */
export function requireJwtSecret(config: ConfigService): string {
  const secret = config.get<string>("JWT_SECRET");
  if (!secret || !secret.trim()) {
    throw new Error("JWT_SECRET is required and must be set.");
  }
  const isProduction =
    (config.get<string>("NODE_ENV") ?? process.env.NODE_ENV) === "production";
  if (isProduction && (secret === "change-me" || secret.length < 16)) {
    throw new Error(
      "JWT_SECRET is too weak for production: it must be at least 16 characters and not the default 'change-me'."
    );
  }
  return secret;
}
