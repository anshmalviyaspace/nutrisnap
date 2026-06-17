export const getGoals = () => {
  if (typeof window === 'undefined') return { calorie_goal: 2000, protein_goal: 100, carb_goal: 275, fat_goal: 55 };
  const val = localStorage.getItem('ft_goals');
  return val ? JSON.parse(val) : { calorie_goal: 2000, protein_goal: 100, carb_goal: 275, fat_goal: 55 };
};

export const saveGoals = (goals) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ft_goals', JSON.stringify(goals));
};

export const getFoodLogs = (dateStr) => {
  if (typeof window === 'undefined') return [];
  const val = localStorage.getItem('ft_logs');
  const allLogs = val ? JSON.parse(val) : [];
  
  if (dateStr) {
    return allLogs.filter(log => log.logged_at.startsWith(dateStr));
  }
  return allLogs;
};

export const getFoodLogsRange = (fromStr, toStr) => {
  if (typeof window === 'undefined') return [];
  const val = localStorage.getItem('ft_logs');
  const allLogs = val ? JSON.parse(val) : [];
  
  return allLogs.filter(log => {
    const logDate = log.logged_at.split('T')[0];
    return logDate >= fromStr && logDate <= toStr;
  });
};

export const saveFoodLog = (log) => {
  if (typeof window === 'undefined') return;
  const val = localStorage.getItem('ft_logs');
  let allLogs = val ? JSON.parse(val) : [];
  
  const newLog = {
    ...log,
    id: log.id || Date.now().toString(),
    logged_at: log.logged_at || new Date().toISOString()
  };
  
  allLogs.push(newLog);
  
  // Keep only the last 100 logs to prevent localStorage quota exceeded
  if (allLogs.length > 100) {
    allLogs = allLogs.slice(allLogs.length - 100);
  }
  
  localStorage.setItem('ft_logs', JSON.stringify(allLogs));
  return newLog;
};

export const deleteFoodLog = (id) => {
  if (typeof window === 'undefined') return;
  const val = localStorage.getItem('ft_logs');
  let allLogs = val ? JSON.parse(val) : [];
  allLogs = allLogs.filter(log => log.id !== id);
  localStorage.setItem('ft_logs', JSON.stringify(allLogs));
};

export const updateFoodLog = (id, updatedMeal) => {
  if (typeof window === 'undefined') return;
  const val = localStorage.getItem('ft_logs');
  let allLogs = val ? JSON.parse(val) : [];
  allLogs = allLogs.map(log => log.id === id ? { ...log, ...updatedMeal } : log);
  localStorage.setItem('ft_logs', JSON.stringify(allLogs));
  return updatedMeal;
};

export const getDailySummary = (dateStr) => {
  const logs = getFoodLogs(dateStr);
  const goals = getGoals();
  
  const summary = logs.reduce(
    (acc, m) => ({
      total_calories: acc.total_calories + (m.total_calories || 0),
      total_protein_g: acc.total_protein_g + (m.total_protein_g || 0),
      total_carbs_g: acc.total_carbs_g + (m.total_carbs_g || 0),
      total_fat_g: acc.total_fat_g + (m.total_fat_g || 0),
      total_fiber_g: acc.total_fiber_g + (m.total_fiber_g || 0),
    }),
    { total_calories: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0, total_fiber_g: 0 }
  );
  
  return {
    ...summary,
    goals,
    meals: logs
  };
};

export const getWeeklySummary = () => {
  // Generate last 7 days
  const daily = [];
  const today = new Date();
  
  let totalCalories = 0;
  let totalProtein = 0;
  let activeDays = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Day label: "Mon", "Tue" etc, except today is "Today"
    let dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (i === 0) dayLabel = 'Today';
    
    const summary = getDailySummary(dateStr);
    
    if (summary.meals.length > 0) activeDays++;
    totalCalories += summary.total_calories;
    totalProtein += summary.total_protein_g;
    
    daily.push({
      date: dateStr,
      day_label: dayLabel,
      total_calories: Math.round(summary.total_calories),
      total_protein_g: Math.round(summary.total_protein_g),
    });
  }
  
  const averages = {
    calories: activeDays > 0 ? Math.round(totalCalories / activeDays) : 0,
    protein_g: activeDays > 0 ? Math.round(totalProtein / activeDays) : 0,
  };
  
  return {
    daily,
    goals: getGoals(),
    averages,
    active_days: activeDays,
  };
};
