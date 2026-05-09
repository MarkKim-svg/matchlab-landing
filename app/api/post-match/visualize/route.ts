import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { renderVisualSvg, VIZ_WIDTH, VIZ_HEIGHT } from "@/components/post-match/visuals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VisualizeBody {
  fixture_id: number;
  type: "xg_bar" | "possession_donut" | "sot_compare";
  data: {
    home: { name: string; xg: number; possession: number; sot: number };
    away: { name: string; xg: number; possession: number; sot: number };
  };
}

function isValid(body: unknown): body is VisualizeBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Partial<VisualizeBody>;
  if (typeof b.fixture_id !== "number") return false;
  if (!["xg_bar", "possession_donut", "sot_compare"].includes(b.type ?? "")) return false;
  if (!b.data?.home?.name || !b.data?.away?.name) return false;
  return true;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: "invalid_schema" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "blob_token_missing" }, { status: 500 });
  }

  const { fixture_id, type, data } = body;

  try {
    const svg = renderVisualSvg(type, data);
    const png = await sharp(Buffer.from(svg))
      .resize(VIZ_WIDTH, VIZ_HEIGHT, { fit: "contain", background: "#FFFFFF" })
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();

    const blob = await put(`post-match/${fixture_id}/${type}.png`, png, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url, type, fixture_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "render_failed", message: msg }, { status: 500 });
  }
}
