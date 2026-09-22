import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, Cloud, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROJECT_ID } from '../firebase';

interface AuthBannerProps {
  user: User | null;
  onLogin: () => void;
  isLoggingIn: boolean;
  isGuestMode: boolean;
  onEnableGuestMode: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({
  user,
  onLogin,
  isLoggingIn,
  isGuestMode,
  onEnableGuestMode,
}) => {
  if (user) {
    return (
      <div
        id="cloud-connected-banner"
        className="w-full bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs"
      >
        <div className="flex items-center gap-2.5 text-xs text-emerald-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">เชื่อมต่อ Firebase คลาวด์สมบูรณ์:</span>
          <span className="font-mono text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {PROJECT_ID}
          </span>
          <span className="text-emerald-700 hidden md:inline">
            • ข้อมูลบันทึกและซิงค์แบบเรียลไทม์ผ่านบัญชี {user.email}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>เข้ารหัสความปลอดภัยระดับ ABAC</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="auth-required-banner"
      className="w-full bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-emerald-800/40 relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Cloud className="w-3 h-3" />
              Firebase Project: {PROJECT_ID}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            เข้าสู่ระบบด้วย Gmail เพื่อจัดเก็บข้อมูลบนคลาวด์อย่างปลอดภัย
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            บันทึกรายรับรายจ่าย สรุปผลรายเดือน และดูภาพวิเคราะห์ได้ทุกที่ทุกอุปกรณ์
            ข้อมูลของคุณได้รับการปกป้องด้วยสิทธิ์การเข้าถึงส่วนบุคคลใน Firestore
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            id="btn-banner-login-google"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>{isLoggingIn ? 'กำลังเปิดหน้าต่างล็อกอิน...' : 'เข้าสู่ระบบด้วย Gmail'}</span>
          </button>

          {!isGuestMode && (
            <button
              id="btn-banner-guest-mode"
              onClick={onEnableGuestMode}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-center"
            >
              ทดลองใช้งานบนเครื่องนี้ก่อน
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
