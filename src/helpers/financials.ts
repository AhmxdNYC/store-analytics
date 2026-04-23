import type { DailyRevenue, ExpenseEntry, PayrollEntry } from "@/generated/prisma";
import type { WeekSummary, CombinedWeekSummary } from "@/types";

// Computes the full weekly summary for a single location.
// Mirrors the exact calculations in the Google Sheets CSV:
//   cashLeft = cashIncome - standardExpenses - payroll (excludes check/external inventory)
export function computeWeekSummary(
  locationId: string,
  locationName: string,
  weekStart: Date,
  revenues: DailyRevenue[],
  expenses: ExpenseEntry[],
  payroll: PayrollEntry[]
): WeekSummary {
  const cashIncome = revenues.reduce((sum, r) => sum + Number(r.cashIncome), 0);
  const creditIncome = revenues.reduce((sum, r) => sum + Number(r.creditIncome), 0);

  const standardExpenses = expenses
    .filter((e) => e.paymentSource === "CASH_DRAWER")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const specialInventory = expenses
    .filter((e) => e.paymentSource === "CHECK" || e.paymentSource === "EXTERNAL")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalPayroll = payroll.reduce((sum, p) => sum + Number(p.amount), 0);

  const totalIncome = cashIncome + creditIncome;
  const net = totalIncome - standardExpenses - specialInventory - totalPayroll;
  const cashLeft = cashIncome - standardExpenses - totalPayroll;

  return {
    locationId,
    locationName,
    weekStart,
    cashIncome,
    creditIncome,
    totalIncome,
    standardExpenses,
    specialInventory,
    totalPayroll,
    net,
    cashLeft,
  };
}

export function combineSummaries(
  weekStart: Date,
  summaries: WeekSummary[]
): CombinedWeekSummary {
  return {
    weekStart,
    locations: summaries,
    cashIncome: summaries.reduce((s, l) => s + l.cashIncome, 0),
    creditIncome: summaries.reduce((s, l) => s + l.creditIncome, 0),
    totalIncome: summaries.reduce((s, l) => s + l.totalIncome, 0),
    standardExpenses: summaries.reduce((s, l) => s + l.standardExpenses, 0),
    specialInventory: summaries.reduce((s, l) => s + l.specialInventory, 0),
    totalPayroll: summaries.reduce((s, l) => s + l.totalPayroll, 0),
    net: summaries.reduce((s, l) => s + l.net, 0),
    cashLeft: summaries.reduce((s, l) => s + l.cashLeft, 0),
  };
}
