import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  PlusCircle,
  Send,
  QrCode,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatRupiah, maskAccountNumber } from '../utils/formatters';

interface BalanceCardProps {
  user: UserProfile;
  onOpenTopUp: () => void;
  onOpenTransfer: () => void;
  onOpenQris: () => void;
  onOpenPpob: () => void;
  onOpenMutasi: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  user,
  onOpenTopUp,
  onOpenTransfer,
  onOpenQris,
  onOpenPpob,
  onOpenMutasi,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState(false);

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(user.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mb-20 pointer-events-none" />

      {/* Top Wallet Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1">
            <span>Saldo Aktif Digital Wallet</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:text-white transition"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          <div className="flex items-baseline space-x-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              {showBalance ? formatRupiah(user.balance) : 'Rp •••••••••'}
            </h1>
          </div>
        </div>

        {/* Account Info */}
        <div className="flex items-center space-x-3 bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-3 sm:px-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">No. Rekening / Wallet ID</p>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-200">
                {user.accountNumber}
              </span>
              <button
                onClick={handleCopyAcc}
                className="p-1 text-slate-400 hover:text-emerald-400 transition"
                title="Salin No. Rekening"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-4 pt-6">
        {/* Top Up */}
        <button
          onClick={onOpenTopUp}
          id="btn-quick-topup"
          className="group flex flex-col items-center p-3 rounded-2xl bg-slate-800/40 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/40 transition duration-200"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 flex items-center justify-center mb-2 shadow-lg transition duration-200">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Top Up</span>
        </button>

        {/* Transfer */}
        <button
          onClick={onOpenTransfer}
          id="btn-quick-transfer"
          className="group flex flex-col items-center p-3 rounded-2xl bg-slate-800/40 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 transition duration-200"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white text-blue-400 flex items-center justify-center mb-2 shadow-lg transition duration-200">
            <Send className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Transfer</span>
        </button>

        {/* QRIS */}
        <button
          onClick={onOpenQris}
          id="btn-quick-qris"
          className="group flex flex-col items-center p-3 rounded-2xl bg-slate-800/40 hover:bg-teal-600/20 border border-slate-800 hover:border-teal-500/40 transition duration-200"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 group-hover:bg-teal-500 group-hover:text-slate-950 text-teal-400 flex items-center justify-center mb-2 shadow-lg transition duration-200">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Bayar QRIS</span>
        </button>

        {/* Tagihan / PPOB */}
        <button
          onClick={onOpenPpob}
          id="btn-quick-ppob"
          className="group flex flex-col items-center p-3 rounded-2xl bg-slate-800/40 hover:bg-amber-600/20 border border-slate-800 hover:border-amber-500/40 transition duration-200"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center mb-2 shadow-lg transition duration-200">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">PPOB</span>
        </button>

        {/* Mutasi */}
        <button
          onClick={onOpenMutasi}
          id="btn-quick-mutasi"
          className="group flex flex-col items-center p-3 rounded-2xl bg-slate-800/40 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/40 transition duration-200"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white text-purple-400 flex items-center justify-center mb-2 shadow-lg transition duration-200">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Mutasi</span>
        </button>
      </div>
    </div>
  );
};
