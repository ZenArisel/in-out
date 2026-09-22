import React from 'react';
import { User } from 'firebase/auth';
import {
  Wallet,
  Plus,
  LogOut,
  LogIn,
  Download,
  Calendar,
  CloudCheck,
  Sparkles,
} from 'lucide-react';
import { PROJECT_ID } from '../firebase';
import { formatThaiMonth } from '../types';

interface NavbarProps {
  user: User | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenExportModal,
  onLogin,
  onLogout,
  isLoggingIn,
}) => {
  // Generate list of available months (previous 12 months up to next month)
  const availableMonths = React.useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // include next month
    for (let i = 0; i < 14; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      list.push(`${y}-${m}`);
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  }, []);

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Cloud Project Badge */}
          <div id="brand-container" className="flex items-center gap-3">
            <div
              id="brand-logo-badge"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs"
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span id="brand-title" className="font-bold text-lg text-slate-900 tracking-tight">
                  ระบบบันทึกรายรับรายจ่าย
                </span>
                <span
                  id="project-indicator-badge"
                  title={`เชื่อมต่อ Firebase Project: ${PROJECT_ID}`}
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <CloudCheck className="w-3 h-3 text-emerald-600" />
                  <span>{PROJECT_ID}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                สรุปผลรายเดือน &amp; ภาพวิเคราะห์ข้อมูลบนคลาวด์
              </p>
            </div>
          </div>

          {/* Month Selector & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month Filter Picker */}
            <div id="month-picker-wrapper" className="relative flex items-center">
              <div className="absolute left-2.5 pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                id="select-month-picker"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-xs sm:text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatThaiMonth(m)}
                  </option>
                ))}
              </select>
            </div>

            {/* Export CSV / JSON */}
            <button
              id="btn-open-export"
              onClick={onOpenExportModal}
              title="ส่งออกข้อมูล (CSV/JSON)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Add Transaction Button */}
            <button
              id="btn-open-add-transaction"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>

            {/* User Login/Logout */}
            {user ? (
              <div id="user-profile-menu" className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    id="user-avatar-image"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    id="user-avatar-placeholder"
                    className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs"
                  >
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p id="user-display-name" className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p id="user-email-text" className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-login-google"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
