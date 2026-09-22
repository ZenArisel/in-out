export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  monthlyLimit: number;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: '🍔', color: '#f97316', type: 'expense' },
  { id: 'transport', name: 'การเดินทาง / ยานพาหนะ', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'housing', name: 'ที่อยู่อาศัย / ค่าน้ำค่าไฟ', icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { id: 'health', name: 'สุขภาพและการรักษา', icon: '💊', color: '#10b981', type: 'expense' },
  { id: 'entertainment', name: 'ความบันเทิง / ท่องเที่ยว', icon: '🎬', color: '#06b6d4', type: 'expense' },
  { id: 'education', name: 'การศึกษา / หนังสือ', icon: '📚', color: '#eab308', type: 'expense' },
  { id: 'investment', name: 'การออมและการลงทุน', icon: '📈', color: '#6366f1', type: 'expense' },
  { id: 'debt_fee', name: 'หนี้สิน / ดอกเบี้ย / ค่าธรรมเนียม', icon: '🧾', color: '#64748b', type: 'expense' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', icon: '📦', color: '#94a3b8', type: 'expense' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', icon: '💰', color: '#10b981', type: 'income' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', icon: '🏪', color: '#059669', type: 'income' },
  { id: 'investment_income', name: 'ผลตอบแทน / ปันผล / ดอกเบี้ย', icon: '📈', color: '#3b82f6', type: 'income' },
  { id: 'bonus', name: 'โบนัสและเงินพิเศษ', icon: '🎁', color: '#f59e0b', type: 'income' },
  { id: 'gift_transfer', name: 'รับโอน / เงินช่วยเหลือ', icon: '🤝', color: '#8b5cf6', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', icon: '📦', color: '#64748b', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'เงินสด', icon: '💵' },
  { id: 'transfer', label: 'โอนเงิน / พร้อมเพย์', icon: '📱' },
  { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: '💳' },
  { id: 'other', label: 'อื่นๆ', icon: '🌐' },
];

export function getCategoryDetails(name: string, type: TransactionType): CategoryInfo {
  const found = ALL_CATEGORIES.find((c) => c.name === name && c.type === type) ||
                ALL_CATEGORIES.find((c) => c.name === name);
  if (found) return found;
  return {
    id: 'custom',
    name,
    icon: type === 'income' ? '💵' : '💸',
    color: type === 'income' ? '#10b981' : '#f97316',
    type,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const thaiYear = year + 543;
    return `${day} ${thaiMonths[month - 1]} ${thaiYear}`;
  } catch {
    return dateStr;
  }
}

export function formatThaiMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    if (!year || !month) return monthStr;
    const thaiFullMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = year + 543;
    return `${thaiFullMonths[month - 1]} ${thaiYear}`;
  } catch {
    return monthStr;
  }
}
