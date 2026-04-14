import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/contact";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_SENDER_NAME = "Olga Emma Website";

type ContactRequestBody = {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  locale: string;
  pageUrl: string;
  website: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInquiry(value: string) {
  switch (value) {
    case "project":
      return "Project inquiry";
    case "hire":
      return "Full-time hire";
    case "consultation":
      return "Consultation";
    case "collaboration":
      return "Collaboration";
    case "other":
      return "Other";
    default:
      return "Not provided";
  }
}

function formatOptional(value: string) {
  return value || "Not provided";
}

function buildTextEmail(payload: ContactRequestBody) {
  return [
    `New website contact submission`,
    ` `,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${formatOptional(payload.company)}`,
    `Inquiry: ${formatInquiry(payload.inquiry)}`,
    `Locale: ${payload.locale || "Not provided"}`,
    `Page: ${formatOptional(payload.pageUrl)}`,
    ` `,
    `Message:`,
    payload.message,
  ].join("\n");
}

function buildHtmlEmail(payload: ContactRequestBody) {
  const escapedMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");

  return [
    "<div style=\"font-family: Georgia, serif; color: #1f2933; line-height: 1.6;\">",
    "<h2 style=\"margin-bottom: 16px;\">New website contact submission</h2>",
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>Company:</strong> ${escapeHtml(formatOptional(payload.company))}</p>`,
    `<p><strong>Inquiry:</strong> ${escapeHtml(formatInquiry(payload.inquiry))}</p>`,
    `<p><strong>Locale:</strong> ${escapeHtml(payload.locale || "Not provided")}</p>`,
    `<p><strong>Page:</strong> ${escapeHtml(formatOptional(payload.pageUrl))}</p>`,
    "<p><strong>Message:</strong></p>",
    `<p>${escapedMessage}</p>`,
    "</div>",
  ].join("");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const resendToEmail = process.env.RESEND_TO_EMAIL?.trim() || CONTACT_EMAIL;

  if (!resendApiKey || !resendFromEmail) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email service is not configured.",
      },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const rawBody = body as Record<string, unknown>;
  const payload: ContactRequestBody = {
    name: cleanString(rawBody.name),
    email: cleanString(rawBody.email),
    company: cleanString(rawBody.company),
    inquiry: cleanString(rawBody.inquiry),
    message: cleanString(rawBody.message),
    locale: cleanString(rawBody.locale),
    pageUrl: cleanString(rawBody.pageUrl),
    website: cleanString(rawBody.website),
  };

  if (payload.website) {
    return NextResponse.json({ ok: true });
  }

  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!payload.name || !hasValidEmail || payload.message.length < 10) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please complete all required fields.",
      },
      { status: 400 },
    );
  }

  const subject = `Website inquiry - ${payload.name}`;
  const resendResponse = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${RESEND_SENDER_NAME} <${resendFromEmail}>`,
      to: [resendToEmail],
      reply_to: payload.email,
      subject,
      text: buildTextEmail(payload),
      html: buildHtmlEmail(payload),
    }),
  });

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();
    console.error(
      `[contact] Resend request failed with ${resendResponse.status}: ${resendError}`,
    );

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to send message.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
