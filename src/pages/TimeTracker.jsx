import { useState, useEffect, useContext } from "react";
import { TrackerContext } from "../context/TrackerContext";
import { saveWeekData, loadWeekData } from "../services/firestore";
import { getWeekKey } from "../utils/date";
import { ChevronLeft, ChevronRight, ChevronDown, Clock, Activity, Moon } from "lucide-react";
import "../styles/TimeTracker.css";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const start = i.toString().padStart(2, '0') + ':00';
  const end = (i + 1).toString().padStart(2, '0') + ':00';
  return `${start} - ${end}`;
});

const CATEGORIES = [
  { id: "None", label: "Select...", className: "cat-none", color: "transparent" },
  { id: "Rest", label: "Rest", className: "cat-rest", color: "#0284c7" },
  { id: "Work", label: "Work", className: "cat-work", color: "#6a1b9a" },
  { id: "Health", label: "Health", className: "cat-health", color: "#15803d" },
  { id: "Personal", label: "Personal", className: "cat-personal", color: "#ea580c" },
  { id: "Learning", label: "Learning", className: "cat-learning", color: "#4338ca" }
];

function getWeekDates(startDate) {
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const getCategoryClass = (catId) => {
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat.className : "cat-none";
};

const getRowClass = (catId) => {
  if (catId === "None" || !catId) return "";
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat.className : "";
};

const getCategoryColor = (catId) => {
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat.color : "transparent";
};

export default function TimeTracker() {
  const [weekStart, setWeekStart] = useState(new Date());
  const [activeDayIdx, setActiveDayIdx] = useState((new Date().getDay() || 7) - 1); // 0 = Mon, 6 = Sun
  const [saveStatus, setSaveStatus] = useState("Saved");
  const { weekData, setWeekData } = useContext(TrackerContext);

  const weekKey = getWeekKey(weekStart);
  const weekDates = getWeekDates(weekStart);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Load data when week changes
  useEffect(() => {
    async function fetchData() {
      const data = await loadWeekData(weekKey);
      setWeekData(data);
    }
    fetchData();
  }, [weekKey, setWeekData]);

  // Save automatically on change (debounced)
  useEffect(() => {
    if (Object.keys(weekData).length === 0) return;
    setSaveStatus("Saving...");
    const timeout = setTimeout(() => {
      saveWeekData(weekKey, weekData).then(() => {
        setSaveStatus("Autosaved just now");
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [weekData, weekKey]);

  const handleChange = (hourIdx, field, value) => {
    const dayName = days[activeDayIdx];

    setWeekData((prev) => {
      const dayData = prev[dayName] || {};
      let hourData = dayData[hourIdx];

      // Handle backwards compatibility (legacy strings)
      if (typeof hourData === "string") {
        hourData = { category: hourData, description: "" };
      }
      if (!hourData) {
        hourData = { category: "None", description: "" };
      }

      return {
        ...prev,
        [dayName]: {
          ...dayData,
          [hourIdx]: { ...hourData, [field]: value },
        },
      };
    });
  };

  const clearDay = () => {
    const dayName = days[activeDayIdx];
    setWeekData((prev) => {
      const newData = { ...prev };
      delete newData[dayName];
      return newData;
    });
  };

  const getWeekRangeLabel = () => {
    const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const activeDayName = days[activeDayIdx];

  // Calculate summaries for the selected day
  let totalWorkHours = 0;
  let totalRestHours = 0;
  let loggedHours = 0;

  const currentDayData = weekData[activeDayName] || {};
  Object.values(currentDayData).forEach(hour => {
    const cat = typeof hour === 'string' ? hour : hour.category;
    if (cat === 'Work' || cat === 'Learning') totalWorkHours++;
    if (cat === 'Rest') totalRestHours++;
    if (cat && cat !== 'None') loggedHours++;
  });

  const prodScore = loggedHours > 0 ? Math.round((totalWorkHours / loggedHours) * 100) : 0;
  const sleepConsistency = Math.min(Math.round((totalRestHours / 8) * 100), 100); // Expected ~8h per day

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <div>
          <h1 className="tracker-title">Weekly Activity Log</h1>
          <p className="tracker-subtitle">Pure, distraction-free time tracking for peak performance.</p>
        </div>
        <div className="week-selector">
          <button className="week-btn" onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() - 7)))}>
            <ChevronLeft size={20} />
          </button>
          <span className="week-label">{getWeekRangeLabel()}</span>
          <button className="week-btn" onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() + 7)))}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="tracker-card">
        <div className="days-tabs">
          {days.map((day, i) => (
            <button
              key={day}
              className={`day-tab ${activeDayIdx === i ? "active" : ""}`}
              onClick={() => setActiveDayIdx(i)}
            >
              <div className="day-name">{day}</div>
              <div className="day-date">{weekDates[i].getDate()}</div>
            </button>
          ))}
        </div>

        <table className="log-table">
          <thead>
            <tr>
              <th>TIME</th>
              <th>ACTIVITY DESCRIPTION</th>
              <th>CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hourLabel, i) => {
              const hmStr = `${i}-${i + 1}`; // Map to old legacy format for db keys to prevent breaking
              const rawData = weekData[activeDayName]?.[hmStr];

              // Handle legacy format strings natively without breaking UI
              let category = "None";
              let description = "";
              if (typeof rawData === "string") {
                category = rawData;
              } else if (rawData) {
                category = rawData.category || "None";
                description = rawData.description || "";
              }

              return (
                <tr className={`log-row ${getRowClass(category)}`} key={i} style={{ borderLeft: `4px solid ${getCategoryColor(category)}` }}>
                  <td className="log-cell time-range">{hourLabel}</td>
                  <td className="log-cell">
                    <input
                      type="text"
                      className="activity-input"
                      placeholder="What did you do?"
                      value={description}
                      onChange={(e) => handleChange(hmStr, "description", e.target.value)}
                    />
                  </td>
                  <td className="log-cell">
                    <div className="category-select-wrapper">
                      <select
                        className={`category-select ${getCategoryClass(category)}`}
                        value={category}
                        onChange={(e) => handleChange(hmStr, "category", e.target.value)}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id} className={cat.className}>{cat.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="tracker-footer">
          <span className="autosave-text">{saveStatus}</span>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={clearDay}>Clear Day</button>
            <button className="btn-primary" onClick={() => setSaveStatus("Log Finalized!")}>Finalize Log</button>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>
            <Activity size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">TOTAL FOCUSED</span>
            <span className="summary-value">{totalWorkHours} Hours</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
            <Clock size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">PRODUCTIVITY SCORE</span>
            <span className="summary-value">{prodScore} / 100</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
            <Moon size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-label">SLEEP CONSISTENCY</span>
            <span className="summary-value">{sleepConsistency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
