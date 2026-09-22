import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, PROJECT_ID } from './firebase';
import {
  subscribeToTransactions,
  createTransaction,
  editTransaction,
  removeTransaction,
  subscribeToMonthlyBudget,
  saveMonthlyBudget,
} from './services/firestoreService';
import { Transaction, MonthlyBudget, TransactionType, PaymentMethod } from './types';
import { generateSampleTransactions } from './data/sampleData';

import { Navbar } from './components/Navbar';
import { AuthBanner } from './components/AuthBanner';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ExportModal } from './components/ExportModal';

const LOCAL_STORAGE_TX_KEY = 'income_expense_local_txs_v1';
const LOCAL_STORAGE_BUDGET_KEY = 'income_expense_local_budget_v1';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Current selected month: defaults to current date in YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // State for all transactions and monthly budget
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentBudget, setCurrentBudget] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Notification / toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setIsGuestMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Load / Subscribe to Data
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Authenticated with Firebase: Subscribe to Firestore subcollections
      setIsLoadingData(true);
      const unsubscribeTx = subscribeToTransactions(
        user.uid,
        (items) => {
          setAllTransactions(items);
          setIsLoadingData(false);
        },
        (error) => {
          console.error('Transactions subscription error:', error);
          setIsLoadingData(false);
        }
      );

      const unsubscribeBudget = subscribeToMonthlyBudget(
        user.uid,
        selectedMonth,
        (budget) => {
          setCurrentBudget(budget ? budget.monthlyLimit : 0);
        }
      );

      return () => {
        unsubscribeTx();
        unsubscribeBudget();
      };
    } else {
      // Guest / Local mode: load from LocalStorage
      try {
        const savedTx = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
        if (savedTx) {
          setAllTransactions(JSON.parse(savedTx));
        } else {
          // Initialize with sample data for rich first impression
          const sample = generateSampleTransactions('guest_local_user').map((item, index) => ({
            ...item,
            id: `sample_${index + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setAllTransactions(sample);
          localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(sample));
        }

        const savedBudgets = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);
        if (savedBudgets) {
          const parsed = JSON.parse(savedBudgets);
          setCurrentBudget(parsed[selectedMonth] || 0);
        } else {
          setCurrentBudget(25000);
        }
      } catch (err) {
        console.error('LocalStorage load error:', err);
      }
      setIsLoadingData(false);
    }
  }, [user, authLoading, selectedMonth]);

  // Sync to LocalStorage if user is guest
  const saveLocalTransactions = (newItems: Transaction[]) => {
    setAllTransactions(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  // Google Login Handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        showToast(`ยินดีต้อนรับคุณ ${loggedUser.displayName || loggedUser.email}`);
      }
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        showToast('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('ออกจากระบบเรียบร้อย');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Transaction Operations
  const handleSaveTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod: PaymentMethod;
  }) => {
    const cleanNote = data.note ? data.note.trim() : '';
    const cleanData = {
      ...data,
      note: cleanNote,
    };

    if (editingTx) {
      // Edit mode
      if (user) {
        await editTransaction(editingTx.id, user.uid, cleanData);
      } else {
        const updated = allTransactions.map((tx) =>
          tx.id === editingTx.id
            ? { ...tx, ...cleanData, updatedAt: new Date().toISOString() }
            : tx
        );
        saveLocalTransactions(updated);
      }
      showToast('แก้ไขรายการสำเร็จ');
    } else {
      // Add mode
      if (user) {
        await createTransaction({
          userId: user.uid,
          ...cleanData,
        });
      } else {
        const newTx: Transaction = {
          id: 'tx_local_' + Date.now(),
          userId: 'guest_local_user',
          ...cleanData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveLocalTransactions([newTx, ...allTransactions]);
      }
      showToast('บันทึกรายการสำเร็จ');
    }
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await removeTransaction(id, user.uid);
    } else {
      const updated = allTransactions.filter((tx) => tx.id !== id);
      saveLocalTransactions(updated);
    }
    showToast('ลบรายการเรียบร้อย');
  };

  // Save Monthly Budget
  const handleSaveBudget = async (limit: number) => {
    if (user) {
      await saveMonthlyBudget(user.uid, selectedMonth, limit);
    } else {
      setCurrentBudget(limit);
      try {
        const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY) || '{}');
        current[selectedMonth] = limit;
        localStorage.setItem(LOCAL_STORAGE_BUDGET_KEY, JSON.stringify(current));
      } catch (e) {
        console.error(e);
      }
    }
    showToast('บันทึกงบประมาณประจำเดือนสำเร็จ');
  };

  // Seed / Load Sample Data
  const handleLoadSampleData = async () => {
    const targetUserId = user ? user.uid : 'guest_local_user';
    const samples = generateSampleTransactions(targetUserId);

    if (user) {
      for (const item of samples) {
        await createTransaction(item);
      }
      await saveMonthlyBudget(user.uid, selectedMonth, 25000);
    } else {
      const newItems: Transaction[] = samples.map((item, idx) => ({
        ...item,
        id: `sample_${Date.now()}_${idx}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      saveLocalTransactions([...newItems, ...allTransactions]);
      setCurrentBudget(25000);
    }
    showToast('โหลดข้อมูลตัวอย่างสำเร็จ');
  };

  // Filter transactions for the selected month
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [allTransactions, selectedMonth]);

  // Aggregate monthly figures
  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  return (
    <div id="main-app-container" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        selectedMonth={selectedMonth}
        onMonthChange={(m) => setSelectedMonth(m)}
        onOpenAddModal={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Content Body */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Firebase Cloud Connection & Auth Banner */}
        <AuthBanner
          user={user}
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          isGuestMode={isGuestMode}
          onEnableGuestMode={() => setIsGuestMode(true)}
        />

        {/* 1. Monthly Summary KPI Cards */}
        <MonthlySummaryCards
          month={selectedMonth}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          monthlyBudget={currentBudget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Visual Data Analytics & Charts */}
        <AnalyticsCharts
          currentMonth={selectedMonth}
          transactions={currentMonthTransactions}
          allTransactions={allTransactions}
        />

        {/* 3. Transaction Management & Records Table */}
        <TransactionList
          transactions={currentMonthTransactions}
          onEdit={(tx) => {
            setEditingTx(tx);
            setIsTxModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onAddNew={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          onLoadSampleData={handleLoadSampleData}
          isCloudConnected={!!user}
        />
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={selectedMonth}
        currentBudget={currentBudget}
        currentExpense={totalExpense}
        onSave={handleSaveBudget}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={allTransactions}
        currentMonth={selectedMonth}
      />

      {/* Footer */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ระบบบันทึกรายรับรายจ่าย — พัฒนาเพื่อการบริหารการเงินส่วนบุคคลบนคลาวด์</p>
          <div className="flex items-center gap-3">
            <span>Firebase: <strong className="text-slate-700">{PROJECT_ID}</strong></span>
            <span>•</span>
            <span>Google Authentication</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
