import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert Indian nutritionist, dietitian, and food scientist with deep knowledge of Indian cuisine including regional variations (North Indian, South Indian, Bengali, Gujarati, Maharashtrian, etc.).

Your task is to analyze food images and provide accurate nutritional information.

RULES:
1. Identify EVERY food item visible in the image
2. Focus on Indian cuisine recognition: dal, roti, naan, rice (basmati/regular), sabzi, curry, biryani, dosa, idli, paratha, paneer dishes, chole, rajma, sambar, rasam, chutneys, pickles, papad, raita, etc.
3. Estimate portion sizes in both grams and common Indian measures (1 katori/bowl ~150-200ml, 1 roti ~40g, 1 cup rice ~180g cooked)
4. Account for cooking methods: fried vs steamed vs baked, oil/ghee usage, tadka/tempering
5. Consider typical Indian cooking ingredients: ghee, mustard oil, coconut oil, cream, coconut milk
6. Calculate detailed nutrition per item
7. Generate 2-4 smart follow-up questions to improve accuracy
8. Be precise — don't underestimate oil/ghee content which is common in Indian cooking

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation text.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    foods: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Food item name" },
          name_hindi: {
            type: "string",
            description: "Hindi/regional name if applicable",
          },
          quantity: {
            type: "string",
            description: "Estimated portion e.g. '1 bowl (200g)'",
          },
          quantity_grams: { type: "number", description: "Weight in grams" },
          calories: { type: "number", description: "Total calories (kcal)" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          fiber_g: { type: "number" },
          sugar_g: { type: "number" },
          sodium_mg: { type: "number" },
          iron_mg: { type: "number" },
          calcium_mg: { type: "number" },
          vitamin_a_mcg: { type: "number" },
          vitamin_c_mg: { type: "number" },
          potassium_mg: { type: "number" },
        },
        required: [
          "name",
          "quantity",
          "quantity_grams",
          "calories",
          "protein_g",
          "carbs_g",
          "fat_g",
          "fiber_g",
        ],
      },
    },
    total_calories: { type: "number" },
    total_protein_g: { type: "number" },
    total_carbs_g: { type: "number" },
    total_fat_g: { type: "number" },
    total_fiber_g: { type: "number" },
    confidence: {
      type: "number",
      description: "Confidence score 0-1 for identification accuracy",
    },
    follow_up_questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
            description: "2-4 answer options for the user to pick from",
          },
        },
        required: ["question", "options"],
      },
    },
    meal_description: {
      type: "string",
      description: "Brief natural language description of the meal",
    },
  },
  required: [
    "foods",
    "total_calories",
    "total_protein_g",
    "total_carbs_g",
    "total_fat_g",
    "total_fiber_g",
    "confidence",
    "follow_up_questions",
    "meal_description",
  ],
};

/**
 * Analyze a food image using Gemini 2.0 Flash
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} mimeType - Image MIME type (e.g. 'image/jpeg')
 * @returns {Promise<object>} Structured food analysis
 */
export async function analyzeFood(base64Image, mimeType = "image/jpeg") {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this food image. Identify all food items, estimate portions, and calculate detailed nutritional information. Generate follow-up questions to improve accuracy.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const text = response.text;
  return JSON.parse(text);
}

/**
 * Refine food analysis based on follow-up answers
 * @param {object} originalAnalysis - Original analysis result
 * @param {object} answers - User's answers to follow-up questions
 * @param {string} base64Image - Original image
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<object>} Refined food analysis
 */
export async function refineFoodAnalysis(
  originalAnalysis,
  answers,
  base64Image,
  mimeType = "image/jpeg"
) {
  const answersText = Object.entries(answers)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `I previously analyzed this food image and got this result:
${JSON.stringify(originalAnalysis.foods, null, 2)}

The user answered the following follow-up questions:
${answersText}

Please RECALCULATE the nutritional information based on these clarifications. Be more precise now with the additional context. Keep the same food items but adjust quantities and nutrition values based on the answers.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const text = response.text;
  return JSON.parse(text);
}
