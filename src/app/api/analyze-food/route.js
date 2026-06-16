import { NextResponse } from "next/server";
import { analyzeFood, refineFoodAnalysis } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, mimeType, followUpAnswers, originalAnalysis } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    let result;

    if (followUpAnswers && originalAnalysis) {
      // Step 2: Refine analysis with follow-up answers
      result = await refineFoodAnalysis(
        originalAnalysis,
        followUpAnswers,
        image,
        mimeType || "image/jpeg"
      );
    } else {
      // Step 1: Initial analysis
      result = await analyzeFood(image, mimeType || "image/jpeg");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food. Please try again." },
      { status: 500 }
    );
  }
}
