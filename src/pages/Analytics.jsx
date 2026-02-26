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
        <h1 className="analytics-title">Analytics</h1>
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
        {studyHours === 0 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>No Learning Logged:</strong> You haven't tracked any learning or study time yet this week. Consider setting aside even 30 minutes a day to build a habit.</span>
          </li>
        ) : studyHours < 5 ? (
          <li className="insight-item">
            <div className="insight-icon insight-info"><BookOpen size={20} /></div>
            <span><strong>Learning Starter:</strong> You've mapped {studyHours} hours for learning this week. Try block-scheduling focus sessions to increase this.</span>
          </li>
        ) : (
          <li className="insight-item">
            <div className="insight-icon insight-good"><CheckCircle2 size={20} /></div>
            <span><strong>Great Focus:</strong> You've logged a solid {studyHours} hours of study/learning time this week!</span>
          </li>
        )}

        {totalHours > 0 && restHours === 0 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>Missing Rest Data:</strong> You've tracked {totalHours} total hours but haven't logged any rest or sleep. Ensure you are logging downtime for accurate metrics.</span>
          </li>
        ) : restHours > 0 && restHours < 42 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>Sleep Debt Warning:</strong> You're averaging less than 6 hours per night (total: {restHours}h). Prioritize recovery!</span>
          </li>
        ) : restHours >= 42 && restHours <= 63 ? (
          <li className="insight-item">
            <div className="insight-icon insight-good"><CheckCircle2 size={20} /></div>
            <span><strong>Well Rested:</strong> Excellent sleep hygiene ({restHours}h total). You're maintaining a healthy recovery cycle.</span>
          </li>
        ) : restHours > 63 ? (
          <li className="insight-item">
            <div className="insight-icon insight-info"><Coffee size={20} /></div>
            <span><strong>High Rest Time:</strong> You've logged {restHours} hours of rest. Make sure this aligns with your goals and energy needs.</span>
          </li>
        ) : null}

        {healthHours === 0 ? (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><Activity size={20} /></div>
            <span><strong>No Activity Logged:</strong> Try to slot in a few active health hours this week to hit optimal physical performance.</span>
          </li>
        ) : healthHours < 3 ? (
          <li className="insight-item">
            <div className="insight-icon insight-info"><Activity size={20} /></div>
            <span><strong>Movement Recommendation:</strong> You've logged {healthHours} hours of exercise. Aim for at least 3-5 hours a week for optimal well-being.</span>
          </li>
        ) : (
          <li className="insight-item">
            <div className="insight-icon insight-good"><Zap size={20} /></div>
            <span><strong>Active Lifestyle:</strong> Fantastic exercise consistency ({healthHours}h)! You've successfully integrated health into your routine.</span>
          </li>
        )}

        {workHours > 50 && (
          <li className="insight-item">
            <div className="insight-icon insight-warn"><AlertCircle size={20} /></div>
            <span><strong>Burnout Risk:</strong> You've logged {workHours} hours of work/projects. Ensure you are balancing this with adequate rest and personal time to avoid burnout.</span>
          </li>
        )}
      </ul>
    </div>
  );
}
