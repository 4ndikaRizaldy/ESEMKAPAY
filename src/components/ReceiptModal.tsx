import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, Download, Share2, Wallet, Database } from 'lucide-react';
import { Transaction } from '../types';
import { formatDateIndonesian, formatRupiah } from '../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const text = `
========================================
       STRUK PEMBAYARAN DIGITAL
            PAYSHEETS WALLET
========================================
Ref ID         : ${transaction.referenceId}
ID Transaksi   : ${transaction.id}
Waktu          : ${formatDateIndonesian(transaction.date)}
Jenis          : ${transaction.category}
Judul          : ${transaction.title}
Status         : ${transaction.status}
----------------------------------------
Penerima       : ${transaction.recipientName || '-'}
Penyedia/Bank  : ${transaction.recipientProvider || '-'}
Catatan        : ${transaction.notes || '-'}
----------------------------------------
Nominal        : ${formatRupiah(transaction.amount)}
Biaya Admin    : ${formatRupiah(transaction.fee)}
TOTAL BAYAR    : ${formatRupiah(transaction.total)}
----------------------------------------
Status Database: Tersimpan di Google Sheets
========================================
Terima kasih telah bertransaksi dengan PaySheets.
`;

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Struk-${transaction.referenceId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Struk Transaksi Digital</span>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Card Body */}
        <div className="p-6 bg-slate-950/60 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Transaksi Sukses</p>
            <h3 className="text-2xl font-extrabold text-white font-mono">{formatRupiah(transaction.total)}</h3>
            <p className="text-xs text-slate-400 font-medium">{transaction.title}</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2.5 font-mono">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-sans">No. Referensi:</span>
              <div className="flex items-center space-x-1">
                <span className="text-slate-200 font-bold">{transaction.referenceId}</span>
                <button onClick={handleCopyRef} className="p-1 text-slate-400 hover:text-emerald-400">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-sans">Waktu:</span>
              <span className="text-slate-200">{formatDateIndonesian(transaction.date)}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-sans">Kategori:</span>
              <span className="text-slate-200">{transaction.category}</span>
            </div>

            {transaction.recipientName && (
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-sans">Penerima / Tujuan:</span>
                <span className="text-slate-200">{transaction.recipientName}</span>
              </div>
            )}

            {transaction.recipientProvider && (
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-sans">Penyedia / Bank:</span>
                <span className="text-slate-200">{transaction.recipientProvider}</span>
              </div>
            )}

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-sans">Nominal:</span>
              <span className="text-slate-200">{formatRupiah(transaction.amount)}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-sans">Biaya Admin:</span>
              <span className="text-slate-200">{formatRupiah(transaction.fee)}</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-sans flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Backend Sync:
              </span>
              <span className="text-emerald-400 font-semibold font-sans">Google Sheets (Code.gs)</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Struk Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
