/**
 * Email adapter using Postmark.
 * Requires POSTMARK_API_KEY and EMAIL_FROM env vars.
 */

interface SendEmailParams {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = process.env.POSTMARK_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.warn("[email] POSTMARK_API_KEY or EMAIL_FROM not set. Email not sent.")
    return
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiKey,
    },
    body: JSON.stringify({
      From: from,
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.htmlBody,
      TextBody: params.textBody ?? params.subject,
      MessageStream: "outbound",
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Postmark error ${response.status}: ${body}`)
  }
}

export function passwordResetEmail(resetUrl: string): { subject: string; htmlBody: string } {
  return {
    subject: "Reset your RASA password",
    htmlBody: `
      <p>Hi,</p>
      <p>Click below to reset your RASA password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="color:#C96BCF;font-weight:bold">Reset Password</a></p>
      <p>If you didn't request this, ignore this email.</p>
      <p>— The RASA Team</p>
    `,
  }
}

export function welcomeEmail(name: string): { subject: string; htmlBody: string } {
  return {
    subject: "Welcome to RASA!",
    htmlBody: `
      <p>Hi ${name},</p>
      <p>Welcome to RASA — the civic contribution platform. You can now explore missions and earn time credits for your contributions.</p>
      <p>Get started by completing your profile.</p>
      <p>— The RASA Team</p>
    `,
  }
}
