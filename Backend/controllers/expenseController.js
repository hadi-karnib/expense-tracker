import Expense from "../models/Expense.js";

/**
 * Recurring helpers
 */
function monthKeyFrom(month, year) {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}`;
}

function clampDayToMonth(year, month, day) {
  // month is 1-12
  const last = new Date(year, month, 0).getDate();
  return Math.min(Math.max(1, day), last);
}

async function ensureRecurringForMonth(userId, month, year) {
  // Ensure that for each recurring template, we have one instance in this month.
  const templates = await Expense.find({
    userId,
    isTemplate: true,
    isRecurring: true,
    "recurring.freq": "monthly",
  }).lean();

  if (!templates.length) return;

  const y = Number(year);
  const m = Number(month);

  for (const t of templates) {
    const dom = clampDayToMonth(y, m, t.recurring?.dayOfMonth || 1);
    const key = `recur:${t._id}:${monthKeyFrom(m, y)}`;

    const exists = await Expense.findOne({ userId, autoKey: key }).lean();
    if (exists) continue;

    const dt = new Date(Date.UTC(y, m - 1, dom, 12, 0, 0)); // stable midday UTC

    await Expense.create({
      userId,
      category: t.category,
      amount: t.amount,
      date: dt,
      description: t.description,
      isRecurring: true,
      isTemplate: false,
      templateId: t._id,
      autoKey: key,
      recurring: t.recurring || { freq: "monthly", dayOfMonth: dom },
    });
  }
}

// Validation
const validateExpenseInput = (category, amount, date, description) => {
  if (!category || typeof category !== "string") return "Category is required and must be a string.";
  if (!amount || typeof amount !== "number" || amount <= 0) return "Amount is required and must be a positive number.";
  if (!date || isNaN(new Date(date).getTime())) return "A valid date is required.";
  if (description && typeof description !== "string") return "Description must be a string.";
  return null;
};

// Add a new expense (supports recurring templates)
export const addExpense = async (req, res) => {
  try {
    const { category, amount, date, description, isRecurring, recurring, asTemplate } = req.body;

    const validationError = validateExpenseInput(category, amount, date, description);
    if (validationError) return res.status(400).json({ message: validationError });

    const userId = req.user.userId;

    // Non-recurring: create normal record
    if (!isRecurring) {
      const expense = await Expense.create({
        userId,
        category: category.trim(),
        amount,
        date,
        description,
      });
      return res.status(201).json({ message: "Expense added successfully", expense });
    }

    // Recurring: create template + this month's instance
    const rec = {
      freq: "monthly",
      dayOfMonth: Number(recurring?.dayOfMonth || new Date(date).getUTCDate() || 1),
    };

    const template = await Expense.create({
      userId,
      category: category.trim(),
      amount,
      date,
      description,
      isRecurring: true,
      isTemplate: true,
      recurring: rec,
    });

    // Create the instance for the month of the given date
    const d = new Date(date);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dom = clampDayToMonth(y, m, rec.dayOfMonth);
    const key = `recur:${template._id}:${monthKeyFrom(m, y)}`;
    const instDate = new Date(Date.UTC(y, m - 1, dom, 12, 0, 0));

    const expense = await Expense.create({
      userId,
      category: template.category,
      amount: template.amount,
      date: instDate,
      description: template.description,
      isRecurring: true,
      isTemplate: false,
      templateId: template._id,
      autoKey: key,
      recurring: rec,
    });

    return res.status(201).json({
      message: "Recurring expense created",
      expense,
      template: asTemplate === false ? undefined : template,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all expenses (excluding templates by default)
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.userId, isTemplate: { $ne: true } }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get expenses filtered by month & year (auto-generates recurring instances)
export const getExpensesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "Month and year are required." });

    const userId = req.user.userId;

    // ensure recurring instances exist
    await ensureRecurringForMonth(userId, month, year);

    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(Number(year), Number(month), 1, 0, 0, 0));

    const expenses = await Expense.find({
      userId,
      isTemplate: { $ne: true },
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update expense (if updating a template, future instances won't auto-update yet)
export const updateExpense = async (req, res) => {
  try {
    const { id, category, amount, date, description } = req.body;

    const validationError = validateExpenseInput(category, amount, date, description);
    if (validationError) return res.status(400).json({ message: validationError });

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { category: category.trim(), amount, date, description },
      { new: true }
    );

    if (!updatedExpense) return res.status(404).json({ message: "Expense not found." });

    res.json({ message: "Expense updated successfully", expense: updatedExpense });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deletedExpense) return res.status(404).json({ message: "Expense not found." });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
