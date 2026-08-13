import React from 'react';
import { Database, ShieldCheck, RefreshCw, Smartphone, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { SheetsConfig, UserProfile } from '../types';
import { formatRupiah } from '../utils/formatters';

interface NavbarProps {
  user: UserProfile;
  sheetsConfig: SheetsConfig;
  onOpenSheetsModal: () => void;
  onSyncSheets: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  sheetsConfig,
  onOpenSheetsModal,
  onSyncSheets,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">PaySheets</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Digital Wallet
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Powered by Google Sheets & Apps Script
              </p>
            </div>
          </div>

          {/* Google Sheets Sync Badge & User Actions */}
          <div className="flex items-center space-x-3">
            {/* Sync Button */}
            {sheetsConfig.isConnected && (
              <button
                onClick={onSyncSheets}
                disabled={isSyncing}
                title="Sinkronkan dengan Google Sheets"
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition flex items-center space-x-1.5 text-xs font-medium"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Sync</span>
              </button>
            )}

            {/* Google Sheets Status Button */}
            <button
              onClick={onOpenSheetsModal}
              id="btn-sheets-config"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                sheetsConfig.isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="font-semibold flex items-center gap-1">
                  {sheetsConfig.isConnected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                      Google Sheets Terhubung
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline" />
                      Hubungkan Google Sheets
                    </>
                  )}
                </span>
                <span className="text-[10px] opacity-80 hidden sm:inline">
                  {sheetsConfig.isConnected ? 'Database Aktif (Code.gs)' : 'Klik untuk Setup Code.gs'}
                </span>
              </div>
            </button>

            {/* User Avatar */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400 ring-2 ring-emerald-500/20">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                <p className="text-[11px] text-emerald-400 font-medium">{formatRupiah(user.balance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
