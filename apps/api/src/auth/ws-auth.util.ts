import { IncomingMessage } from "http";
import { JwtService } from "@nestjs/jwt";

export function extractWsToken(request: IncomingMessage): string | null {
  const authHeader = request.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const protocol = request.headers?.["sec-websocket-protocol"];
  if (typeof protocol === "string" && protocol.startsWith("Bearer ")) {
    return protocol.slice(7);
  }

  const url = request.url ?? "";
  try {
    const parsed = new URL(url, "http://localhost");
    return parsed.searchParams.get("token");
  } catch {
    return null;
  }
}

export async function verifyWsToken(jwtService: JwtService, token: string | null) {
  if (!token) {
    return null;
  }
  try {
    return await jwtService.verifyAsync(token);
  } catch {
    return null;
  }
}
