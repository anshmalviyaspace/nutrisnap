"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";
import { getWeeklySummary } from "@/lib/localData";
import styles from "./insights.module.css";

// WeeklyChart uses Recharts which needs client-side rendering
const WeeklyChart = dynamic(() => import("@/components/WeeklyChart"), { ssr: false });

export default function InsightsPage() {
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = getWeeklySummary();
      setWeekData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const daily = weekData?.daily || [];
  const goals = weekData?.goals || { calorie_goal: 2000, protein_goal: 100 };
  const avgs = weekData?.averages || { calories: 0, protein_g: 0 };
  const activeDays = weekData?.active_days || 0;

  // Micronutrient totals across the week (summed from all logs would need more data,
  // so we show averages from available data)
  const avgCalPercent = goals.calorie_goal > 0 ? Math.round((avgs.calories / goals.calorie_goal) * 100) : 0;

  return (
    <div className={styles.page} id="insights-page">
      <div className="page-container">
        <div className={styles.header}>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">Your last 7 days</p>
        </div>

        {loading ? (
          <div className="stack">
            <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          </div>
        ) : (
          <>
            {/* Weekly chart card */}
            <div className={`glass-card ${styles.chartCard}`}>
              <div className={styles.chartHeader}>
                <p className="section-title" style={{ margin: 0 }}>Calories This Week</p>
                <span className={styles.goalLine}>— {goals.calorie_goal} goal</span>
              </div>
              <WeeklyChart data={daily} calorieGoal={goals.calorie_goal} />
            </div>

            {/* Summary stats row */}
            <div className={styles.statsGrid}>
              <StatCard
                icon="🔥"
                label="Avg Daily"
                value={avgs.calories}
                unit="kcal"
                highlight={avgCalPercent >= 80}
              />
              <StatCard
                icon="💪"
                label="Avg Protein"
                value={avgs.protein_g}
                unit="g/day"
                highlight={avgs.protein_g >= goals.protein_goal * 0.8}
              />
              <StatCard
                icon="📅"
                label="Active Days"
                value={activeDays}
                unit="/ 7"
                highlight={activeDays >= 5}
              />
              <StatCard
                icon="🎯"
                label="Goal Hit"
                value={avgCalPercent}
                unit="%"
                highlight={avgCalPercent >= 80}
              />
            </div>

            {/* Daily breakdown */}
            <div className={`glass-card ${styles.breakdownCard}`}>
              <p className="section-title">Daily Breakdown</p>
              <div className={styles.breakdownList}>
                {daily.map((day, i) => (
                  <div key={i} className={styles.breakdownRow}>
                    <span className={styles.breakdownDay}>{day.day_label}</span>
                    <div className={styles.breakdownBarWrap}>
                      <div
                        className={styles.breakdownBar}
                        style={{
                          width: `${Math.min((day.total_calories / (goals.calorie_goal * 1.3)) * 100, 100)}%`,
                          background: getBarColor(day.total_calories, goals.calorie_goal),
                        }}
                      />
                    </div>
                    <span className={styles.breakdownVal}>
                      {day.total_calories > 0 ? `${day.total_calories}` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition tip */}
            <div className={`glass-card ${styles.tipCard}`}>
              <div className={styles.tipIcon}>💡</div>
              <div>
                <p className={styles.tipTitle}>Nutrition Insight</p>
                <p className={styles.tipText}>{getTip(avgCalPercent, avgs.protein_g, goals.protein_goal)}</p>
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value, unit, highlight }) {
  return (
    <div className={`${styles.statCard} glass-card-sm`}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={`${styles.statVal} ${highlight ? styles.statHighlight : ""}`}>
        {value}
        <span className={styles.statUnit}>{unit}</span>
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function getBarColor(calories, goal) {
  if (calories === 0) return "rgba(255,255,255,0.06)";
  const pct = calories / goal;
  if (pct >= 0.9 && pct <= 1.2) return "var(--accent-green)";
  if (pct > 1.2) return "var(--accent-red)";
  return "var(--accent-primary)";
}

function getTip(calPct, protein, proteinGoal) {
  if (calPct < 50) return "You're consistently eating well below your calorie goal. Make sure you're fueling your body adequately — consistent under-eating can slow metabolism.";
  if (calPct > 115) return "You're consistently going over your calorie goal. Try being mindful of portion sizes, especially with ghee and oil in cooking.";
  if (protein < proteinGoal * 0.7) return "Your protein intake seems low. Try adding more dal, paneer, eggs, chicken, or Greek yogurt to hit your daily protein goal.";
  return "You're doing great! Staying consistent with calorie tracking is the biggest predictor of nutrition success. Keep it up! 💪";
}
