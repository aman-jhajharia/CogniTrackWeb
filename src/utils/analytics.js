export function calculateDailyTotals(dayData) {
  const totals = {};

  Object.values(dayData || {}).forEach((hourData) => {
    if (!hourData) return;
    const category = typeof hourData === 'string' ? hourData : hourData.category;
    if (!category || category === "None") return;
    totals[category] = (totals[category] || 0) + 1;
  });

  return totals;
}

export function calculateWeeklyTotals(weekData) {
  const totals = {};

  Object.values(weekData || {}).forEach((day) => {
    Object.values(day || {}).forEach((hourData) => {
      if (!hourData) return;
      const category = typeof hourData === 'string' ? hourData : hourData.category;
      if (!category || category === "None") return;
      totals[category] = (totals[category] || 0) + 1;
    });
  });

  return totals;
}

export function calculateMonthlyTotals(monthWeeks) {
  const totals = {};

  monthWeeks.forEach((week) => {
    Object.values(week).forEach((day) => {
      Object.values(day || {}).forEach((hourData) => {
        if (!hourData) return;
        const category = typeof hourData === 'string' ? hourData : hourData.category;
        if (!category || category === "None") return;
        totals[category] = (totals[category] || 0) + 1;
      });
    });
  });

  return totals;
}
