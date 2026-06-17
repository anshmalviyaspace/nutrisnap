import { NextResponse } from "next/server";
import { editMealWithAI } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { originalMeal, userPrompt } = body;

    if (!originalMeal || !userPrompt) {
      return NextResponse.json(
        { error: "Missing originalMeal or userPrompt" },
        { status: 400 }
      );
    }

    const updatedMeal = await editMealWithAI(originalMeal, userPrompt);
    
    // Preserve the original metadata
    const finalMeal = {
      ...updatedMeal,
      id: originalMeal.id,
      logged_at: originalMeal.logged_at,
      meal_type: originalMeal.meal_type,
      image_base64: originalMeal.image_base64,
    };

    return NextResponse.json(finalMeal);
  } catch (error) {
    console.error("Meal edit error:", error);
    return NextResponse.json(
      { error: "Failed to edit meal with AI. Please try again." },
      { status: 500 }
    );
  }
}
