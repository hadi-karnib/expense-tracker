import Expense from "../models/Expense.js";

// Utility function for validating input
const validateExpenseInput = (category, amount, date, description) => {
  if (!category || typeof category !== "string") {
    return "Category is required and must be a string.";
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return "Amount is required and must be a positive number.";
  }
  if (!date || isNaN(new Date(date).getTime())) {
    return "A valid date is required.";
  }
  if (description && typeof description !== "string") {
    return "Description must be a string.";
  }
  return null; // No errors
};

// Add a new expense
export const addExpense = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    const validationError = validateExpenseInput(
      category,
      amount,
      date,
      description
    );
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const expense = new Expense({
      userId: req.user.userId, // Extracted from middleware
      category,
      amount,
      date,
      description,
    });

    await expense.save();
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all expenses for the logged-in user
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.userId }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get expenses filtered by month & year
export const getExpensesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
//update expenses
export const updateExpense = async (req, res) => {
  try {
    const { id, category, amount, date, description } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required." });
    }

    const allowedFields = { category, amount, date, description };
    const updates = {};

    // Validate input dynamically
    for (const [key, value] of Object.entries(allowedFields)) {
      if (value !== undefined) {
        if (
          key === "category" &&
          (typeof value !== "string" || value.trim() === "")
        ) {
          return res
            .status(400)
            .json({ message: "Category must be a non-empty string." });
        }
        if (key === "amount" && (typeof value !== "number" || value <= 0)) {
          return res
            .status(400)
            .json({ message: "Amount must be a positive number." });
        }
        if (key === "date" && isNaN(new Date(value).getTime())) {
          return res.status(400).json({ message: "Invalid date format." });
        }
        if (key === "description" && typeof value !== "string") {
          return res
            .status(400)
            .json({ message: "Description must be a string." });
        }
        updates[key] = value; // Store valid updates
      }
    }

    // Find and update the expense using `req.body.id`
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, // Ensure user owns the expense
      { $set: updates },
      { new: true } // Returns the updated document
    );

    if (!expense) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized." });
    }

    res.json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete an expense (uses `req.body.id`)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required." });
    }

    // Find and delete the expense using `req.body.id`
    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user.userId, // Ensure user owns the expense
    });

    if (!expense) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized." });
    }

    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
