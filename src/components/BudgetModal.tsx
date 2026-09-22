import React, { useState, useEffect } from 'react';
import { X, Target, Save, DollarSign, Calculator } from 'lucide-react';
import { formatCurrency, formatThaiMonth } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  currentBudget: number;
  currentExpense: number;
  onSave: (limit: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  currentBudget,
  currentExpense,
  onSave,
}) => {
  const [budgetLimit, setBudgetLimit] = useState<string>(currentBudget > 0 ? currentBudget.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setBudgetLimit(currentBudget > 0 ? currentBudget.toString() : '');
    setErrorMsg(null);
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const numLimit = parseFloat(budgetLimit) || 0;
  const daysInMonth = new Date(
    parseInt(currentMonth.split('-')[0]),
    parseInt(currentMonth.split('-')[1]),
    0
  ).getDate();
  const dailyAverageAllowance = numLimit > 0 ? Math.round(numLimit / daysInMonth) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numLimit) || numLimit < 0) {
      setErrorMsg('กรุณากรอกตัวเลขงบประมาณที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(numLimit);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-backdrop-budget"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-budget-dialog"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 id="budget-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                ตั้งเป้างบประมาณรายจ่าย
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatThaiMonth(currentMonth)}
              </p>
            </div>
          </div>
          <button
            id="btn-close-budget-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณรายจ่ายสูงสุดประจำเดือน (บาท)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </div>
              <input
                id="input-budget-limit"
                type="number"
                step="any"
                min="0"
                placeholder="เช่น 15000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                autoFocus
                required
                className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick recommendations / summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>รายจ่ายจริงในเดือนนี้:</span>
              <span className="font-bold text-rose-600">{formatCurrency(currentExpense)}</span>
            </div>
            {numLimit > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>เฉลี่ยใช้ได้ต่อวัน ({daysInMonth} วัน):</span>
                <span className="font-bold text-emerald-700">{formatCurrency(dailyAverageAllowance)} / วัน</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-budget"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-save-budget"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
