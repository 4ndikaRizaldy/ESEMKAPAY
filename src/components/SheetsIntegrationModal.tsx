import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode,
  Table,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { CODE_GS_SCRIPT, CODE_GS_SETUP_STEPS } from '../data/codeGsContent';
import { SheetsConfig } from '../types';

interface SheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetsConfig;
  onSaveConfig: (url: string) => Promise<{ success: boolean; message: string }>;
  onResetDemo: () => void;
}

export const SheetsIntegrationModal: React.FC<SheetsIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'CODE' | 'SCHEMA'>('GUIDE');
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_GS_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([CODE_GS_SCRIPT], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'Code.gs';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAppUrl.trim()) {
      setMessage({ type: 'error', text: 'Silakan masukkan Web App URL Google Apps Script Anda.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await onSaveConfig(webAppUrl.trim());
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Integrasi Database Google Sheets
                {config.isConnected ? (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Terhubung
                  </span>
                ) : (
                  <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Demo Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Hubungkan frontend pembayaran digital langsung ke Google Sheets sebagai backend utama via Google Apps Script (Code.gs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Web App URL Input */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800">
          <form onSubmit={handleSubmitUrl} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              URL Aplikasi Web Google Apps Script (Web App URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uji & Hubungkan</span>
                  </>
                )}
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                  message.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'GUIDE'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Panduan Setup (8 Langkah)</span>
          </button>
          <button
            onClick={() => setActiveTab('CODE')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'CODE'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. Kode Code.gs (Google Apps Script)</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'SCHEMA'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>3. Struktur Sheet Database</span>
          </button>
        </div>

        {/* Modal Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: GUIDE */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start space-x-3">
                <Play className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-200 mb-1">
                    Bagaimana Google Sheets Menjadi Backend Pembayaran?
                  </p>
                  <p className="leading-relaxed">
                    Google Apps Script (Code.gs) bertindak sebagai server API gratis. Setiap kali Anda melakukan Top Up, Transfer, Bayar QRIS, atau Beli Pulsa di aplikasi ini, data akan langsung dikirimkan dan disimpan otomatis ke baris tabel Google Sheets Anda!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                {CODE_GS_SETUP_STEPS.map((s) => (
                  <div
                    key={s.step}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                        {s.step}
                      </span>
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 pl-8 leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5 underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka Google Sheets Baru (sheets.new)
                </a>

                <button
                  onClick={() => setActiveTab('CODE')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2"
                >
                  <span>Lanjut ke Kode Code.gs</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CODE.GS */}
          {activeTab === 'CODE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">Code.gs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .gs</span>
                  </button>
                </div>
              </div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <pre className="p-4 text-[11px] font-mono text-emerald-300/90 leading-relaxed overflow-x-auto max-h-[350px] select-all">
                  {CODE_GS_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA */}
          {activeTab === 'SCHEMA' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Script <code className="text-emerald-400">Code.gs</code> akan secara otomatis membuat 4 lembar kerja (sheets) berikut beserta kolom dasarnya saat pertama kali dijalankan:
              </p>

              <div className="space-y-3">
                {/* Sheet 1 */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2">
                    <Table className="w-4 h-4" /> 1. Sheet: "Pengguna"
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">Menyimpan data profil dan saldo terkini pengguna.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono text-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-200">
                          <th className="p-1.5 border border-slate-700">ID_Pengguna</th>
                          <th className="p-1.5 border border-slate-700">Nama</th>
                          <th className="p-1.5 border border-slate-700">Nomor_HP</th>
                          <th className="p-1.5 border border-slate-700">Nomor_Rekening</th>
                          <th className="p-1.5 border border-slate-700">Saldo</th>
                          <th className="p-1.5 border border-slate-700">Terakhir_Diperbarui</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-1.5 border border-slate-800">USR-8821</td>
                          <td className="p-1.5 border border-slate-800">Andika Pratama</td>
                          <td className="p-1.5 border border-slate-800">081234567890</td>
                          <td className="p-1.5 border border-slate-800">8801928374</td>
                          <td className="p-1.5 border border-slate-800 font-bold text-emerald-400">2450000</td>
                          <td className="p-1.5 border border-slate-800">2026-08-12T18:00:00Z</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sheet 2 */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2">
                    <Table className="w-4 h-4" /> 2. Sheet: "Transaksi"
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">Mencatat riwayat transaksi digital (Top Up, Transfer, QRIS, PPOB).</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono text-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-200">
                          <th className="p-1.5 border border-slate-700">ID_Transaksi</th>
                          <th className="p-1.5 border border-slate-700">Ref_ID</th>
                          <th className="p-1.5 border border-slate-700">Tipe</th>
                          <th className="p-1.5 border border-slate-700">Nominal</th>
                          <th className="p-1.5 border border-slate-700">Status</th>
                          <th className="p-1.5 border border-slate-700">Penerima/Merchant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-1.5 border border-slate-800">TX-1092</td>
                          <td className="p-1.5 border border-slate-800">PAY-8821-X9A2</td>
                          <td className="p-1.5 border border-slate-800 text-blue-400">PAYMENT_QRIS</td>
                          <td className="p-1.5 border border-slate-800">35000</td>
                          <td className="p-1.5 border border-slate-800 text-emerald-400">SUCCESS</td>
                          <td className="p-1.5 border border-slate-800">Kopi Janji Jiwa</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onResetDemo}
            className="text-xs text-slate-400 hover:text-rose-400 font-medium transition"
          >
            Reset Data Demo Lokal
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
