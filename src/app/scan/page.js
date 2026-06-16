"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "@/components/CameraCapture";
import FollowUpQuestions from "@/components/FollowUpQuestions";
import FoodAnalysisCard from "@/components/FoodAnalysisCard";
import BottomNav from "@/components/BottomNav";
import { saveFoodLog } from "@/lib/localData";
import styles from "./scan.module.css";

const STEPS = {
  CAPTURE: "capture",
  ANALYZING: "analyzing",
  QUESTIONS: "questions",
  RESULT: "result",
  SAVING: "saving",
};

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.CAPTURE);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCapture = async ({ base64, mimeType, previewUrl }) => {
    setCapturedImage({ base64, mimeType, previewUrl });
    setStep(STEPS.ANALYZING);
    setError(null);

    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);

      // If there are follow-up questions, show them
      if (data.follow_up_questions?.length > 0) {
        setStep(STEPS.QUESTIONS);
      } else {
        setStep(STEPS.RESULT);
      }
    } catch (e) {
      setError("Couldn't analyze the image. Please try again with a clearer photo.");
      setStep(STEPS.CAPTURE);
    }
  };

  const handleFollowUpSubmit = async (answers) => {
    setStep(STEPS.ANALYZING);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage.base64,
          mimeType: capturedImage.mimeType,
          followUpAnswers: answers,
          originalAnalysis: analysis,
        }),
      });
      if (!res.ok) throw new Error("Refinement failed");
      const data = await res.json();
      setAnalysis(data);
      setStep(STEPS.RESULT);
    } catch {
      // On error, just go to result with original analysis
      setStep(STEPS.RESULT);
    }
  };

  const handleFollowUpSkip = () => {
    setStep(STEPS.RESULT);
  };

  const handleConfirmLog = async (mealType) => {
    if (!analysis) return;
    setSaving(true);

    try {
      saveFoodLog({
        food_items: analysis.foods,
        meal_type: mealType,
        total_calories: analysis.total_calories,
        total_protein_g: analysis.total_protein_g,
        total_carbs_g: analysis.total_carbs_g,
        total_fat_g: analysis.total_fat_g,
        total_fiber_g: analysis.total_fiber_g,
        ai_confidence: analysis.confidence,
        meal_description: analysis.meal_description,
        image_base64: capturedImage?.base64,
      });

      router.push("/dashboard");
    } catch {
      setError("Failed to save meal. Please try again.");
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setError(null);
    setStep(STEPS.CAPTURE);
  };

  return (
    <div className={styles.page} id="scan-page">
      <div className="page-container">
        {/* Step header */}
        <div className={styles.header}>
          {step !== STEPS.CAPTURE && (
            <button className="btn btn-icon" onClick={handleRetake} id="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>{getStepTitle(step)}</h1>
            <div className={styles.stepDots}>
              {Object.values(STEPS).slice(0, 3).map((s, i) => (
                <div
                  key={s}
                  className={`${styles.dot} ${isStepComplete(step, s) ? styles.dotActive : ""}`}
                />
              ))}
            </div>
          </div>
          <div style={{ width: 48 }} />
        </div>

        {/* Image preview strip (when analyzing/questions/result) */}
        {capturedImage?.previewUrl && step !== STEPS.CAPTURE && (
          <div className={styles.previewStrip}>
            <img src={capturedImage.previewUrl} alt="Your meal" className={styles.previewImg} />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step content */}
        <div className={styles.content}>
          {step === STEPS.CAPTURE && (
            <div className="slide-up">
              <CameraCapture onCapture={handleCapture} />
              <div className={styles.tips}>
                <p className={styles.tipsTitle}>📸 Tips for best results</p>
                <ul className={styles.tipsList}>
                  <li>Place food in good lighting</li>
                  <li>Show all items on the plate</li>
                  <li>Take photo from above at ~45°</li>
                  <li>Avoid heavy shadows or blur</li>
                </ul>
              </div>
            </div>
          )}

          {step === STEPS.ANALYZING && (
            <div className={styles.analyzingState}>
              <div className={styles.scanRings}>
                <div className={styles.ring1} />
                <div className={styles.ring2} />
                <div className={styles.ring3} />
                <div className={styles.scanIcon}>🤖</div>
              </div>
              <p className={styles.analyzingTitle}>Analyzing your meal…</p>
              <p className={styles.analyzingText}>
                AI is identifying Indian foods and calculating nutrition
              </p>
              <div className={styles.analyzingSteps}>
                {["Detecting food items", "Estimating portions", "Calculating nutrition"].map((s, i) => (
                  <div key={i} className={styles.analyzingStep}>
                    <div className={`${styles.stepSpinner} ${styles[`stepDelay${i}`]}`} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === STEPS.QUESTIONS && analysis?.follow_up_questions && (
            <div className="slide-up">
              <FollowUpQuestions
                questions={analysis.follow_up_questions}
                onSubmit={handleFollowUpSubmit}
                onSkip={handleFollowUpSkip}
              />
            </div>
          )}

          {step === STEPS.RESULT && analysis && (
            <div className="slide-up">
              <FoodAnalysisCard
                analysis={analysis}
                onConfirm={handleConfirmLog}
                saving={saving}
              />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function getStepTitle(step) {
  const titles = {
    [STEPS.CAPTURE]: "Scan Meal",
    [STEPS.ANALYZING]: "Analyzing",
    [STEPS.QUESTIONS]: "Quick Check",
    [STEPS.RESULT]: "Nutrition",
    [STEPS.SAVING]: "Saving…",
  };
  return titles[step] || "Scan";
}

function isStepComplete(currentStep, checkStep) {
  const order = [STEPS.CAPTURE, STEPS.QUESTIONS, STEPS.RESULT];
  return order.indexOf(currentStep) >= order.indexOf(checkStep);
}
