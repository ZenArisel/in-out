import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Table as TableIcon,
} from 'lucide-react';
import {
  Transaction,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatCurrency,
  formatThaiMonth,
} from '../types';

interface AnalyticsChartsProps {
  currentMonth: string;
  transactions: Transaction[];
  allTransactions: Transaction[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  currentMonth,
  transactions,
  allTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'donut' | 'trend' | 'history' | 'table'>('donut');

  // Filter transactions for current month
  const currentMonthExpenses = transactions.filter((t) => t.type === 'expense');
  const currentMonthIncomes = transactions.filter((t) => t.type === 'income');

  const totalExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // 1. Group expenses by category
  const expenseByCategory = React.useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    currentMonthExpenses.forEach((t) => {
      const prev = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, {
        amount: prev.amount + t.amount,
        count: prev.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.name === name);
        return {
          name,
          value: data.amount,
          count: data.count,
          color: cat ? cat.color : '#94a3b8',
          icon: cat ? cat.icon : '💸',
          percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [currentMonthExpenses, totalExpense]);

  // 2. Six-month comparison history
  const sixMonthHistory = React.useMemo(() => {
    const months: { monthKey: string; label: string; income: number; expense: number; net: number }[] = [];
    const [currY, currM] = currentMonth.split('-').map(Number);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currY, currM - 1 - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const thaiMonthsShort = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const label = `${thaiMonthsShort[d.getMonth()]} ${(d.getFullYear() + 543) % 100}`;

      const mTrans = allTransactions.filter((t) => t.date.startsWith(mKey));
      const inc = mTrans.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = mTrans.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({
        monthKey: mKey,
        label,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }
    return months;
  }, [allTransactions, currentMonth]);

  // 3. Daily spending cumulative curve in current month
  const dailySpendingData = React.useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const data: { day: number; label: string; daily: number; cumulative: number }[] = [];

    let cum = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
      const dayExpense = currentMonthExpenses
        .filter((t) => t.date === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      cum += dayExpense;

      data.push({
        day,
        label: `${day}`,
        daily: dayExpense,
        cumulative: cum,
      });
    }
    return data;
  }, [currentMonth, currentMonthExpenses]);

  return (
    <div id="analytics-visualization-card" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 id="analytics-card-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>ภาพวิเคราะห์ข้อมูลทางการเงิน ({formatThaiMonth(currentMonth)})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กราฟและสถิติเปรียบเทียบเพื่อการวางแผนการเงินที่มีประสิทธิภาพ
          </p>
        </div>

        {/* Tab Controls */}
        <div id="analytics-tabs-wrapper" className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            id="tab-btn-donut"
            onClick={() => setActiveTab('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'donut'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนรายจ่าย</span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>เปรียบเทียบย้อนหลัง</span>
          </button>

          <button
            id="tab-btn-trend"
            onClick={() => setActiveTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'trend'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มสะสมรายวัน</span>
          </button>

          <button
            id="tab-btn-table"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>ตารางสรุป</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Category Donut Chart */}
      {activeTab === 'donut' && (
        <div id="chart-panel-donut" className="pt-5">
          {expenseByCategory.length === 0 ? (
            <div className="py-14 text-center">
              <PieIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">กดปุ่ม "บันทึกรายการ" เพื่อเพิ่มรายจ่ายและดูภาพวิเคราะห์</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Graphic */}
              <div className="lg:col-span-6 h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseByCategory.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'จำนวนเงิน']}
                      labelFormatter={(label) => `หมวดหมู่: ${label}`}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown List */}
              <div className="lg:col-span-6 space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {expenseByCategory.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                        <span className="text-slate-400 text-[11px]">({cat.count} รายการ)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                        <span className="text-slate-500 font-medium ml-1.5">({cat.percentage}%)</span>
                      </div>
                    </div>
                    {/* Percent Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Six-Month History Comparison */}
      {activeTab === 'history' && (
        <div id="chart-panel-history" className="pt-5">
          <div className="mb-3 text-xs text-slate-500 flex items-center justify-between">
            <span>เปรียบเทียบรายรับและรายจ่ายย้อนหลัง 6 เดือน</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span>รายรับ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                <span>รายจ่าย</span>
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val > 1000 ? Math.round(val / 1000) + 'k' : val}`}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatCurrency(Number(value) || 0),
                    name === 'income' ? 'รายรับ' : 'รายจ่าย',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 3: Daily Spending Cumulative Curve */}
      {activeTab === 'trend' && (
        <div id="chart-panel-trend" className="pt-5">
          <div className="mb-3 text-xs text-slate-500">
            <span>แนวโน้มการใช้จ่ายสะสมรายวันตลอดเดือน {formatThaiMonth(currentMonth)}</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val > 1000 ? Math.round(val / 1000) + 'k' : val}`}
                />
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [
                    formatCurrency(Number(val) || 0),
                    name === 'cumulative' ? 'รายจ่ายสะสม' : 'รายจ่ายวันนั้น',
                  ]}
                  labelFormatter={(d) => `วันที่ ${d} ${formatThaiMonth(currentMonth)}`}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 4: Category Summary Table */}
      {activeTab === 'table' && (
        <div id="chart-panel-table" className="pt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">หมวดหมู่</th>
                <th className="py-2.5 px-3 text-center">ประเภท</th>
                <th className="py-2.5 px-3 text-center">จำนวนรายการ</th>
                <th className="py-2.5 px-3 text-right">ยอดรวม (บาท)</th>
                <th className="py-2.5 px-3 text-right">สัดส่วน</th>
                <th className="py-2.5 px-3 text-right">เฉลี่ย / รายการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenseByCategory.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                      รายจ่าย
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{cat.count}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(cat.value)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                    {cat.percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {formatCurrency(cat.value / (cat.count || 1))}
                  </td>
                </tr>
              ))}
              {currentMonthIncomes.length > 0 && (
                <tr className="bg-emerald-50/50 font-semibold text-emerald-900">
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span>💰</span>
                    <span>รายรับรวมทุกหมวดหมู่</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      รายรับ
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{currentMonthIncomes.length}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatCurrency(currentMonthIncomes.reduce((s, t) => s + t.amount, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right">100%</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">
                    {formatCurrency(
                      currentMonthIncomes.reduce((s, t) => s + t.amount, 0) / currentMonthIncomes.length
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
