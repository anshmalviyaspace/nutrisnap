import { NextResponse } from "next/server";
import { detectFoodRealtime } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const result = await detectFoodRealtime(image, mimeType || "image/jpeg");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Realtime food analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food frame." },
      { status: 500 }
    );
  }
}
