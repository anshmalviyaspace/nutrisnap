"use client";

import styles from "./MacroBar.module.css";

export default function MacroBar({
  label,
  current = 0,
  goal = 100,
  unit = "g",
  color = "primary",
}) {
  const percentage = Math.min((current / goal) * 100, 100);

  const colorMap = {
    primary: styles.fillPrimary,
    green: styles.fillGreen,
    warm: styles.fillWarm,
    blue: styles.fillBlue,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {Math.round(current * 10) / 10}
          <span className={styles.unit}>
            {" "}
            / {goal}
            {unit}
          </span>
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${colorMap[color] || colorMap.primary}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
