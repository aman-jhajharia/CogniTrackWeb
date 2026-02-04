import { useState, useEffect, useContext } from "react";
import { TrackerContext } from "../context/TrackerContext";
import { saveWeekData, loadWeekData } from "../services/firestore";
import { getWeekKey } from "../utils/date";

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}`);

const CATEGORIES = {
  Sleep: "#6366F1",
  Exercise: "#22C55E",
  Study: "#F59E0B",
  Leisure: "#EC4899",
  Projects: "#0EA5E9",
};

function getWeekDates(startDate) {
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TimeTracker() {
  const [weekStart, setWeekStart] = useState(new Date());
  const { weekData, setWeekData } = useContext(TrackerContext);

  const weekKey = getWeekKey(weekStart);
  const weekDates = getWeekDates(weekStart);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 🔄 Load data when week changes
  useEffect(() => {
    async function fetchData() {
      const data = await loadWeekData(weekKey);
      setWeekData(data);
    }
    fetchData();
  }, [weekKey, setWeekData]);

  // 💾 Save automatically on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveWeekData(weekKey, weekData);
    }, 600);

    return () => clearTimeout(timeout);
  }, [weekData, weekKey]);

  const handleChange = (day, hour, value) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [hour]: value,
      },
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Weekly Time Tracker</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() - 7)))}>⬅ Prev</button>
        <button onClick={() => setWeekStart(new Date())} style={{ margin: "0 10px" }}>
          This Week
        </button>
        <button onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() + 7)))}>Next ➡</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "900px" }}>
          <thead>
            <tr>
              <th style={cell}>Hour</th>
              {days.map((day, i) => (
                <th key={day} style={cell}>
                  {day}
                  <br />
                  {weekDates[i].toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td style={cell}>{hour}</td>
                {days.map((day) => {
                  const value = weekData[day]?.[hour] || "";
                  return (
                    <td
                      key={day}
                      style={{
                        ...cell,
                        backgroundColor: value ? CATEGORIES[value] : "#fff",
                      }}
                    >
                      <select
                        value={value}
                        onChange={(e) => handleChange(day, hour, e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value="">Select</option>
                        {Object.keys(CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cell = {
  border: "1px solid #ccc",
  padding: "6px",
  textAlign: "center",
  fontSize: "12px",
};
