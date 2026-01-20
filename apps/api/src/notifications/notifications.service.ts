import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { Twilio } from "twilio";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type WhatsappPayload = {
  to: string;
  body: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly emailProvider: "smtp" | "sendgrid" | "none";
  private readonly whatsappProvider: "twilio" | "none";
  private readonly transporter?: nodemailer.Transporter;
  private readonly twilioClient?: Twilio;

  constructor(private readonly config: ConfigService) {
    this.emailProvider =
      (this.config.get<string>("EMAIL_PROVIDER") ?? "none").toLowerCase() === "sendgrid"
        ? "sendgrid"
        : (this.config.get<string>("EMAIL_PROVIDER") ?? "none").toLowerCase() === "smtp"
        ? "smtp"
        : "none";

    this.whatsappProvider =
      (this.config.get<string>("WHATSAPP_PROVIDER") ?? "none").toLowerCase() === "twilio"
        ? "twilio"
        : "none";

    if (this.emailProvider === "sendgrid") {
      const key = this.config.get<string>("SENDGRID_API_KEY");
      if (key) {
        sgMail.setApiKey(key);
      }
    }

    if (this.emailProvider === "smtp") {
      const host = this.config.get<string>("SMTP_HOST");
      const port = this.config.get<number>("SMTP_PORT");
      const user = this.config.get<string>("SMTP_USER");
      const pass = this.config.get<string>("SMTP_PASS");
      if (host && port && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
      }
    }

    if (this.whatsappProvider === "twilio") {
      const sid = this.config.get<string>("TWILIO_ACCOUNT_SID");
      const token = this.config.get<string>("TWILIO_AUTH_TOKEN");
      if (sid && token) {
        this.twilioClient = new Twilio(sid, token);
      }
    }
  }

  async sendEmail(payload: EmailPayload) {
    if (this.emailProvider === "none") {
      this.logger.warn(`Email provider disabled. Skipping email to ${payload.to}`);
      return;
    }

    const from = this.config.get<string>("EMAIL_FROM") ?? "no-reply@foodengineering.com";

    if (this.emailProvider === "sendgrid") {
      await sgMail.send({
        to: payload.to,
        from,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      });
      return;
    }

    if (this.emailProvider === "smtp" && this.transporter) {
      await this.transporter.sendMail({
        to: payload.to,
        from,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      });
      return;
    }

    this.logger.warn("Email provider misconfigured. No email sent.");
  }

  async sendWhatsApp(payload: WhatsappPayload) {
    if (this.whatsappProvider === "none") {
      this.logger.warn(`WhatsApp provider disabled. Skipping WhatsApp to ${payload.to}`);
      return;
    }

    if (!this.twilioClient) {
      this.logger.warn("WhatsApp provider misconfigured. No message sent.");
      return;
    }

    const from = this.config.get<string>("WHATSAPP_FROM");
    if (!from) {
      this.logger.warn("WHATSAPP_FROM missing. No WhatsApp sent.");
      return;
    }

    await this.twilioClient.messages.create({
      to: `whatsapp:${payload.to}`,
      from: `whatsapp:${from}`,
      body: payload.body
    });
  }
}
