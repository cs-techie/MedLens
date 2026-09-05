import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const specPath = path.join(process.cwd(), "docs", "openapi.json");
    if (fs.existsSync(specPath)) {
      const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
      return NextResponse.json(spec);
    }
    return NextResponse.json({ error: "OpenAPI specification not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
