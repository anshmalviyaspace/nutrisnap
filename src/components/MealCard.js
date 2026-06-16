"use client";

import { useState } from "react";
import { formatTime, getMealEmoji, getMealLabel } from "@/lib/utils";
import { deleteFoodLog } from "@/lib/localData";
import styles from "./MealCard.module.css";

export default function MealCard({ log, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Remove this meal from your log?")) return;
    setDeleting(true);
    try {
      deleteFoodLog(log.id);
      onDelete?.(log.id);
    } catch {
      setDeleting(false);
    }
  };

  const mealType = log.meal_type || "meal";
  const foods = log.food_items || [];

  return (
    <div
      className={`${styles.card} glass-card-sm`}
      onClick={() => setExpanded(!expanded)}
      id={`meal-card-${log.id}`}
    >
      <div className={styles.header}>
        <div className={styles.mealIconWrap}>
          <span className={styles.mealEmoji}>{getMealEmoji(mealType)}</span>
        </div>
        <div className={styles.info}>
          <div className={styles.row}>
            <span className={`badge badge-${getMealColor(mealType)}`}>
              {getMealLabel(mealType)}
            </span>
            <span className={styles.time}>{formatTime(log.logged_at)}</span>
          </div>
          <p className={styles.description}>
            {log.meal_description || foods.slice(0, 2).map((f) => f.name).join(", ")}
          </p>
        </div>
        <div className={styles.calories}>
          <span className={styles.calorieNum}>{log.total_calories}</span>
          <span className={styles.calorieLabel}>kcal</span>
        </div>
      </div>

      {/* Macro mini-pills */}
      <div className={styles.macros}>
        <div className={styles.macroPill}>
          <span className={styles.macroVal}>{Math.round(log.total_protein_g)}g</span>
          <span className={styles.macroLabel}>Protein</span>
        </div>
        <div className={styles.macroDivider} />
        <div className={styles.macroPill}>
          <span className={styles.macroVal}>{Math.round(log.total_carbs_g)}g</span>
          <span className={styles.macroLabel}>Carbs</span>
        </div>
        <div className={styles.macroDivider} />
        <div className={styles.macroPill}>
          <span className={styles.macroVal}>{Math.round(log.total_fat_g)}g</span>
          <span className={styles.macroLabel}>Fat</span>
        </div>
        <div className={styles.macroDivider} />
        <div className={styles.macroPill}>
          <span className={styles.macroVal}>{Math.round(log.total_fiber_g)}g</span>
          <span className={styles.macroLabel}>Fiber</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className={styles.expanded} onClick={(e) => e.stopPropagation()}>
          <div className="divider" />
          <p className={styles.expandedTitle}>Food Items</p>
          <div className={styles.foodList}>
            {foods.map((food, i) => (
              <div key={i} className={styles.foodItem}>
                <div className={styles.foodItemHeader}>
                  <span className={styles.foodName}>{food.name}</span>
                  <span className={styles.foodCal}>{food.calories} kcal</span>
                </div>
                <span className={styles.foodQty}>{food.quantity}</span>
                <div className={styles.foodMicros}>
                  {food.iron_mg > 0 && (
                    <span className={styles.micro}>🩸 Fe {food.iron_mg}mg</span>
                  )}
                  {food.calcium_mg > 0 && (
                    <span className={styles.micro}>🦴 Ca {food.calcium_mg}mg</span>
                  )}
                  {food.vitamin_c_mg > 0 && (
                    <span className={styles.micro}>🍋 Vit C {food.vitamin_c_mg}mg</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            className={`btn btn-ghost ${styles.deleteBtn}`}
            onClick={handleDelete}
            disabled={deleting}
            id={`delete-meal-${log.id}`}
          >
            {deleting ? "Removing…" : "🗑️ Remove meal"}
          </button>
        </div>
      )}

      <div className={styles.expandIcon}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function getMealColor(type) {
  const colors = { breakfast: "orange", lunch: "green", dinner: "blue", snack: "blue" };
  return colors[type] || "blue";
}
