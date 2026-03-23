import FirecrawlApp from "@mendable/firecrawl-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url : "";
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const app = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY ?? "test",
      apiUrl: process.env.FIRECRAWL_API_URL ?? "http://localhost:3002",
    });

    const result = await app.scrape(url, {
      formats: ["markdown"],
      waitFor: 5000,
      ...(body.options ?? {}),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
