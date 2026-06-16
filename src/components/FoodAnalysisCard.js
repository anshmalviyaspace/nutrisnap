"use client";

import { useState } from "react";
import { suggestMealType, getMealEmoji, getMealLabel } from "@/lib/utils";
import styles from "./FoodAnalysisCard.module.css";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function FoodAnalysisCard({ analysis, onConfirm, saving }) {
  const [mealType, setMealType] = useState(suggestMealType());
  const [expandedFood, setExpandedFood] = useState(null);

  const { foods = [], total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g, confidence, meal_description } = analysis;

  return (
    <div className={`${styles.container} fade-in`} id="food-analysis-card">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.identifiedLabel}>Identified Meal</p>
          <p className={styles.description}>{meal_description}</p>
        </div>
        <div className={styles.confidenceBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {Math.round(confidence * 100)}%
        </div>
      </div>

      {/* Calorie total */}
      <div className={styles.calorieTotal}>
        <span className={styles.calNum}>{Math.round(total_calories)}</span>
        <span className={styles.calLabel}>total calories</span>
      </div>

      {/* Macro summary */}
      <div className={styles.macroRow}>
        <div className={styles.macroItem}>
          <span className={`${styles.macroVal} ${styles.proteinColor}`}>{Math.round(total_protein_g)}g</span>
          <span className={styles.macroKey}>Protein</span>
        </div>
        <div className={styles.macroDot} />
        <div className={styles.macroItem}>
          <span className={`${styles.macroVal} ${styles.carbColor}`}>{Math.round(total_carbs_g)}g</span>
          <span className={styles.macroKey}>Carbs</span>
        </div>
        <div className={styles.macroDot} />
        <div className={styles.macroItem}>
          <span className={`${styles.macroVal} ${styles.fatColor}`}>{Math.round(total_fat_g)}g</span>
          <span className={styles.macroKey}>Fat</span>
        </div>
        <div className={styles.macroDot} />
        <div className={styles.macroItem}>
          <span className={`${styles.macroVal} ${styles.fiberColor}`}>{Math.round(total_fiber_g)}g</span>
          <span className={styles.macroKey}>Fiber</span>
        </div>
      </div>

      <div className="divider" />

      {/* Food items list */}
      <p className={styles.sectionLabel}>Detected Items ({foods.length})</p>
      <div className={styles.foodList}>
        {foods.map((food, i) => (
          <div
            key={i}
            className={styles.foodItem}
            onClick={() => setExpandedFood(expandedFood === i ? null : i)}
          >
            <div className={styles.foodItemRow}>
              <div className={styles.foodDot} />
              <div className={styles.foodInfo}>
                <span className={styles.foodName}>{food.name}</span>
                {food.name_hindi && (
                  <span className={styles.foodHindi}>{food.name_hindi}</span>
                )}
                <span className={styles.foodQty}>{food.quantity}</span>
              </div>
              <div className={styles.foodRight}>
                <span className={styles.foodCal}>{Math.round(food.calories)}</span>
                <span className={styles.foodCalLabel}>kcal</span>
              </div>
            </div>

            {/* Expanded food micronutrients */}
            {expandedFood === i && (
              <div className={styles.microGrid}>
                {food.protein_g > 0 && <MicroItem label="Protein" value={`${Math.round(food.protein_g)}g`} />}
                {food.carbs_g > 0 && <MicroItem label="Carbs" value={`${Math.round(food.carbs_g)}g`} />}
                {food.fat_g > 0 && <MicroItem label="Fat" value={`${Math.round(food.fat_g)}g`} />}
                {food.fiber_g > 0 && <MicroItem label="Fiber" value={`${Math.round(food.fiber_g)}g`} />}
                {food.sodium_mg > 0 && <MicroItem label="Sodium" value={`${Math.round(food.sodium_mg)}mg`} />}
                {food.iron_mg > 0 && <MicroItem label="Iron" value={`${food.iron_mg}mg`} />}
                {food.calcium_mg > 0 && <MicroItem label="Calcium" value={`${Math.round(food.calcium_mg)}mg`} />}
                {food.vitamin_c_mg > 0 && <MicroItem label="Vit C" value={`${food.vitamin_c_mg}mg`} />}
                {food.potassium_mg > 0 && <MicroItem label="Potassium" value={`${Math.round(food.potassium_mg)}mg`} />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Meal type selector */}
      <p className={styles.sectionLabel}>Meal Type</p>
      <div className={styles.mealTypeRow}>
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            className={`chip ${mealType === type ? "chip-green active" : ""}`}
            onClick={() => setMealType(type)}
            id={`meal-type-${type}`}
          >
            {getMealEmoji(type)} {getMealLabel(type)}
          </button>
        ))}
      </div>

      {/* Confirm button */}
      <button
        className="btn btn-primary btn-full"
        onClick={() => onConfirm(mealType)}
        disabled={saving}
        id="confirm-log-btn"
        style={{ marginTop: "var(--space-md)" }}
      >
        {saving ? (
          <>
            <div className="spinner spinner-sm" />
            Saving…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Log This Meal
          </>
        )}
      </button>
    </div>
  );
}

function MicroItem({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ fontSize: "var(--font-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
