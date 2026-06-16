"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getGoals, saveGoals } from "@/lib/localData";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    calorie_goal: 2000,
    protein_goal: 100,
    carb_goal: 275,
    fat_goal: 55,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getGoals());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveGoals(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const update = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  return (
    <div className={styles.page} id="settings-page">
      <div className="page-container">
        <div className={styles.header}>
          <h1 className="page-title">Settings</h1>
        </div>

        {/* Profile */}
        <div className={`glass-card ${styles.section}`}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              <span className={styles.avatarEmoji}>👤</span>
            </div>
            <div>
              <p className={styles.userName}>Local User</p>
              <p className={styles.userEmail}>Data saved on device</p>
            </div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className={`glass-card ${styles.section}`}>
          <p className="section-title">Daily Goals</p>
          <div className="stack">
            <GoalInput
              label="🔥 Calories"
              value={profile.calorie_goal}
              unit="kcal"
              min={1000}
              max={5000}
              step={50}
              onChange={(v) => update("calorie_goal", v)}
            />
            <GoalInput
              label="💪 Protein"
              value={profile.protein_goal}
              unit="g"
              min={30}
              max={300}
              step={5}
              onChange={(v) => update("protein_goal", v)}
            />
            <GoalInput
              label="🌾 Carbohydrates"
              value={profile.carb_goal}
              unit="g"
              min={50}
              max={600}
              step={10}
              onChange={(v) => update("carb_goal", v)}
            />
            <GoalInput
              label="🥑 Fat"
              value={profile.fat_goal}
              unit="g"
              min={20}
              max={200}
              step={5}
              onChange={(v) => update("fat_goal", v)}
            />
          </div>

          <p className={styles.macroCalc}>
            = {(profile.protein_goal * 4) + (profile.carb_goal * 4) + (profile.fat_goal * 9)} kcal from macros
          </p>

          <button
            className={`btn btn-primary btn-full ${styles.saveBtn}`}
            onClick={handleSave}
            disabled={saving}
            id="save-goals-btn"
          >
            {saving ? <><div className="spinner spinner-sm" /> Saving…</> : saved ? "✓ Saved!" : "Save Goals"}
          </button>
        </div>

        {/* About */}
        <div className={`glass-card ${styles.section}`}>
          <p className="section-title">About</p>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>App</span>
            <span className={styles.aboutVal}>NutriSnap v1.0</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>AI Model</span>
            <span className={styles.aboutVal}>Gemini 2.0 Flash</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Storage</span>
            <span className={styles.aboutVal}>Local Storage</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function GoalInput({ label, value, unit, min, max, step, onChange }) {
  return (
    <div className={styles.goalInput}>
      <div className={styles.goalLabel}>
        <span>{label}</span>
        <span className={styles.goalUnit}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.sliderRange}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
