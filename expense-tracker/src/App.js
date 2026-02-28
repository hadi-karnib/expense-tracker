import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./Pages/auth/LoginPage.js";
import RegisterPage from "./Pages/auth/RegisterPage.js";

import DashboardPage from "./Pages/dashboard/DashboardPage";
import IncomePage from "./Pages/income/IncomePage";
import ExpensesPage from "./Pages/expenses/ExpensesPage";
import DebtsPage from "./Pages/debts/DebtsPage";
import BudgetsPage from "./Pages/budgets/BudgetsPage";
import AnalyticsPage from "./Pages/analytics/AnalyticsPage";
import SettingsPage from "./Pages/settings/SettingsPage";
import ReportPage from "./Pages/report/ReportPage";
import NotFoundPage from "./Pages/NotFoundPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
