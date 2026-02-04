import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DEFAULT_CATEGORIES = [
  "Sleep",
  "Exercise",
  "Study",
  "Leisure",
  "Projects",
];

export default function TimeTracker() {
  const [slots, setSlots] = useState({});

  const handleChange = (hour, value) => {
    setSlots((prev) => ({
      ...prev,
      [hour]: value,
    }));
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Time Tracker</h2>
      <p>Track how you spent each hour of your day</p>

      <div style={{ marginTop: "20px" }}>
        {HOURS.map((hour) => (
          <div
            key={hour}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ width: "90px" }}>
              {hour}:00 – {hour + 1}:00
            </span>

            <select
              value={slots[hour] || ""}
              onChange={(e) => handleChange(hour, e.target.value)}
            >
              <option value="">Select</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button style={{ marginTop: "20px" }}>
        Save Day
      </button>
    </div>
  );
}
