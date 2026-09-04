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

export async function sendQuoteReadyEmail(
  to: string,
  name: string,
  requestId: string,
  requestTitle: string
) {
  const url = `${process.env.NEXTAUTH_URL ?? ""}/requests/${requestId}`;
  await sendMail({
    to,
    subject: `Your quote for "${requestTitle}" is ready`,
    html: `<p>Hi ${name},</p><p>Your AI-generated quotation for "${requestTitle}" is ready to review.</p><p><a href="${url}">View your quote</a></p>`,
    text: `Hi ${name},\n\nYour AI-generated quotation for "${requestTitle}" is ready to review:\n\n${url}`,
  });
}

export async function sendStatusChangeEmail(
  to: string,
  name: string,
  requestId: string,
  requestTitle: string,
  newStatus: string
) {
  const url = `${process.env.NEXTAUTH_URL ?? ""}/requests/${requestId}`;
  await sendMail({
    to,
    subject: `Update on "${requestTitle}"`,
    html: `<p>Hi ${name},</p><p>The status of your request "${requestTitle}" changed to <strong>${newStatus}</strong>.</p><p><a href="${url}">View request</a></p>`,
    text: `Hi ${name},\n\nThe status of your request "${requestTitle}" changed to ${newStatus}:\n\n${url}`,
  });
}

export async function sendNewCommentEmail(
  to: string,
  name: string,
  requestId: string,
  requestTitle: string,
  fromLabel: string
) {
  const url = `${process.env.NEXTAUTH_URL ?? ""}/requests/${requestId}`;
  await sendMail({
    to,
    subject: `New message on "${requestTitle}"`,
    html: `<p>Hi ${name},</p><p>${fromLabel} left a new message on "${requestTitle}".</p><p><a href="${url}">View conversation</a></p>`,
    text: `Hi ${name},\n\n${fromLabel} left a new message on "${requestTitle}":\n\n${url}`,
  });
}

export async function sendInvoiceEmail(
  to: string,
  name: string,
  payUrl: string,
  amount: string
) {
  await sendMail({
    to,
    subject: "Your invoice is ready",
    html: `<p>Hi ${name},</p><p>An invoice for <strong>${amount}</strong> is ready for payment.</p><p><a href="${payUrl}">Pay invoice</a></p>`,
    text: `Hi ${name},\n\nAn invoice for ${amount} is ready for payment:\n\n${payUrl}`,
  });
}

export async function sendPaymentReceivedEmail(
  to: string,
  name: string,
  amount: string
) {
  await sendMail({
    to,
    subject: "Payment received",
    html: `<p>Hi ${name},</p><p>We've received your payment of <strong>${amount}</strong>. Thank you!</p>`,
    text: `Hi ${name},\n\nWe've received your payment of ${amount}. Thank you!`,
  });
}

export async function sendDeliverableUploadedEmail(
  to: string,
  name: string,
  requestId: string,
  requestTitle: string,
  fileName: string
) {
  const url = `${process.env.NEXTAUTH_URL ?? ""}/requests/${requestId}`;
  await sendMail({
    to,
    subject: `New file for "${requestTitle}"`,
    html: `<p>Hi ${name},</p><p>A new file, <strong>${fileName}</strong>, was added to "${requestTitle}".</p><p><a href="${url}">View request</a></p>`,
    text: `Hi ${name},\n\nA new file, ${fileName}, was added to "${requestTitle}":\n\n${url}`,
  });
}
