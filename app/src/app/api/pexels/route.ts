import { NextRequest, NextResponse } from "next/server";
import { searchVideos, searchPhotos } from "@/lib/pexels/search-assets";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "videos";
    const perPage = parseInt(searchParams.get("per_page") || "5");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const assets =
      type === "videos"
        ? await searchVideos(query, perPage)
        : await searchPhotos(query, perPage);

    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    console.error("Pexels search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search assets" },
      { status: 500 }
    );
  }
}
