import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, ShoppingBag, DollarSign } from "lucide-react";
import { addExpense, getExpenses, deleteExpense } from "../services/expenseService";
import Papa from "papaparse";
import "../styles/ExpenseTracker.css";

const CATEGORY_COLORS = {
    Travel: "#5d35b1", // Purple
    Food: "#38a169",   // Green
    Work: "#b794f4",   // Light Purple
    Personal: "#ecc94b", // Yellow
    Other: "#a0aec0"   // Gray
};

// Dynamic color generator for unknown CSV tags
const getCategoryColor = (categoryName) => {
    if (CATEGORY_COLORS[categoryName]) return CATEGORY_COLORS[categoryName];

    // Generate a consistent hex color based on the string hash
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
        hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
};

// Also generate a lighter background for the pills
const getPillStyle = (categoryName) => {
    const baseColor = getCategoryColor(categoryName);
    return {
        backgroundColor: `${baseColor}25`, // 15% opacity hex
        color: baseColor,
        border: `1px solid ${baseColor}40`
    };
};

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);

    // Month Filter State
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });

    // Budget State
    const [monthlyBudget, setMonthlyBudget] = useState(2500);

    // Formatting Helpers
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Modal Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showAllExpenses, setShowAllExpenses] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const [type, setType] = useState("expense"); // Re-add Record Type

    const fetchExpenses = async () => {
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!description || !amount || !date) return;

        setIsSubmitting(true);
        try {
            const newExpense = {
                description,
                amount: parseFloat(amount),
                category,
                type,
                date
            };

            const added = await addExpense(newExpense);

            setExpenses((prev) => {
                const updated = [added, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
                return updated;
            });

            // Reset form
            setDescription("");
            setAmount("");
            setCategory("Food");
            setDate(new Date().toISOString().split("T")[0]);
            setIsModalOpen(false);

            // Redirect the Dashboard view to match the newly added record's month!
            setCurrentMonth(date.substring(0, 7));

        } catch (error) {
            console.error("Failed to add expense:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteExpense(id);
            setExpenses((prev) => prev.filter((exp) => exp.id !== id));
        } catch (error) {
            console.error("Failed to delete expense:", error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;
                const newExpenses = [];

                // Create a Set of existing hashes to prevent duplicates
                const existingHashes = new Set(
                    expenses.map(exp => `${exp.date}_${exp.amount}_${exp.description}`)
                );

                for (const row of rows) {
                    const desc = row["Transaction Details"] || row.Description || row.Transaction || row.Name || "Imported Record";
                    const amtStr = String(row.Amount || row.Cost || row.Value || "0");

                    let rowType = "expense";
                    if (amtStr.includes("+")) {
                        rowType = "income";
                    }

                    const cleanAmt = parseFloat(amtStr.replace(/[^0-9.-]+/g, ""));
                    const absAmt = Math.abs(cleanAmt);

                    let rawTag = row.Tags || row.Category || "";
                    let cat = rawTag.replace("#", "").trim();
                    if (!cat) cat = "Other";

                    if (cat.toLowerCase().includes("money received") || cat.toLowerCase().includes("salary") || cat.toLowerCase().includes("income")) {
                        rowType = "income";
                        if (cat.toLowerCase().includes("money received")) {
                            cat = "Income";
                        }
                    }

                    let expDate = row.Date || new Date().toISOString().split("T")[0];
                    if (expDate && expDate.includes("/")) {
                        const parts = expDate.split("/");
                        if (parts.length === 3) {
                            const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            if (!isNaN(d.getTime())) {
                                expDate = d.toISOString().split("T")[0];
                            }
                        }
                    }

                    if (absAmt > 0) {
                        const recordHash = `${expDate}_${absAmt}_${desc}`;

                        // Check if exact same record already exists in database
                        if (!existingHashes.has(recordHash)) {
                            newExpenses.push({
                                description: desc,
                                amount: absAmt,
                                category: cat, // dynamically pass the tag/category
                                type: rowType,
                                date: expDate,
                                isImported: true
                            });
                            // Add to our hash set immediately so we don't duplicate identical rows *within* the CSV itself
                            existingHashes.add(recordHash);
                        }
                    }
                }

                try {
                    await Promise.all(newExpenses.map(exp => addExpense(exp)));
                    await fetchExpenses();
                    setIsModalOpen(false);
                } catch (err) {
                    console.error("Error saving imported expenses:", err);
                } finally {
                    setIsUploading(false);
                    e.target.value = null;
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                setIsUploading(false);
            }
        });
    };

    // --- Calculations & Month Filtering ---

    // Current month filter
    const currentMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const expMonthStr = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        return expMonthStr === currentMonth;
    });

    // Previous month calculation for trend
    const getPreviousMonthStr = (monthStr) => {
        const [year, month] = monthStr.split('-');
        let d = new Date(year, parseInt(month) - 2, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const prevMonthStr = getPreviousMonthStr(currentMonth);
    const prevMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const expMonthStr = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        return expMonthStr === prevMonthStr;
    });

    const totalSpend = currentMonthExpenses.filter(e => e.type !== 'income').reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalIncome = currentMonthExpenses.filter(e => e.type === 'income').reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const prevTotalSpend = prevMonthExpenses.filter(e => e.type !== 'income').reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Trend calculation
    let spendTrendPct = 0;
    let spendTrendText = "No previous data";
    let spendTrendIcon = "➖";
    let spendTrendColor = "#718096";

    if (prevTotalSpend > 0) {
        spendTrendPct = Math.round(((totalSpend - prevTotalSpend) / prevTotalSpend) * 100);
        if (spendTrendPct > 0) {
            spendTrendText = `${spendTrendPct}% more than last month`;
            spendTrendIcon = "📈";
            spendTrendColor = "#e53e3e"; // Red for spending more
        } else if (spendTrendPct < 0) {
            spendTrendText = `${Math.abs(spendTrendPct)}% less than last month`;
            spendTrendIcon = "📉";
            spendTrendColor = "#38a169"; // Green for spending less
        } else {
            spendTrendText = "Same as last month";
        }
    } else if (totalSpend > 0) {
        spendTrendText = "100% more than last month";
        spendTrendIcon = "📈";
        spendTrendColor = "#e53e3e";
    }

    const budgetRemaining = Math.max(0, monthlyBudget - totalSpend);
    const budgetUsedPct = Math.min(100, monthlyBudget > 0 ? Math.round((totalSpend / monthlyBudget) * 100) : 0);

    // Category Breakdown (for the current month's expenses only)
    const categoryTotals = currentMonthExpenses.filter(e => e.type !== 'income').reduce((acc, exp) => {
        const cat = exp.category || "Other";
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
            color: getCategoryColor(name),
            style: getPillStyle(name)
        }))
        .sort((a, b) => b.amount - a.amount);

    // Generate Conic Gradient string for Donut Chart
    let currentDegree = 0;
    const conicStops = sortedCategories.map(cat => {
        const degreeSize = (cat.amount / totalSpend) * 360;
        const stop = `${cat.color} ${currentDegree}deg ${currentDegree + degreeSize}deg`;
        currentDegree += degreeSize;
        return stop;
    }).join(", ");

    const donutBackground = sortedCategories.length > 0
        ? `conic-gradient(${conicStops})`
        : `conic-gradient(#edf2f7 0deg 360deg)`;

    return (
        <div className="expense-wrapper">
            <div className="expense-header-top">
                <div className="expense-title">
                    <h1>Expense Tracker</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0 }}>Manage your daily spending and track budgets.</p>

                        {/* Month Selector Tool */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>Month:</span>
                            <input
                                type="month"
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#1a1b25', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}
                            />
                        </div>
                    </div>
                </div>
                <button className="btn-add-expense" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="dashboard-top-row">
                <div className="dashboard-card">
                    <div className="card-header">
                        <span>Total Monthly Spend</span>
                        <div className="card-icon"><Edit3 size={18} /></div>
                    </div>
                    <div className="card-value">{formatCurrency(totalSpend)}</div>
                    <div className="card-subtitle" style={{ marginBottom: "0.5rem" }}>
                        For {currentMonth}
                    </div>
                    <div className="card-trend" style={{ color: spendTrendColor }}>
                        <span>{spendTrendIcon}</span> {spendTrendText}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <span>Total Income</span>
                        <div className="card-icon" style={{ color: "#38a169" }}><ShoppingBag size={18} /></div>
                    </div>
                    <div className="card-value" style={{ color: "#38a169" }}>+{formatCurrency(totalIncome)}</div>
                    <div className="card-subtitle">
                        For {currentMonth}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <span>Budget Remaining</span>
                        <div
                            className="card-icon"
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                backgroundColor: "#edf2f7",
                                color: "#4a5568",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                transition: "background-color 0.2s"
                            }}
                            title="Edit Budget"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#edf2f7"}
                            onClick={() => {
                                const newBudget = prompt("Enter new monthly budget in ₹:", monthlyBudget);
                                if (newBudget && !isNaN(newBudget) && Number(newBudget) > 0) {
                                    setMonthlyBudget(Number(newBudget));
                                }
                            }}
                        >
                            <Edit3 size={14} /> Set Budget
                        </div>
                    </div>
                    <div className="card-value">{formatCurrency(budgetRemaining)}</div>
                    <div className="budget-progress-container">
                        <div className="budget-progress-fill" style={{ width: `${budgetUsedPct}%` }}></div>
                    </div>
                    <div className="card-subtitle">{budgetUsedPct}% of budget used</div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="dashboard-main-row">

                {/* Left: Recent Expenses */}
                <div className="table-card">
                    <div className="table-card-header">
                        <h2>Recent Expenses</h2>
                        <span
                            className="view-all-link"
                            style={{ cursor: "pointer", userSelect: "none" }}
                            onClick={() => setShowAllExpenses(!showAllExpenses)}
                        >
                            {showAllExpenses ? "View Less" : "View All"}
                        </span>
                    </div>
                    <table className="expenses-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMonthExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", color: "#a0aec0", padding: "2rem" }}>
                                        No records for {currentMonth}.
                                    </td>
                                </tr>
                            ) : (
                                currentMonthExpenses
                                    .slice(0, showAllExpenses ? currentMonthExpenses.length : 6)
                                    .map((expense) => (
                                        <tr key={expense.id} className="expense-item-row">
                                            <td className="table-date">{formatDate(expense.date)}</td>
                                            <td className="table-desc">{expense.description}</td>
                                            <td>
                                                <span className="cat-pill" style={getPillStyle(expense.category || "Other")}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="table-amount" style={{ color: expense.type === 'income' ? '#38a169' : '#1a1b25' }}>
                                                {expense.type === 'income' ? '+' : ''}{formatCurrency(expense.amount)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right: Spending by Category */}
                <div className="chart-card">
                    <h2>Spending by Category</h2>

                    <div className="donut-container">
                        <div className="donut-chart" style={{ background: donutBackground }}>
                            <div className="donut-hole">
                                <span className="donut-label">Total</span>
                                <span className="donut-value">{formatCurrency(totalSpend).replace(/\.\d{2}$/, "")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="category-progress-list">
                        {sortedCategories.map((cat) => (
                            <div key={cat.name} className="cat-progress-item">
                                <div className="cat-progress-header">
                                    <div className="cat-progress-name">
                                        <div className="cat-dot" style={{ backgroundColor: cat.color }}></div>
                                        {cat.name}
                                    </div>
                                    <div className="cat-progress-pct">{cat.percentage}%</div>
                                </div>
                                <div className="cat-progress-bar-bg">
                                    <div
                                        className="cat-progress-bar-fill"
                                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden Modal Overlay */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Expense</h2>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form className="expense-form" onSubmit={handleAddExpense}>
                            <div className="form-group">
                                <label>Record Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="expense">Expense (-)</option>
                                    <option value="income">Income (+)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    placeholder={type === 'income' ? "e.g. Monthly Salary" : "e.g. Whole Foods Market"}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? "Adding..." : "Save Expense"}
                            </button>

                            <div style={{ textAlign: "center", margin: "1rem 0", color: "#a0aec0", fontSize: "0.85rem" }}>OR</div>

                            <label className="btn-submit" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', background: 'transparent', border: '1px solid #e2e8f0', color: '#4a5568' }}>
                                <input
                                    type="file"
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                {isUploading ? "Uploading..." : "Upload CSV Statement"}
                            </label>

                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
}
