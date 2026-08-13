import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { BalanceCard } from './components/BalanceCard';
import { TopUpModal } from './components/TopUpModal';
import { TransferModal } from './components/TransferModal';
import { QrisModal } from './components/QrisModal';
import { PpobModal } from './components/PpobModal';
import { SheetsIntegrationModal } from './components/SheetsIntegrationModal';
import { TransactionHistory } from './components/TransactionHistory';
import { ReceiptModal } from './components/ReceiptModal';
import { AnalyticsCard } from './components/AnalyticsCard';
import { SheetsService } from './services/sheetsService';
import { SheetsConfig, Transaction, UserProfile } from './types';
import { Database, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(SheetsService.getUserProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(SheetsService.getTransactions());
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(SheetsService.getConfig());

  // Modal States
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  const [isPpobOpen, setIsPpobOpen] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state with local storage on mount
  useEffect(() => {
    setUser(SheetsService.getUserProfile());
    setTransactions(SheetsService.getTransactions());
    setSheetsConfig(SheetsService.getConfig());
  }, []);

  // Handle new transaction success
  const handleTransactionSuccess = async (tx: Transaction) => {
    const result = await SheetsService.addTransaction(tx);
    setUser(SheetsService.getUserProfile());
    setTransactions(SheetsService.getTransactions());
    setSheetsConfig(SheetsService.getConfig());
  };

  // Handle save Sheets Config
  const handleSaveSheetsConfig = async (url: string) => {
    const result = await SheetsService.testConnection(url);
    setSheetsConfig(SheetsService.getConfig());
    if (result.success) {
      handleSyncSheets();
    }
    return result;
  };

  // Handle live sync from Google Sheets
  const handleSyncSheets = async () => {
    setIsSyncing(true);
    const res = await SheetsService.syncFromSheets();
    setUser(SheetsService.getUserProfile());
    setTransactions(SheetsService.getTransactions());
    setSheetsConfig(SheetsService.getConfig());
    setIsSyncing(false);
  };

  // Handle reset demo data
  const handleResetDemo = () => {
    if (confirm('Apakah Anda yakin ingin mereset data lokal ke status demo awal?')) {
      SheetsService.resetDemoData();
      setUser(SheetsService.getUserProfile());
      setTransactions(SheetsService.getTransactions());
      setSheetsConfig(SheetsService.getConfig());
      setIsSheetsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        user={user}
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onSyncSheets={handleSyncSheets}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Google Sheets Demo / Connected Banner */}
        {!sheetsConfig.isConnected ? (
          <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Mode Demo Lokal Aktif
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  Aplikasi saat ini menggunakan database demo lokal. Hubungkan ke Google Sheets Anda dengan meng-copy file <code className="text-amber-300 font-mono font-bold">Code.gs</code> untuk mengaktifkan sinkronisasi otomatis real-time.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition shrink-0 flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Hubungkan Google Sheets (Code.gs)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 px-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Google Sheets Backend Aktif • Terakhir Sinkron:{' '}
                <strong className="font-mono">{sheetsConfig.lastSyncTime ? new Date(sheetsConfig.lastSyncTime).toLocaleTimeString('id-ID') : 'Baru Saja'}</strong>
              </span>
            </div>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Pengaturan Database
            </button>
          </div>
        )}

        {/* Balance Card & Digital Wallet Summary */}
        <BalanceCard
          user={user}
          onOpenTopUp={() => setIsTopUpOpen(true)}
          onOpenTransfer={() => setIsTransferOpen(true)}
          onOpenQris={() => setIsQrisOpen(true)}
          onOpenPpob={() => setIsPpobOpen(true)}
          onOpenMutasi={() => {
            const el = document.getElementById('transaction-history-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Content Section: Transactions & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Transaction History (2 cols) */}
          <div id="transaction-history-section" className="lg:col-span-2 space-y-6">
            <TransactionHistory
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTxForReceipt(tx)}
            />
          </div>

          {/* Right Column: Analytics & Quick Features (1 col) */}
          <div className="space-y-6">
            <AnalyticsCard transactions={transactions} />

            {/* Google Apps Script Feature Box */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Arsitektur Code.gs Google Sheets</h4>
                  <p className="text-[11px] text-slate-400">Database serverless 100% gratis</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Aplikasi ini dirancang dengan integrasi backend Google Apps Script yang mendukung permintaan RESTful JSON API via metode <code className="text-emerald-400 font-mono">doGet()</code> dan <code className="text-emerald-400 font-mono">doPost()</code>.
              </p>

              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Lihat Script Code.gs &amp; Skema Tabel</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PaySheets Digital Wallet • Dibuat dengan React, TypeScript, Tailwind CSS &amp; Google Sheets</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSheetsModalOpen(true)} className="hover:text-slate-300">
              Dokumentasi Code.gs
            </button>
            <span>•</span>
            <button onClick={handleResetDemo} className="hover:text-rose-400">
              Reset Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SheetsIntegrationModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        config={sheetsConfig}
        onSaveConfig={handleSaveSheetsConfig}
        onResetDemo={handleResetDemo}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTransactionSuccess}
        userPhone={user.phone}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        userBalance={user.balance}
        userPin={user.pin}
        onSuccess={handleTransactionSuccess}
      />

      <QrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        user={user}
        onSuccess={handleTransactionSuccess}
      />

      <PpobModal
        isOpen={isPpobOpen}
        onClose={() => setIsPpobOpen(false)}
        user={user}
        onSuccess={handleTransactionSuccess}
      />

      <ReceiptModal
        transaction={selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
      />
    </div>
  );
}
