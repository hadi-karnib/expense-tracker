import Debt from "../models/Debt.js";

// Utility function for validating debt input
const validateDebtInput = (creditor, totalAmount, dueDate) => {
  if (!creditor || typeof creditor !== "string") {
    return "Creditor is required and must be a string.";
  }
  if (!totalAmount || typeof totalAmount !== "number" || totalAmount <= 0) {
    return "Total amount is required and must be a positive number.";
  }
  if (!dueDate || isNaN(new Date(dueDate).getTime())) {
    return "A valid due date is required.";
  }
  return null; // No errors
};

// Add a new debt
export const addDebt = async (req, res) => {
  try {
    const { creditor, totalAmount, dueDate } = req.body;
    const validationError = validateDebtInput(creditor, totalAmount, dueDate);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const debt = new Debt({
      userId: req.user.userId, // Extracted from middleware
      creditor,
      totalAmount,
      remainingAmount: totalAmount,
      dueDate,
      payments: [],
    });

    await debt.save();
    res.status(201).json({ message: "Debt added successfully", debt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all debts for the logged-in user
export const getDebts = async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user.userId }).sort({
      dueDate: 1,
    });
    res.json(debts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Make a payment toward a debt
export const makePayment = async (req, res) => {
  try {
    const { id, amount } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Debt ID is required." });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be a positive number." });
    }

    const debt = await Debt.findOne({ _id: id, userId: req.user.userId });

    if (!debt) {
      return res
        .status(404)
        .json({ message: "Debt not found or unauthorized." });
    }

    if (debt.remainingAmount < amount) {
      return res
        .status(400)
        .json({ message: "Payment exceeds remaining debt amount." });
    }

    debt.payments.push({ amount, date: new Date() });
    debt.remainingAmount -= amount;

    await debt.save();
    res.json({ message: "Payment recorded successfully", debt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update a debt (only if the user owns it)
export const updateDebt = async (req, res) => {
  try {
    const { id, creditor, totalAmount, dueDate } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Debt ID is required." });
    }

    const updates = {};
    if (creditor !== undefined) {
      if (typeof creditor !== "string" || creditor.trim() === "") {
        return res
          .status(400)
          .json({ message: "Creditor must be a non-empty string." });
      }
      updates.creditor = creditor;
    }
    if (totalAmount !== undefined) {
      if (typeof totalAmount !== "number" || totalAmount <= 0) {
        return res
          .status(400)
          .json({ message: "Total amount must be a positive number." });
      }
      updates.totalAmount = totalAmount;
    }
    if (dueDate !== undefined) {
      if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: "Invalid due date format." });
      }
      updates.dueDate = dueDate;
    }

    const debt = await Debt.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, // Ensure user owns the debt
      { $set: updates },
      { new: true }
    );

    if (!debt) {
      return res
        .status(404)
        .json({ message: "Debt not found or unauthorized." });
    }

    res.json({ message: "Debt updated successfully", debt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete a debt (only if the user owns it)
export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Debt ID is required." });
    }

    const debt = await Debt.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!debt) {
      return res
        .status(404)
        .json({ message: "Debt not found or unauthorized." });
    }

    res.json({ message: "Debt deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
