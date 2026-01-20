import { LoggerService } from "@nestjs/common";
import { RequestContext } from "./request-context";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose";

type LogPayload = {
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string | null;
  stack?: string;
  timestamp: string;
};

export class AppLogger implements LoggerService {
  log(message: any, context?: string) {
    this.write("log", message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.write("error", message, context, trace);
  }

  warn(message: any, context?: string) {
    this.write("warn", message, context);
  }

  debug(message: any, context?: string) {
    this.write("debug", message, context);
  }

  verbose(message: any, context?: string) {
    this.write("verbose", message, context);
  }

  private write(level: LogLevel, message: any, context?: string, trace?: string) {
    const payload: LogPayload = {
      level,
      message: typeof message === "string" ? message : JSON.stringify(message),
      context,
      requestId: RequestContext.getRequestId(),
      stack: trace,
      timestamp: new Date().toISOString()
    };

    const output = JSON.stringify(payload);
    if (level === "error") {
      console.error(output);
      return;
    }
    if (level === "warn") {
      console.warn(output);
      return;
    }
    console.log(output);
  }
}
