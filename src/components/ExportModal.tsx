import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { Transaction, formatCurrency } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentMonth: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentMonth,
}) => {
  const [exportScope, setExportScope] = useState<'current_month' | 'all'>('current_month');
  const [exported, setExported] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFilteredData = () => {
    if (exportScope === 'current_month') {
      return transactions.filter((t) => t.date.startsWith(currentMonth));
    }
    return transactions;
  };

  const exportToCSV = () => {
    const data = getFilteredData();
    const headers = ['รหัสรายการ', 'วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'ช่องทางชำระ', 'บันทึก'];
    const rows = data.map((t) => [
      t.id,
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility with Thai text
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `financial_records_${exportScope === 'current_month' ? currentMonth : 'all'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported('csv');
    setTimeout(() => setExported(null), 2500);
  };

  const exportToJSON = () => {
    const data = getFilteredData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `financial_backup_${exportScope === 'current_month' ? currentMonth : 'all'}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported('json');
    setTimeout(() => setExported(null), 2500);
  };

  const scopeCount = getFilteredData().length;

  return (
    <div
      id="modal-backdrop-export"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-export-dialog"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 id="export-modal-title" className="text-base font-bold text-slate-900">
              ส่งออกข้อมูลรายการ
            </h3>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ช่วงข้อมูลที่ต้องการส่งออก
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-scope-month"
                onClick={() => setExportScope('current_month')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  exportScope === 'current_month'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                เฉพาะเดือนนี้ ({currentMonth})
              </button>
              <button
                type="button"
                id="btn-scope-all"
                onClick={() => setExportScope('all')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  exportScope === 'all'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                ข้อมูลทั้งหมดที่มี
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              พบ {scopeCount} รายการที่จะถูกส่งออก
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* CSV export option */}
            <button
              id="btn-export-csv"
              onClick={exportToCSV}
              className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-emerald-500 rounded-xl hover:bg-emerald-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    ส่งออกเป็นไฟล์ Excel (CSV)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    รองรับภาษาไทย 100% สำหรับเปิดใน Microsoft Excel หรือ Google Sheets
                  </p>
                </div>
              </div>
              {exported === 'csv' ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> เรียบร้อย
                </span>
              ) : (
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              )}
            </button>

            {/* JSON export option */}
            <button
              id="btn-export-json"
              onClick={exportToJSON}
              className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-indigo-500 rounded-xl hover:bg-indigo-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    สำรองข้อมูลระบบ (JSON)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    สำหรับเก็บสำรองข้อมูลและนำไปเชื่อมต่อกับระบบอื่น
                  </p>
                </div>
              </div>
              {exported === 'json' ? (
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> เรียบร้อย
                </span>
              ) : (
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
