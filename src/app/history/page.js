"use client";

import { useEffect, useState, useCallback } from "react";
import CalendarGrid from "@/components/CalendarGrid";
import MealCard from "@/components/MealCard";
import BottomNav from "@/components/BottomNav";
import { formatDate, formatDisplayDate, getToday } from "@/lib/utils";
import { getGoals, getFoodLogsRange, getFoodLogs, deleteFoodLog } from "@/lib/localData";
import styles from "./history.module.css";

export default function HistoryPage() {
  const [dailyData, setDailyData] = useState({});
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [dayLogs, setDayLogs] = useState([]);
  const [loadingCal, setLoadingCal] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [goals, setGoals] = useState({ calorie_goal: 2000 });

  const fetchMonthData = useCallback(() => {
    setLoadingCal(true);
    try {
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      const from = formatDate(threeMonthsAgo);
      const to = formatDate(now);

      const logs = getFoodLogsRange(from, to);

      const grouped = {};
      for (const log of logs) {
        const date = log.logged_at?.split("T")[0];
        if (!date) continue;
        if (!grouped[date]) {
          grouped[date] = { total_calories: 0, total_protein_g: 0, meal_count: 0 };
        }
        grouped[date].total_calories += log.total_calories || 0;
        grouped[date].total_protein_g += log.total_protein_g || 0;
        grouped[date].meal_count += 1;
      }
      setDailyData(grouped);
      setGoals(getGoals());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCal(false);
    }
  }, []);

  const fetchDayLogs = useCallback((date) => {
    setLoadingDay(true);
    try {
      const logs = getFoodLogs(date);
      setDayLogs(logs.sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDay(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthData();
    fetchDayLogs(selectedDate);
  }, []);

  const handleSelectDay = (date) => {
    setSelectedDate(date);
    fetchDayLogs(date);
  };

  const selectedData = dailyData[selectedDate];
  const todayStr = getToday();
  const isToday = selectedDate === todayStr;

  return (
    <div className={styles.page} id="history-page">
      <div className="page-container">
        <div className={styles.header}>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">Your nutrition over time</p>
        </div>

        {/* Calendar */}
        <div className={`glass-card ${styles.calendarCard}`}>
          {loadingCal ? (
            <div style={{ height: 280 }} className="skeleton" />
          ) : (
            <CalendarGrid
              dailyData={dailyData}
              calorieGoal={goals.calorie_goal}
              onSelectDay={handleSelectDay}
            />
          )}
        </div>

        {/* Selected day summary */}
        <div className={styles.daySection}>
          <h2 className={styles.dayTitle}>
            {isToday ? "Today" : formatDisplayDate(selectedDate)}
          </h2>

          {selectedData ? (
            <div className={`glass-card-sm ${styles.daySummary}`}>
              <div className={styles.summaryRow}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryVal}>{Math.round(selectedData.total_calories)}</span>
                  <span className={styles.summaryLabel}>Calories</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                  <span className={styles.summaryVal}>{selectedData.meal_count}</span>
                  <span className={styles.summaryLabel}>Meals</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                  <span className={`${styles.summaryVal} ${getGoalPercent(selectedData.total_calories, goals.calorie_goal) >= 80 ? styles.valGreen : styles.valOrange}`}>
                    {getGoalPercent(selectedData.total_calories, goals.calorie_goal)}%
                  </span>
                  <span className={styles.summaryLabel}>of goal</span>
                </div>
              </div>
            </div>
          ) : !loadingDay ? (
            <div className={styles.emptyDay}>
              <span>📭</span>
              <p>No meals logged on this day</p>
            </div>
          ) : null}

          {/* Day logs */}
          {loadingDay ? (
            <div className="stack">
              <div className="skeleton" style={{ height: 90, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 90, borderRadius: 12 }} />
            </div>
          ) : (
            <div className="stack">
              {dayLogs.map((log) => (
                <MealCard
                  key={log.id}
                  log={log}
                  onDelete={(id) => setDayLogs((prev) => prev.filter((l) => l.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function getGoalPercent(consumed, goal) {
  return Math.min(Math.round((consumed / goal) * 100), 999);
}
