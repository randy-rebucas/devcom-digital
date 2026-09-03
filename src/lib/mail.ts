import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendMail({
    to,
    subject: "Welcome to Devcom Digital",
    html: `<p>Hi ${name},</p><p>Thanks for creating an account with Devcom Digital. We're glad to have you.</p>`,
    text: `Hi ${name},\n\nThanks for creating an account with Devcom Digital. We're glad to have you.`,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
) {
  await sendMail({
    to,
    subject: "Verify your email",
    html: `<p>Hi ${name},</p><p>Please confirm your email address to activate your Devcom Digital account.</p><p><a href="${verifyUrl}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
    text: `Hi ${name},\n\nPlease confirm your email address to activate your Devcom Digital account:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendSubscriptionReceiptEmail(
  to: string,
  name: string,
  licenseKey: string
) {
  await sendMail({
    to,
    subject: "Your subscription is active",
    html: `<p>Hi ${name},</p><p>Your subscription is now active. Here is your license key:</p><p><strong>${licenseKey}</strong></p>`,
    text: `Hi ${name},\n\nYour subscription is now active. Here is your license key:\n\n${licenseKey}`,
  });
}
