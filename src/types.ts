export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'Materiales'
  | 'Transporte'
  | 'Servicios'
  | 'Marketing'
  | 'Otros';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category?: ExpenseCategory;
  date: Date;
  description: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  status: 'profit' | 'low-profit' | 'loss';
}
