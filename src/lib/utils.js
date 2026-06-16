/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

/**
 * Format a date for display
 */
export function formatDisplayDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Format time for display
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get today's date as YYYY-MM-DD in local timezone
 */
export function getToday() {
  const now = new Date();
  return formatDate(now);
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Suggest meal type based on time of day
 */
export function suggestMealType() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "snack";
  return "dinner";
}

/**
 * Get calorie status color
 */
export function getCalorieStatus(consumed, goal) {
  const pct = (consumed / goal) * 100;
  if (pct >= 120) return "over";
  if (pct >= 90) return "good";
  if (pct >= 60) return "moderate";
  return "low";
}

/**
 * Get calendar day status
 */
export function getDayStatus(consumed, goal) {
  if (!consumed) return "empty";
  const pct = (consumed / goal) * 100;
  if (pct >= 80 && pct <= 120) return "good";
  if (pct >= 60) return "moderate";
  return "low";
}

/**
 * Meal type emoji
 */
export function getMealEmoji(type) {
  const emojis = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍿",
  };
  return emojis[type] || "🍽️";
}

/**
 * Meal type label
 */
export function getMealLabel(type) {
  const labels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };
  return labels[type] || "Meal";
}

/**
 * Round to 1 decimal
 */
export function round1(num) {
  return Math.round(num * 10) / 10;
}

/**
 * Get days in a month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get day of week for first day of month (0 = Sunday)
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
