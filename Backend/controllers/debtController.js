import Debt from "../models/Debt.js";

/**
 * Safely parse numeric inputs that might come as strings (Postman/frontend).
 * Returns a number or NaN.
 */
const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
};

const calcPaidSoFar = (payments = []) =>
  payments.reduce((sum, p) => sum + (toNumber(p?.amount) || 0), 0);

// Utility function for validating debt input
const validateDebtInput = (creditor, totalAmount, dueDate) => {
  if (!creditor || typeof creditor !== "string" || creditor.trim() === "") {
    return "Creditor is required and must be a non-empty string.";
  }

  const total = toNumber(totalAmount);
  if (!Number.isFinite(total) || total <= 0) {
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

    const total = toNumber(totalAmount);

    const debt = new Debt({
      userId: req.user.userId, // Extracted from middleware
      creditor: creditor.trim(),
      totalAmount: total,
      remainingAmount: total,
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

    const pay = toNumber(amount);
    if (!Number.isFinite(pay) || pay <= 0) {
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

    if (debt.remainingAmount < pay) {
      return res
        .status(400)
        .json({ message: "Payment exceeds remaining debt amount." });
    }

    debt.payments.push({ amount: pay, date: new Date() });
    debt.remainingAmount -= pay;

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

    const debt = await Debt.findOne({ _id: id, userId: req.user.userId });
    if (!debt) {
      return res
        .status(404)
        .json({ message: "Debt not found or unauthorized." });
    }

    // creditor
    if (creditor !== undefined) {
      if (typeof creditor !== "string" || creditor.trim() === "") {
        return res
          .status(400)
          .json({ message: "Creditor must be a non-empty string." });
      }
      debt.creditor = creditor.trim();
    }

    // dueDate
    if (dueDate !== undefined) {
      if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: "Invalid due date format." });
      }
      debt.dueDate = dueDate;
    }

    // totalAmount + remainingAmount sync
    if (totalAmount !== undefined) {
      const newTotal = toNumber(totalAmount);
      if (!Number.isFinite(newTotal) || newTotal <= 0) {
        return res
          .status(400)
          .json({ message: "Total amount must be a positive number." });
      }

      const paidSoFar = calcPaidSoFar(debt.payments);

      // If user already paid more than the new total, reject update
      if (newTotal < paidSoFar) {
        return res.status(400).json({
          message: `Total amount cannot be less than already paid (${paidSoFar}).`,
        });
      }

      debt.totalAmount = newTotal;
      debt.remainingAmount = newTotal - paidSoFar;
    }

    await debt.save();
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
