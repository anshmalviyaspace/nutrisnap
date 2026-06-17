"use client";

import { useState } from "react";
import styles from "./EditMealModal.module.css";

export default function EditMealModal({ meal, onClose, onSave }) {
  const [prompt, setPrompt] = useState("");
  const [foods, setFoods] = useState(meal.food_items ? [...meal.food_items] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (index, newQuantity) => {
    const newFoods = [...foods];
    newFoods[index] = { ...newFoods[index], quantity: newQuantity };
    setFoods(newFoods);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    let finalPrompt = "";
    if (prompt.trim()) {
      finalPrompt += `User Instructions: ${prompt}\n\n`;
    }
    
    // Always tell the AI what the current quantities in the UI are
    finalPrompt += "The user has manually set the food quantities to the following in the UI. Ensure these exact quantities are used and recalculate the macros for them:\n";
    foods.forEach(f => {
      finalPrompt += `- ${f.name}: ${f.quantity}\n`;
    });

    try {
      const res = await fetch("/api/edit-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalMeal: meal, userPrompt: finalPrompt }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a minute.");
        }
        throw new Error("Failed to edit meal");
      }
      const updatedMeal = await res.json();
      onSave(updatedMeal);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Meal</h2>
          <button className="btn btn-icon" onClick={onClose} disabled={loading}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Manual Quantity Adjustments</h3>
            <div className={styles.foodList}>
              {foods.map((food, idx) => (
                <div key={idx} className={styles.foodItem}>
                  <div className={styles.foodName}>{food.name}</div>
                  <input 
                    type="text" 
                    value={food.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    className={styles.quantityInput}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Adjustments (Optional)</h3>
            <p className={styles.hint}>Tell the AI to add/remove items, or specify cooking methods.</p>
            <textarea
              className={styles.aiInput}
              placeholder="e.g. I didn't eat the samosa, and everything was cooked in ghee."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Recalculating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
