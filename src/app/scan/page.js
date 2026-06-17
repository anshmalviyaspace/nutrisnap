"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import RealtimeCamera from "@/components/RealtimeCamera";
import FollowUpQuestions from "@/components/FollowUpQuestions";
import FoodAnalysisCard from "@/components/FoodAnalysisCard";
import BottomNav from "@/components/BottomNav";
import { saveFoodLog } from "@/lib/localData";
import styles from "./scan.module.css";

const STEPS = {
  SCANNING: "scanning",
  ANALYZING: "analyzing",
  QUESTIONS: "questions",
  RESULT: "result",
  SAVING: "saving",
};

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.SCANNING);
  
  // Real-time tracking state
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [bestFrame, setBestFrame] = useState(null); // The frame we will send for full analysis
  
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Callback from RealtimeCamera
  const handleDetectFoods = useCallback((foods, frame) => {
    setDetectedFoods(prev => {
      const newFoods = [...prev];
      let addedNew = false;
      
      for (const food of foods) {
        const exists = newFoods.find(
          f => f.name.toLowerCase() === food.name.toLowerCase() || 
               f.name_hindi?.toLowerCase() === food.name_hindi?.toLowerCase()
        );
        if (!exists) {
          newFoods.push(food);
          addedNew = true;
        }
      }
      
      if (addedNew) {
        setBestFrame(frame);
      }
      
      return newFoods;
    });
  }, []);

  const handleCalculateNutrition = async () => {
    if (!bestFrame) {
      setError("Please wait for the AI to detect at least one food item.");
      return;
    }
    
    setStep(STEPS.ANALYZING);
    setError(null);

    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: bestFrame.base64, mimeType: bestFrame.mimeType }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);

      if (data.follow_up_questions?.length > 0) {
        setStep(STEPS.QUESTIONS);
      } else {
        setStep(STEPS.RESULT);
      }
    } catch (e) {
      setError("Couldn't analyze the food. Please try again.");
      setStep(STEPS.SCANNING);
    }
  };

  const handleFollowUpSubmit = async (answers) => {
    setStep(STEPS.ANALYZING);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: bestFrame.base64,
          mimeType: bestFrame.mimeType,
          followUpAnswers: answers,
          originalAnalysis: analysis,
        }),
      });
      if (!res.ok) throw new Error("Refinement failed");
      const data = await res.json();
      setAnalysis(data);
      setStep(STEPS.RESULT);
    } catch {
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
        image_base64: bestFrame?.base64,
      });

      router.push("/dashboard");
    } catch {
      setError("Failed to save meal. Please try again.");
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setDetectedFoods([]);
    setBestFrame(null);
    setAnalysis(null);
    setError(null);
    setStep(STEPS.SCANNING);
  };

  return (
    <div className={styles.page} id="scan-page">
      <div className="page-container">
        {/* Step header */}
        <div className={styles.header}>
          {step !== STEPS.SCANNING && (
            <button className="btn btn-icon" onClick={handleRetake} id="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>{getStepTitle(step)}</h1>
            <div className={styles.stepDots}>
              {Object.values(STEPS).filter(s => s !== STEPS.SAVING).map((s, i) => (
                <div
                  key={s}
                  className={`${styles.dot} ${isStepComplete(step, s) ? styles.dotActive : ""}`}
                />
              ))}
            </div>
          </div>
          <div style={{ width: 48 }} />
        </div>

        {/* Image preview strip */}
        {bestFrame?.previewUrl && step !== STEPS.SCANNING && (
          <div className={styles.previewStrip}>
            <img src={bestFrame.previewUrl} alt="Your meal" className={styles.previewImg} />
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
          {step === STEPS.SCANNING && (
            <div className="slide-up">
              <RealtimeCamera 
                scanning={true} 
                onDetectFoods={handleDetectFoods} 
              />
              
              <div className={styles.liveDetectedList}>
                <h3 className={styles.detectedTitle}>Detected Items ({detectedFoods.length})</h3>
                {detectedFoods.length > 0 ? (
                  <ul className={styles.detectedItems}>
                    {detectedFoods.map((food, i) => (
                      <li key={i} className={styles.detectedItem}>
                        <span className={styles.foodName}>{food.name}</span>
                        {food.name_hindi && <span className={styles.foodHindi}>{food.name_hindi}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.detectingHint}>Point camera at food...</p>
                )}
              </div>
              
              <div className={styles.actionContainer}>
                <button 
                  className="btn btn-primary w-full" 
                  onClick={handleCalculateNutrition}
                  disabled={detectedFoods.length === 0}
                >
                  Calculate Nutrition
                </button>
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
              <p className={styles.analyzingTitle}>Calculating macros…</p>
              <p className={styles.analyzingText}>
                Fetching detailed nutritional info for {detectedFoods.length} item(s)
              </p>
              <div className={styles.analyzingSteps}>
                {["Estimating portions", "Calculating nutrition"].map((s, i) => (
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
    [STEPS.SCANNING]: "Live Scan",
    [STEPS.ANALYZING]: "Analyzing",
    [STEPS.QUESTIONS]: "Quick Check",
    [STEPS.RESULT]: "Nutrition",
    [STEPS.SAVING]: "Saving…",
  };
  return titles[step] || "Scan";
}

function isStepComplete(currentStep, checkStep) {
  const order = [STEPS.SCANNING, STEPS.ANALYZING, STEPS.QUESTIONS, STEPS.RESULT, STEPS.SAVING];
  return order.indexOf(currentStep) >= order.indexOf(checkStep);
}

