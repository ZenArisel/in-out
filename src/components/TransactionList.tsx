import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit,
  Receipt,
  PlusCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  PAYMENT_METHODS,
  ALL_CATEGORIES,
  getCategoryDetails,
  formatCurrency,
  formatThaiDate,
} from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onLoadSampleData?: () => void;
  isCloudConnected: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onLoadSampleData,
  isCloudConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        // Payment filter
        if (selectedPayment !== 'all' && t.paymentMethod !== selectedPayment) return false;
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCat = t.category.toLowerCase().includes(q);
          const matchNote = t.note?.toLowerCase().includes(q) || false;
          const matchAmount = t.amount.toString().includes(q);
          const matchDate = t.date.includes(q);
          if (!matchCat && !matchNote && !matchAmount && !matchDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, selectedPayment, searchQuery, sortBy]);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div id="transaction-list-card" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 id="transaction-list-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>รายการรายรับ-รายจ่าย</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredTransactions.length} รายการ
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึก แก้ไข หรือค้นหาประวัติการเงินของคุณ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onLoadSampleData && transactions.length === 0 && (
            <button
              id="btn-seed-sample"
              onClick={onLoadSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหลดข้อมูลตัวอย่าง</span>
            </button>
          )}

          <button
            id="btn-list-add-new"
            onClick={onAddNew}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div id="transaction-filters-bar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-4 pb-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-transaction"
            type="text"
            placeholder="ค้นหาตามชื่อหมวดหมู่, บันทึก หรือจำนวนเงิน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            id="select-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">ประเภท: ทั้งหมด</option>
            <option value="expense">เฉพาะรายจ่าย</option>
            <option value="income">เฉพาะรายรับ</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            id="select-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">หมวดหมู่: ทั้งหมด</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div className="relative">
          <select
            id="select-sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="date_desc">วันที่: ล่าสุดก่อน</option>
            <option value="date_asc">วันที่: เก่าสุดก่อน</option>
            <option value="amount_desc">จำนวนเงิน: มากไปน้อย</option>
            <option value="amount_asc">จำนวนเงิน: น้อยไปมาก</option>
          </select>
        </div>
      </div>

      {/* Transaction Items */}
      <div id="transaction-list-container" className="mt-2 divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div id="transaction-empty-state" className="py-14 text-center">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {transactions.length === 0
                ? 'ยังไม่มีการบันทึกรายการในเดือนที่เลือก เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรกได้ทันที'
                : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'}
            </p>
            {transactions.length === 0 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  id="btn-empty-add-transaction"
                  onClick={onAddNew}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกรายการแรก</span>
                </button>
                {onLoadSampleData && (
                  <button
                    id="btn-empty-sample-data"
                    onClick={onLoadSampleData}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ใช้ข้อมูลตัวอย่าง</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const cat = getCategoryDetails(tx.category, tx.type);
            const isIncome = tx.type === 'income';
            const pay = PAYMENT_METHODS.find((p) => p.id === tx.paymentMethod);

            return (
              <div
                key={tx.id}
                id={`transaction-item-${tx.id}`}
                className="py-3 px-2 sm:px-3 hover:bg-slate-50/80 rounded-lg flex items-center justify-between gap-3 transition-colors group"
              >
                {/* Left: Category Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {tx.category}
                      </p>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {pay ? `${pay.icon} ${pay.label}` : tx.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatThaiDate(tx.date)}</span>
                      </span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      id={`tx-amount-${tx.id}`}
                      className={`text-sm sm:text-base font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-tx-${tx.id}`}
                      onClick={() => onEdit(tx)}
                      title="แก้ไขรายการ"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {deletingId === tx.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-md border border-rose-200">
                        <span className="text-[10px] font-semibold text-rose-700">ลบ?</span>
                        <button
                          id={`btn-confirm-delete-${tx.id}`}
                          onClick={() => confirmDelete(tx.id)}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                        >
                          ใช่
                        </button>
                        <button
                          id={`btn-cancel-delete-${tx.id}`}
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 rounded"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-delete-tx-${tx.id}`}
                        onClick={() => setDeletingId(tx.id)}
                        title="ลบรายการ"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
