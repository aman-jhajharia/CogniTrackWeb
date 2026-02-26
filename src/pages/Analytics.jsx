import { useContext } from "react";
import { TrackerContext } from "../context/TrackerContext";
import { calculateWeeklyTotals } from "../utils/analytics";
import { Activity, BookOpen, HeartPulse, BrainCircuit, Coffee, Zap, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import "../styles/Analytics.css";

const CATEGORIES = [
  { id: "Rest", label: "Rest", color: "#0284c7", icon: Coffee },
  { id: "Work", label: "Work", color: "#6a1b9a", icon: Activity },
  { id: "Health", label: "Health", color: "#15803d", icon: HeartPulse },
  { id: "Personal", label: "Personal", color: "#ea580c", icon: HeartPulse }, // Can map personal to something else
  { id: "Learning", label: "Learning", color: "#4338ca", icon: BookOpen }
];

export default function Analytics() {
  const { weekData } = useContext(TrackerContext);

  const weeklyTotals = calculateWeeklyTotals(weekData);
  const totalHours = Object.values(weeklyTotals).reduce((a, b) => a + b, 0);

  // Helper for dynamic insights
  const studyHours = (weeklyTotals.Learning || 0) + (weeklyTotals.Study || 0); // Handle old string 'Study' vs new 'Learning'
  const restHours = (weeklyTotals.Rest || 0) + (weeklyTotals.Sleep || 0); // Handle old string 'Sleep' vs new 'Rest'
  const healthHours = (weeklyTotals.Health || 0) + (weeklyTotals.Exercise || 0); // Handle old string 'Exercise' vs new 'Health'
  const workHours = (weeklyTotals.Work || 0) + (weeklyTotals.Projects || 0);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Deep dive into your time allocation and performance trends.</p>
      </div>

      <h3 className="analytics-section-title">Weekly Breakdown</h3>

      <div className="chart-cards">
        {CATEGORIES.map((cat) => {
          // Fallback to legacy keys if the new keys are empty just to accurately display total logged hours
          let rawHrs = weeklyTotals[cat.id] || 0;
          if (cat.id === "Rest" && !rawHrs) rawHrs += weeklyTotals["Sleep"] || 0;
          if (cat.id === "Learning" && !rawHrs) rawHrs += weeklyTotals["Study"] || 0;
          if (cat.id === "Health" && !rawHrs) rawHrs += weeklyTotals["Exercise"] || 0;
          if (cat.id === "Work" && !rawHrs) rawHrs += weeklyTotals["Projects"] || 0;
          if (cat.id === "Personal" && !rawHrs) rawHrs += weeklyTotals["Leisure"] || 0;

          const percent = totalHours > 0 ? ((rawHrs / totalHours) * 100).toFixed(1) : 0;
          const IconComponent = cat.icon;

          return (
            <div key={cat.id} className="cat-card">
              <div className="cat-card-accent" style={{ backgroundColor: cat.color }} />
              <div className="cat-header">
                <span className="cat-name">{cat.label}</span>
                <div className="cat-icon" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  <IconComponent size={20} />
                </div>
              </div>

              <div className="cat-stats">
                <span className="cat-hours">{rawHrs}</span>
                <span className="cat-label">hrs</span>
              </div>

              <div className="cat-percent" style={{ color: cat.color }}>
                <TrendingUp size={14} />
                {percent}% of tracked time
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="analytics-section-title">Smart Insights</h3>
      <ul className="insights-list">
        {studyHours < 10 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>Learning Deficit:</strong> You've mapped less than 10 hours for learning or studying this week. Try block-scheduling focus sessions.</span>
          </li>
        ) : (
          <li className="insight-item">
            <div className="insight-icon insight-good"><CheckCircle2 size={20} /></div>
            <span><strong>Great Focus:</strong> You've logged excellent study/learning time this week!</span>
          </li>
        )}

        {restHours < 42 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>Sleep Debt Warning:</strong> You're averaging less than 6 hours of rest per night. Prioritize recovery!</span>
          </li>
        ) : (
          <li className="insight-item">
            <div className="insight-icon insight-good"><CheckCircle2 size={20} /></div>
            <span><strong>Well Rested:</strong> Excellent sleep hygiene. You're maintaining a healthy recovery cycle.</span>
          </li>
        )}

        {healthHours >= 5 ? (
          <li className="insight-item">
            <div className="insight-icon insight-good"><Zap size={20} /></div>
            <span><strong>Active Lifestyle:</strong> Fantastic exercise consistency! You've successfully integrated health into your routine.</span>
          </li>
        ) : (
          <li className="insight-item">
            <div className="insight-icon insight-info"><Activity size={20} /></div>
            <span><strong>Movement Recommendation:</strong> Try to slot in a few more active health hours to hit optimal performance.</span>
          </li>
        )}
      </ul>
    </div>
  );
}
