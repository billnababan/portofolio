import nodemailer from "nodemailer";
import { env, integrations } from "../config/env.js";

const transport = integrations.email ? nodemailer.createTransport(env.SMTP_URL) : null;

// Notifies the owner of a new contact message. Never blocks or fails the request:
// the message is already saved in the inbox.
export const notifyNewMessage = (m: { name: string; email: string; body: string }) => {
  if (!transport) return;
  transport
    .sendMail({
      to: env.NOTIFY_EMAIL,
      from: env.NOTIFY_EMAIL,
      replyTo: `${m.name} <${m.email}>`,
      subject: `New message from ${m.name} (portfolio)`,
      text: `${m.body}\n\n— ${m.name} <${m.email}>\nOpen the inbox in the CMS to reply or archive.`,
    })
    .catch((err: Error) => console.error("notify email failed:", err.message));
};
