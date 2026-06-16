"use client";

import { useEffect, useRef } from "react";
import styles from "./NutritionRing.module.css";

export default function NutritionRing({
  consumed = 0,
  goal = 2000,
  size = 200,
  strokeWidth = 12,
  label = "kcal",
}) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((consumed / goal) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(goal - consumed, 0);

  // Determine color based on percentage
  let gradientId = "ringGradientGreen";
  let glowClass = styles.glowGreen;
  if (percentage >= 120) {
    gradientId = "ringGradientRed";
    glowClass = styles.glowRed;
  } else if (percentage >= 90) {
    gradientId = "ringGradientGreen";
    glowClass = styles.glowGreen;
  } else if (percentage >= 60) {
    gradientId = "ringGradientBlue";
    glowClass = styles.glowBlue;
  } else {
    gradientId = "ringGradientBlue";
    glowClass = styles.glowBlue;
  }

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = circumference;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          circleRef.current.style.strokeDashoffset = offset;
        });
      });
    }
  }, [offset, circumference]);

  return (
    <div className={styles.container} id="calorie-ring">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
      >
        <defs>
          <linearGradient id="ringGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e676" />
            <stop offset="100%" stopColor="#69f0ae" />
          </linearGradient>
          <linearGradient id="ringGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#448aff" />
            <stop offset="100%" stopColor="#6c63ff" />
          </linearGradient>
          <linearGradient id="ringGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="100%" stopColor="#ff9100" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={`${styles.progressCircle} ${glowClass}`}
          filter="url(#glow)"
        />
      </svg>
      <div className={styles.centerContent}>
        <span className={styles.remaining}>{remaining}</span>
        <span className={styles.label}>{label} left</span>
        <span className={styles.consumed}>
          {consumed} / {goal}
        </span>
      </div>
    </div>
  );
}
