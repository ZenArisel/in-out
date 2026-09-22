import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Edit2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatThaiMonth } from '../types';

interface MonthlySummaryCardsProps {
  month: string;
  totalIncome: number;
  totalExpense: number;
  monthlyBudget: number;
  onOpenBudgetModal: () => void;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  month,
  totalIncome,
  totalExpense,
  monthlyBudget,
  onOpenBudgetModal,
}) => {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  const budgetUsagePercent = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;

  return (
    <section id="monthly-summary-section" aria-label="สรุปภาพรวมรายเดือน" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 id="summary-section-title" className="text-base sm:text-lg font-bold text-slate-900">
          สรุปภาพรวม {formatThaiMonth(month)}
        </h2>
        <span id="summary-savings-badge" className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          savingsRate >= 20 ? 'bg-emerald-100 text-emerald-800' :
          savingsRate > 0 ? 'bg-amber-100 text-amber-800' :
          'bg-rose-100 text-rose-800'
        }`}>
          อัตราการออม {savingsRate}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Income */}
        <div
          id="summary-card-income"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div id="summary-income-amount" className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ยอดเงินที่รับเข้ามาในเดือนนี้
          </p>
        </div>

        {/* Card 2: Total Expense */}
        <div
          id="summary-card-expense"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-rose-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div id="summary-expense-amount" className="text-2xl font-bold text-rose-600 tracking-tight">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {totalIncome > 0
              ? `คิดเป็น ${Math.round((totalExpense / totalIncome) * 100)}% ของรายรับ`
              : 'ยอดค่าใช้จ่ายที่เกิดขึ้นในเดือนนี้'}
          </p>
        </div>

        {/* Card 3: Net Balance */}
        <div
          id="summary-card-balance"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">ยอดคงเหลือสุทธิ</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            id="summary-balance-amount"
            className={`text-2xl font-bold tracking-tight ${
              balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {balance >= 0 ? 'เงินคงเหลือสะสมในรอบเดือน' : 'รายจ่ายเกินกว่ารายรับ'}
          </p>
        </div>

        {/* Card 4: Monthly Budget */}
        <div
          id="summary-card-budget"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">งบประมาณรายจ่าย</span>
            <button
              id="btn-edit-budget"
              onClick={onOpenBudgetModal}
              title="แก้ไขงบประมาณ"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {monthlyBudget > 0 ? (
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span id="budget-usage-text" className="text-lg font-bold text-slate-800">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="text-xs text-slate-500">
                  / {formatCurrency(monthlyBudget)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  id="budget-progress-bar"
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePercent >= 100
                      ? 'bg-rose-500'
                      : budgetUsagePercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  ใช้ไป {budgetUsagePercent}%
                </span>
                <span className={remainingBudget >= 0 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                  {remainingBudget >= 0
                    ? `เหลืออีก ${formatCurrency(remainingBudget)}`
                    : `เกินงบ ${formatCurrency(Math.abs(remainingBudget))}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <p className="text-xs text-slate-400 mb-2">ยังไม่ได้ตั้งเป้างบประมาณ</p>
              <button
                id="btn-set-budget-first"
                onClick={onOpenBudgetModal}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <Target className="w-3.5 h-3.5" />
                <span>ตั้งงบประมาณเดือนนี้</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
