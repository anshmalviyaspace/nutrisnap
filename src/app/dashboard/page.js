"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NutritionRing from "@/components/NutritionRing";
import MacroBar from "@/components/MacroBar";
import MealCard from "@/components/MealCard";
import BottomNav from "@/components/BottomNav";
import { getToday, getGreeting, formatDisplayDate } from "@/lib/utils";
import { getDailySummary, deleteFoodLog } from "@/lib/localData";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = getToday();

  const fetchSummary = useCallback(() => {
    try {
      const data = getDailySummary(today);
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleMealDelete = (id) => {
    deleteFoodLog(id);
    fetchSummary();
  };

  const goals = summary?.goals || { calorie_goal: 2000, protein_goal: 100, carb_goal: 275, fat_goal: 55 };
  const consumed = summary?.total_calories || 0;
  const meals = summary?.meals || [];

  // Sort meals by time
  const sortedMeals = [...meals].sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));

  return (
    <div className={styles.page} id="dashboard-page">
      <div className="page-container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.greeting}>{getGreeting()} 👋</p>
            <h1 className={styles.name}>
              Hey there
            </h1>
            <p className={styles.date}>{formatDisplayDate(today)}</p>
          </div>
          <Link href="/settings" id="settings-btn" className={`btn btn-icon ${styles.settingsBtn}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Calorie ring card */}
            <div className={`glass-card ${styles.ringCard}`}>
              <div className={styles.ringContainer}>
                <NutritionRing
                  consumed={consumed}
                  goal={goals.calorie_goal}
                  size={200}
                  strokeWidth={12}
                />
              </div>
              <div className={styles.ringStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{consumed}</span>
                  <span className={styles.statLabel}>Eaten</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{goals.calorie_goal}</span>
                  <span className={styles.statLabel}>Goal</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={`${styles.statVal} ${styles.mealCount}`}>{meals.length}</span>
                  <span className={styles.statLabel}>Meals</span>
                </div>
              </div>
            </div>

            {/* Macro bars */}
            <div className={`glass-card ${styles.macroCard}`}>
              <p className="section-title">Macros Today</p>
              <div className={styles.macros}>
                <MacroBar
                  label="Protein"
                  current={summary?.total_protein_g || 0}
                  goal={goals.protein_goal}
                  color="blue"
                />
                <MacroBar
                  label="Carbohydrates"
                  current={summary?.total_carbs_g || 0}
                  goal={goals.carb_goal}
                  color="warm"
                />
                <MacroBar
                  label="Fat"
                  current={summary?.total_fat_g || 0}
                  goal={goals.fat_goal}
                  color="green"
                />
                {summary?.total_fiber_g > 0 && (
                  <MacroBar
                    label="Fiber"
                    current={summary.total_fiber_g}
                    goal={30}
                    color="primary"
                  />
                )}
              </div>
            </div>

            {/* Today's meals */}
            <div className={styles.mealsSection}>
              <div className="row-between" style={{ marginBottom: "var(--space-md)" }}>
                <p className="section-title" style={{ margin: 0 }}>
                  Today&apos;s Meals
                </p>
                <Link href="/scan" className="btn btn-sm btn-secondary" id="log-meal-btn">
                  + Log meal
                </Link>
              </div>

              {sortedMeals.length > 0 ? (
                <div className="stack">
                  {sortedMeals.map((meal) => (
                    <MealCard key={meal.id} log={meal} onDelete={handleMealDelete} />
                  ))}
                </div>
              ) : (
                <div className={`glass-card ${styles.emptyMeals}`}>
                  <span className={styles.emptyEmoji}>🍽️</span>
                  <p className={styles.emptyTitle}>No meals logged yet</p>
                  <p className={styles.emptyText}>
                    Take a photo of your food to get started
                  </p>
                  <Link href="/scan" className="btn btn-primary" id="first-scan-btn">
                    📸 Scan your first meal
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="stack">
      <div className="skeleton" style={{ height: 280, borderRadius: "var(--radius-lg)" }} />
      <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />
      <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />
    </div>
  );
}
