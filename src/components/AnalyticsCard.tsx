import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, PieChart, Shield } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AnalyticsCardProps {
  transactions: Transaction[];
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ transactions }) => {
  // Calculate total income and expenses
  let totalIncome = 0;
  let totalExpense = 0;

  const categoriesMap: { [key: string]: number } = {};

  transactions.forEach((tx) => {
    if (tx.type === 'TOPUP' || tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.total || tx.amount;
      const cat = tx.category || 'Lainnya';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (tx.total || tx.amount);
    }
  });

  const categoriesSorted = Object.entries(categoriesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Analisis Mutasi &amp; Pengeluaran</h3>
            <p className="text-[11px] text-slate-400">Ringkasan arus kas dompet digital Anda</p>
          </div>
        </div>
      </div>

      {/* Cashflow Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pemasukan</span>
          </div>
          <p className="text-base font-extrabold font-mono text-white">{formatRupiah(totalIncome)}</p>
        </div>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Pengeluaran</span>
          </div>
          <p className="text-base font-extrabold font-mono text-white">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Category Progress Bars */}
      {categoriesSorted.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-slate-300">Pengeluaran Berdasarkan Kategori:</p>
          {categoriesSorted.map(([catName, catTotal]) => {
            const percentage = totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
            return (
              <div key={catName} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{catName}</span>
                  <span className="font-mono text-slate-400 font-bold">
                    {formatRupiah(catTotal)} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
