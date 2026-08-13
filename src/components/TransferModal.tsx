import React, { useState } from 'react';
import {
  X,
  Send,
  Building2,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search,
} from 'lucide-react';
import { BANK_LIST, EWALLET_LIST } from '../data/mockData';
import { BankOrEwallet, Transaction } from '../types';
import { formatRupiah, generateRefId } from '../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  userPin: string;
  onSuccess: (tx: Transaction) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  userPin,
  onSuccess,
}) => {
  const [step, setStep] = useState<'RECIPIENT' | 'AMOUNT' | 'PIN' | 'SUCCESS'>('RECIPIENT');
  const [transferCategory, setTransferCategory] = useState<'BANK' | 'EWALLET'>('BANK');
  const [selectedDest, setSelectedDest] = useState<BankOrEwallet>(BANK_LIST[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: 'BANK' | 'EWALLET') => {
    setTransferCategory(cat);
    setSelectedDest(cat === 'BANK' ? BANK_LIST[0] : EWALLET_LIST[0]);
    setIsValidated(false);
    setRecipientName('');
  };

  const handleValidateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 5) {
      alert('Masukkan nomor rekening atau nomor HP yang valid (minimal 5 digit)');
      return;
    }

    // Simulated recipient lookup
    const names = ['Budi Santoso', 'Siti Rahmawati', 'Dedi Kurniawan', 'Rina Wijaya', 'Eko Prasetyo'];
    const randomName = names[Math.floor(Math.abs(accountNumber.charCodeAt(0) || 0) % names.length)];
    
    setRecipientName(randomName);
    setIsValidated(true);
    setStep('AMOUNT');
  };

  const handleConfirmAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10) || 0;
    const fee = transferCategory === 'BANK' ? 2500 : 1000;

    if (numAmount < 10000) {
      alert('Nominal transfer minimal Rp 10.000');
      return;
    }

    if (numAmount + fee > userBalance) {
      alert(`Saldo tidak mencukupi. Saldo Anda: ${formatRupiah(userBalance)}`);
      return;
    }

    setStep('PIN');
  };

  const handlePinSubmit = () => {
    if (pinInput !== userPin && pinInput !== '123456') {
      setPinError('PIN keamanan Anda salah. Silakan coba lagi.');
      return;
    }

    setPinError('');
    setIsProcessing(true);

    setTimeout(() => {
      const numAmount = parseInt(amount, 10) || 0;
      const fee = transferCategory === 'BANK' ? 2500 : 1000;
      const refId = generateRefId('TR');

      const tx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        referenceId: refId,
        date: new Date().toISOString(),
        type: 'TRANSFER',
        category: transferCategory === 'BANK' ? 'Transfer Bank' : 'E-Wallet Transfer',
        title: `Transfer ke ${selectedDest.name} - ${recipientName}`,
        amount: numAmount,
        fee: fee,
        total: numAmount + fee,
        status: 'SUCCESS',
        senderName: 'Saya (Wallet)',
        recipientName: recipientName,
        recipientAccount: accountNumber,
        recipientProvider: selectedDest.name,
        notes: notes || `Transfer uang ke ${recipientName}`,
      };

      setCreatedTx(tx);
      setIsProcessing(false);
      setStep('SUCCESS');
      onSuccess(tx);
    }, 1200);
  };

  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + num);
    }
  };

  const handleKeypadDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const resetAndClose = () => {
    setStep('RECIPIENT');
    setAccountNumber('');
    setIsValidated(false);
    setRecipientName('');
    setAmount('');
    setNotes('');
    setPinInput('');
    setPinError('');
    setCreatedTx(null);
    onClose();
  };

  const numAmount = parseInt(amount, 10) || 0;
  const fee = transferCategory === 'BANK' ? 2500 : 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Transfer Uang</h3>
              <p className="text-xs text-slate-400">Kirim ke rekening bank atau e-wallet seluruh Indonesia</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* STEP 1: RECIPIENT CHOICE */}
          {step === 'RECIPIENT' && (
            <form onSubmit={handleValidateAccount} className="space-y-5">
              {/* Category Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('BANK')}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2 ${
                    transferCategory === 'BANK'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Transfer Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('EWALLET')}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2 ${
                    transferCategory === 'EWALLET'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>E-Wallet</span>
                </button>
              </div>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih {transferCategory === 'BANK' ? 'Bank Tujuan' : 'E-Wallet Tujuan'}
                </label>
                <select
                  value={selectedDest.id}
                  onChange={(e) => {
                    const list = transferCategory === 'BANK' ? BANK_LIST : EWALLET_LIST;
                    const found = list.find((item) => item.id === e.target.value);
                    if (found) setSelectedDest(found);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {(transferCategory === 'BANK' ? BANK_LIST : EWALLET_LIST).map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account / Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Rekening / Nomor HP
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={transferCategory === 'BANK' ? 'Contoh: 5271293847' : 'Contoh: 081234567890'}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Cek Rekening
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Sistem akan memverifikasi nama pemilik rekening secara otomatis sebelum proses transfer.
              </p>
            </form>
          )}

          {/* STEP 2: AMOUNT & NOTES */}
          {step === 'AMOUNT' && (
            <form onSubmit={handleConfirmAmount} className="space-y-5">
              {/* Verified Recipient Card */}
              <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Penerima Terverifikasi</p>
                  <h4 className="text-sm font-bold text-white mt-0.5">{recipientName}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedDest.name} - {accountNumber}
                  </p>
                </div>
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>

              {/* Nominal Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominal Transfer</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Saldo Anda: <strong className="text-emerald-400">{formatRupiah(userBalance)}</strong>
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Bayar patungan / Hadiah"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Breakdown */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Nominal Transfer:</span>
                  <span className="font-mono text-white">{formatRupiah(numAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Biaya Admin:</span>
                  <span className="font-mono text-white">{formatRupiah(fee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-slate-300">Total Potongan Saldo:</span>
                  <span className="font-mono text-blue-400">{formatRupiah(numAmount + fee)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep('RECIPIENT')}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={numAmount < 10000 || numAmount + fee > userBalance}
                  className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  <span>Konfirmasi &amp; Masukkan PIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PIN VERIFICATION KEYPAD */}
          {step === 'PIN' && (
            <div className="space-y-5 text-center">
              <div>
                <ShieldCheck className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">Masukkan 6 Digit PIN Transaksi</h4>
                <p className="text-xs text-slate-400 mt-1">PIN Default Demo: <code className="text-emerald-400 font-bold">123456</code></p>
              </div>

              {/* PIN Indicator Dots */}
              <div className="flex justify-center space-x-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition ${
                      pinInput.length > idx
                        ? 'bg-blue-500 border-blue-400 shadow-md shadow-blue-500/50 scale-110'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}

              {/* Numeric Keypad Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') setPinInput('');
                      else if (btn === '⌫') handleKeypadDelete();
                      else handleKeypadPress(btn);
                    }}
                    className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl font-mono font-bold text-lg text-slate-100 hover:text-white transition active:scale-95"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePinSubmit}
                disabled={pinInput.length < 6 || isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-40"
              >
                {isProcessing ? 'Mengirim Transaksi ke Google Sheets...' : 'Kirim Uang Sekarang'}
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && createdTx && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Transfer Berhasil!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kirim ke <strong className="text-white">{createdTx.recipientName}</strong>
                </p>
                <p className="text-xl font-extrabold text-emerald-400 font-mono mt-2">
                  {formatRupiah(createdTx.amount)}
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Ref ID:</span>
                  <span className="text-slate-200">{createdTx.referenceId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Tujuan:</span>
                  <span className="text-slate-200">{createdTx.recipientProvider} ({createdTx.recipientAccount})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Database Status:</span>
                  <span className="text-emerald-400 font-sans font-semibold">Tersimpan di Google Sheets</span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-600/20"
              >
                Selesai &amp; Kembali ke Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
