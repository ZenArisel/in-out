import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Check,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  CategoryInfo,
} from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('อาหารและเครื่องดื่ม');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize data when editing or opening
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod);
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('transfer');
      setNote('');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  // Update default category when type switches
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const categoriesToDisplay = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Add quick amount presets
  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (numAmount > 999999999) {
      setErrorMsg('จำนวนเงินเกินขีดจำกัด');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setErrorMsg('กรุณาระบุวันที่');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        note: note.trim() || '',
        paymentMethod,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save transaction:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกรายการ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop-transaction"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-transaction-dialog"
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 id="modal-tx-title" className="text-base font-bold text-slate-900">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            id="btn-close-tx-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทรายการ
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                id="btn-type-expense"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💸 รายจ่าย (Expense)
              </button>
              <button
                type="button"
                id="btn-type-income"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💰 รายรับ (Income)
              </button>
            </div>
          </div>

          {/* Amount Input & Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ฿
              </div>
              <input
                id="input-tx-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400">บวกเพิ่ม:</span>
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  id={`btn-quick-add-${val}`}
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {categoriesToDisplay.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`btn-category-select-${cat.id}`}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-400 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ทำรายการ
              </label>
              <div className="relative">
                <input
                  id="input-tx-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ช่องทางการชำระเงิน
              </label>
              <select
                id="select-tx-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              id="input-tx-note"
              type="text"
              maxLength={500}
              placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ร้านอาหาร, สาขา..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div id="tx-modal-error" className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-tx"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-submit-tx"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
