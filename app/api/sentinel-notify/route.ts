import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.warn("[sentinel-notify] TG_BOT_TOKEN or TG_CHAT_ID not configured, skipping notification");
    return NextResponse.json(
      { ok: true, skipped: true, reason: "Telegram credentials not configured" },
      { status: 200 }
    );
  }

  const { text, buttons } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'text' field" },
      { status: 400 }
    );
  }

  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, action: "typing" }),
    });

    const payload: Record<string, unknown> = {
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: "Markdown",
    };
    if (buttons) {
      payload.reply_markup = { inline_keyboard: buttons };
    }

    const res = await fetch(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: "Telegram API error", detail: data.description },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send Telegram message" },
      { status: 502 }
    );
  }
}
