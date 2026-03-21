import FirecrawlApp from "@mendable/firecrawl-js";
import { NextResponse } from "next/server";

const app = new FirecrawlApp({
  apiKey: "test",
  apiUrl: "http://localhost:3002",
});

export async function POST(request: Request) {
  const { url, options } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const result = await app.scrapeUrl(url, {
    formats: ["markdown"],
    waitFor: 5000,
    ...options,
  });

  return NextResponse.json(result);
}
