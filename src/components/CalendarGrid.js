"use client";

import { useState } from "react";
import { getDaysInMonth, getFirstDayOfMonth, getDayStatus, formatDate } from "@/lib/utils";
import styles from "./CalendarGrid.module.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function CalendarGrid({ dailyData = {}, calorieGoal = 2000, onSelectDay }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(formatDate(today));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDay(dateStr);
    onSelectDay?.(dateStr);
  };

  const todayStr = formatDate(today);
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const canGoNext = !isCurrentMonth;

  return (
    <div className={styles.container} id="calendar-grid">
      {/* Month navigation */}
      <div className={styles.nav}>
        <button className="btn btn-icon" onClick={prevMonth} id="prev-month-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.monthYear}>
          <span className={styles.month}>{MONTHS[viewMonth]}</span>
          <span className={styles.year}>{viewYear}</span>
        </div>
        <button className="btn btn-icon" onClick={nextMonth} disabled={!canGoNext} id="next-month-btn"
          style={{ opacity: canGoNext ? 1 : 0.3 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className={styles.grid}>
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyCell} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayData = dailyData[dateStr];
          const status = dayData ? getDayStatus(dayData.total_calories, calorieGoal) : "empty";
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDay;
          const isFuture = dateStr > todayStr;

          return (
            <button
              key={day}
              className={`${styles.dayCell} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""} ${isFuture ? styles.future : ""}`}
              onClick={() => !isFuture && handleDayClick(day)}
              disabled={isFuture}
              id={`cal-day-${dateStr}`}
            >
              <span className={styles.dayNum}>{day}</span>
              {!isFuture && status !== "empty" && (
                <div className={`${styles.statusDot} ${styles[`dot${capitalize(status)}`]}`} />
              )}
              {!isFuture && dayData && (
                <span className={styles.dayCal}>{Math.round(dayData.total_calories / 100) * 100}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.dotGood}`} />
          <span>On track</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.dotModerate}`} />
          <span>Low intake</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.dotLow}`} />
          <span>Under 60%</span>
        </div>
      </div>
    </div>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
