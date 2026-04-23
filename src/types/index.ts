import type {
  Organization,
  Location,
  Employee,
  DailyRevenue,
  ExpenseEntry,
  PayrollEntry,
  ExpenseCategory,
  PaymentSource,
} from "@/generated/prisma";

export type {
  Organization,
  Location,
  Employee,
  DailyRevenue,
  ExpenseEntry,
  PayrollEntry,
  ExpenseCategory,
  PaymentSource,
};

// ─── Aggregated week summary matching the CSV structure ───────────────────────

export type WeekSummary = {
  locationId: string;
  locationName: string;
  weekStart: Date;
  cashIncome: number;
  creditIncome: number;
  totalIncome: number;
  standardExpenses: number;   // payment_source = CASH_DRAWER
  specialInventory: number;   // payment_source = CHECK | EXTERNAL
  totalPayroll: number;
  net: number;
  cashLeft: number;           // cashIncome - standardExpenses - totalPayroll
};

export type CombinedWeekSummary = {
  weekStart: Date;
  locations: WeekSummary[];
  cashIncome: number;
  creditIncome: number;
  totalIncome: number;
  standardExpenses: number;
  specialInventory: number;
  totalPayroll: number;
  net: number;
  cashLeft: number;
};

// ─── Form input types ─────────────────────────────────────────────────────────

export type DailyRevenueInput = {
  locationId: string;
  date: string;
  cashIncome: number;
  creditIncome: number;
  notes?: string;
};

export type ExpenseEntryInput = {
  locationId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  paymentSource: PaymentSource;
  notes?: string;
};

export type PayrollEntryInput = {
  employeeId: string;
  locationId: string;
  weekStart: string;
  amount: number;
  notes?: string;
};
