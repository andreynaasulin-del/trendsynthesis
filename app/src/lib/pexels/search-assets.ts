// ============================================
// TRENDSYNTHESIS — Pexels Asset Search
// ============================================

import { getPexelsClient } from "./client";
import type { PexelsAsset } from "@/types";

export async function searchVideos(
  query: string,
  perPage: number = 5
): Promise<PexelsAsset[]> {
  const client = getPexelsClient();
  const response = await client.videos.search({
    query,
    per_page: perPage,
    orientation: "portrait",
  });

  if ("error" in response) {
    throw new Error("Pexels API error");
  }

  return (response as any).videos.map((v: any) => ({
    id: v.id,
    type: "video" as const,
    url: v.video_files?.[0]?.link || "",
    preview_url: v.image,
    width: v.width,
    height: v.height,
    duration: v.duration,
    photographer: v.user?.name || "Unknown",
  }));
}

export async function searchPhotos(
  query: string,
  perPage: number = 5
): Promise<PexelsAsset[]> {
  const client = getPexelsClient();
  const response = await client.photos.search({
    query,
    per_page: perPage,
    orientation: "portrait",
  });

  if ("error" in response) {
    throw new Error("Pexels API error");
  }

  return (response as any).photos.map((p: any) => ({
    id: p.id,
    type: "photo" as const,
    url: p.src.original,
    preview_url: p.src.medium,
    width: p.width,
    height: p.height,
    photographer: p.photographer,
  }));
}
