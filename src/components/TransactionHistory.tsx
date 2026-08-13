import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Send,
  QrCode,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatDateIndonesian, formatRupiah } from '../utils/formatters';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter((tx) => {
    // Type filter
    if (filterType !== 'ALL' && tx.type !== filterType) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(query);
      const matchCat = tx.category.toLowerCase().includes(query);
      const matchRef = tx.referenceId.toLowerCase().includes(query);
      const matchRecipient = (tx.recipientName || '').toLowerCase().includes(query);
      return matchTitle || matchCat || matchRef || matchRecipient;
    }
    return true;
  });

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'TOPUP':
      case 'INCOME':
        return <PlusCircle className="w-5 h-5 text-emerald-400" />;
      case 'TRANSFER':
        return <Send className="w-5 h-5 text-blue-400" />;
      case 'PAYMENT_QRIS':
        return <QrCode className="w-5 h-5 text-teal-400" />;
      case 'PPOB':
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;

    const headers = ['ID_Transaksi,Ref_ID,Tanggal,Tipe,Kategori,Judul,Nominal,Biaya_Admin,Total,Status,Penerima,Catatan\n'];
    const rows = transactions.map((t) =>
      [
        t.id,
        t.referenceId,
        `"${t.date}"`,
        t.type,
        `"${t.category}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        t.amount,
        t.fee,
        t.total,
        t.status,
        `"${(t.recipientName || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Riwayat-Pembayaran-Digital-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Riwayat Transaksi Digital
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-medium">
              {filtered.length} Transaksi
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tersimpan otomatis dan tersinkronisasi ke Google Sheets
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-2 border border-slate-700 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 my-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, ref ID, merchant, atau nominal..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'TOPUP', label: 'Top Up' },
            { id: 'TRANSFER', label: 'Transfer' },
            { id: 'PAYMENT_QRIS', label: 'QRIS' },
            { id: 'PPOB', label: 'PPOB' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                filterType === tab.id
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian atau filter yang berbeda.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncoming = tx.type === 'TOPUP' || tx.type === 'INCOME';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="group p-4 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                    {getTxIcon(tx.type)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatDateIndonesian(tx.date)}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{tx.referenceId}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isIncoming ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isIncoming ? '+' : '-'}{formatRupiah(tx.total || tx.amount)}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
                    Sukses
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
