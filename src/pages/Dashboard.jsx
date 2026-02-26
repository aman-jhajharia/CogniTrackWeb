import { auth } from "../services/firebase";
import {
  Clock, Zap, FolderOpen, CheckCircle2,
  Palette, Code2, FileBarChart2, Mail, ChevronRight
} from "lucide-react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const user = auth.currentUser;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}!</h1>
        <p className="dashboard-subtitle">Here's a summary of your performance and ongoing projects for today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper"><Clock size={24} /></div>
            {/* <span className="stat-badge badge-positive">+12%</span> */}
          </div>
          <div className="stat-label">Total Time Tracked</div>
          <h2 className="stat-value">124h 30m</h2>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper"><Zap size={24} /></div>
            {/* <span className="stat-badge badge-positive">+5%</span> */}
          </div>
          <div className="stat-label">Productivity Score</div>
          <h2 className="stat-value">88%</h2>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper"><FolderOpen size={24} /></div>
            {/* <span className="stat-badge badge-negative">-2%</span> */}
          </div>
          <div className="stat-label">Active Projects</div>
          <h2 className="stat-value">12</h2>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper"><CheckCircle2 size={24} /></div>
            {/* <span className="stat-badge badge-positive">+10%</span> */}
          </div>
          <div className="stat-label">Pending Tasks</div>
          <h2 className="stat-value">7</h2>
        </div>
      </div>

      <div className="middle-grid">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Weekly Activity</h3>
              <p className="card-subtitle">Focus hours over the last 7 days</p>
            </div>
            <div>
              <span className="chart-stats-value">42h</span>
              {/* <span className="chart-stats-badge">+8%</span> */}
            </div>
          </div>
          <div className="chart-placeholder">
            <span className="chart-col">Mon</span>
            <span className="chart-col">Tue</span>
            <span className="chart-col">Wed</span>
            <span className="chart-col">Thu</span>
            <span className="chart-col">Fri</span>
            <span className="chart-col">Sat</span>
            <span className="chart-col">Sun</span>
          </div>
        </div>

        <div className="list-card">
          <div className="card-header">
            <h3 className="card-title">Recent Tasks</h3>
            <span className="view-all-link">View All</span>
          </div>
          <div className="task-list">
            <div className="task-item">
              <div className="task-item-left">
                <div className="task-icon task-icon-blue"><Palette size={20} /></div>
                <div className="task-info">
                  <span className="task-name">UI Design System</span>
                  <span className="task-due">Due in 2 days</span>
                </div>
              </div>
              <ChevronRight size={18} className="task-chevron" />
            </div>

            <div className="task-item">
              <div className="task-item-left">
                <div className="task-icon task-icon-purple"><Code2 size={20} /></div>
                <div className="task-info">
                  <span className="task-name">API Integration</span>
                  <span className="task-due">High Priority</span>
                </div>
              </div>
              <ChevronRight size={18} className="task-chevron" />
            </div>

            <div className="task-item">
              <div className="task-item-left">
                <div className="task-icon task-icon-green"><FileBarChart2 size={20} /></div>
                <div className="task-info">
                  <span className="task-name">Monthly Report</span>
                  <span className="task-due">Completed today</span>
                </div>
              </div>
              <ChevronRight size={18} className="task-chevron" />
            </div>

            <div className="task-item">
              <div className="task-item-left">
                <div className="task-icon task-icon-orange"><Mail size={20} /></div>
                <div className="task-info">
                  <span className="task-name">Client Outreach</span>
                  <span className="task-due">Awaiting response</span>
                </div>
              </div>
              <ChevronRight size={18} className="task-chevron" />
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3 className="card-title" style={{ marginBottom: "24px" }}>Active Project Deadlines</h3>
        <table className="projects-table">
          <thead>
            <tr>
              <th>PROJECT NAME</th>
              <th>ASSIGNEE</th>
              <th>STATUS</th>
              <th>PROGRESS</th>
              <th>DUE DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="project-name">SaaS Landing Page</td>
              <td>Aahan B.</td>
              <td><span className="status-badge status-progress">In Progress</span></td>
              <td>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: "70%", backgroundColor: "#7e22ce" }}></div>
                </div>
              </td>
              <td>Oct 24, 2023</td>
            </tr>
            <tr>
              <td className="project-name">CogniTrack Mobile App</td>
              <td>Sarah J.</td>
              <td><span className="status-badge status-review">Review</span></td>
              <td>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: "40%", backgroundColor: "#d97706" }}></div>
                </div>
              </td>
              <td>Oct 28, 2023</td>
            </tr>
            <tr>
              <td className="project-name">Brand Identity</td>
              <td>Kevin L.</td>
              <td><span className="status-badge status-completed">Completed</span></td>
              <td>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: "100%", backgroundColor: "#15803d" }}></div>
                </div>
              </td>
              <td>Oct 15, 2023</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
