import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Camera,
  Store,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { formatRupiah, generateRefId } from '../utils/formatters';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: (tx: Transaction) => void;
}

const SAMPLE_MERCHANTS = [
  { id: 'm1', name: 'Kopi Janji Jiwa - SCBD', category: 'F&B', defaultAmount: 35000, icon: '☕' },
  { id: 'm2', name: 'Indomaret Point Stasiun', category: 'Retail', defaultAmount: 48500, icon: '🏪' },
  { id: 'm3', name: 'Starbucks Coffee Indonesia', category: 'F&B', defaultAmount: 62000, icon: '🥤' },
  { id: 'm4', name: 'Warung Nasi Padang Sederhana', category: 'F&B', defaultAmount: 28000, icon: '🍛' },
  { id: 'm5', name: 'SPBU Pertamina Pasti Pas', category: 'Fuel', defaultAmount: 100000, icon: '⛽' },
];

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'SCAN' | 'MY_QR'>('SCAN');
  const [step, setStep] = useState<'SELECT_MERCHANT' | 'PAY_FORM' | 'PIN' | 'SUCCESS'>('SELECT_MERCHANT');
  const [selectedMerchant, setSelectedMerchant] = useState(SAMPLE_MERCHANTS[0]);
  const [amount, setAmount] = useState('35000');
  const [notes, setNotes] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [copiedQrData, setCopiedQrData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handleSelectMerchant = (merchant: typeof SAMPLE_MERCHANTS[0]) => {
    setSelectedMerchant(merchant);
    setAmount(merchant.defaultAmount.toString());
    setStep('PAY_FORM');
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10) || 0;
    if (numAmount < 1000) {
      alert('Nominal transaksi minimal Rp 1.000');
      return;
    }
    if (numAmount > user.balance) {
      alert(`Saldo tidak cukup. Saldo Anda: ${formatRupiah(user.balance)}`);
      return;
    }
    setStep('PIN');
  };

  const handlePinSubmit = () => {
    if (pinInput !== user.pin && pinInput !== '123456') {
      setPinError('PIN transaksi salah. Gunakan 123456.');
      return;
    }

    setPinError('');
    setIsProcessing(true);

    setTimeout(() => {
      const numAmount = parseInt(amount, 10) || 0;
      const refId = generateRefId('QR');

      const tx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        referenceId: refId,
        date: new Date().toISOString(),
        type: 'PAYMENT_QRIS',
        category: 'Pembayaran QRIS',
        title: selectedMerchant.name,
        amount: numAmount,
        fee: 0,
        total: numAmount,
        status: 'SUCCESS',
        senderName: user.name,
        recipientName: selectedMerchant.name,
        recipientProvider: 'QRIS Indonesia',
        notes: notes || `Pembayaran merchant QRIS ${selectedMerchant.name}`,
      };

      setCreatedTx(tx);
      setIsProcessing(false);
      setStep('SUCCESS');
      onSuccess(tx);
    }, 1200);
  };

  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 6) setPinInput((prev) => prev + num);
  };

  const handleKeypadDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const resetAndClose = () => {
    setStep('SELECT_MERCHANT');
    setAmount('35000');
    setNotes('');
    setPinInput('');
    setPinError('');
    setCreatedTx(null);
    onClose();
  };

  const numAmount = parseInt(amount, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">QRIS Standar Pembayaran</h3>
              <p className="text-xs text-slate-400">Scan &amp; Bayar Merchant / Tampilkan QR Saya</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 mx-6 mt-4 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('SCAN');
              setStep('SELECT_MERCHANT');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'SCAN' ? 'bg-teal-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bayar QRIS Merchant
          </button>
          <button
            onClick={() => setActiveTab('MY_QR')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'MY_QR' ? 'bg-teal-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QRIS Saya (Terima Uang)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* TAB: MY QR CODE */}
          {activeTab === 'MY_QR' && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-white rounded-2xl max-w-xs mx-auto shadow-2xl border-4 border-emerald-500/20">
                {/* QRIS Logo banner */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                  <span className="font-black text-slate-900 text-sm tracking-widest">QRIS</span>
                  <span className="text-[9px] text-slate-500 font-bold">GPN / BANK INDONESIA</span>
                </div>

                {/* Simulated QR Pattern */}
                <div className="w-48 h-48 mx-auto bg-slate-950 rounded-xl p-3 flex flex-col justify-between relative group">
                  <div className="grid grid-cols-6 gap-1 h-full w-full opacity-90">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30)
                            ? 'bg-emerald-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-slate-950 rounded-xl border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                      PAY
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">NMID: ID102938472910</p>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.qrCodeData);
                    setCopiedQrData(true);
                    setTimeout(() => setCopiedQrData(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
                >
                  {copiedQrData ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedQrData ? 'Kode Tersalin' : 'Salin String QRIS'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SCAN & PAY MERCHANT */}
          {activeTab === 'SCAN' && (
            <>
              {/* STEP 1: MERCHANT SIMULATION */}
              {step === 'SELECT_MERCHANT' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
                      <Camera className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-semibold text-white">Simulasi Scan Kamera QRIS Merchant</p>
                    <p className="text-[11px] text-slate-400">
                      Pilih merchant contoh di bawah untuk mensimulasikan pemindaian kode QRIS secara cepat.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Merchant Terdekat Available:</label>
                    {SAMPLE_MERCHANTS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMerchant(m)}
                        className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 rounded-xl text-left flex items-center justify-between transition"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{m.name}</p>
                            <p className="text-[10px] text-slate-400">{m.category} • QRIS Statis</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {formatRupiah(m.defaultAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: AMOUNT FORM */}
              {step === 'PAY_FORM' && (
                <form onSubmit={handleConfirmPay} className="space-y-4">
                  <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-2xl flex items-center space-x-3">
                    <span className="text-3xl">{selectedMerchant.icon}</span>
                    <div>
                      <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Merchant Terdeteksi</p>
                      <h4 className="text-sm font-bold text-white">{selectedMerchant.name}</h4>
                      <p className="text-[11px] text-slate-400">QRIS ID: ID202688921</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominal Pembayaran</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm font-mono">Rp</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold font-mono text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Saldo Anda: <strong className="text-emerald-400">{formatRupiah(user.balance)}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catatan Pembelian (Opsional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Pesanan #12 Kopi Cold Brew"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('SELECT_MERCHANT')}
                      className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                    >
                      Ulangi Scan
                    </button>
                    <button
                      type="submit"
                      disabled={numAmount < 1000 || numAmount > user.balance}
                      className="w-2/3 py-3 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-600/20 disabled:opacity-50"
                    >
                      <span>Konfirmasi &amp; Masukkan PIN</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PIN VERIFICATION */}
              {step === 'PIN' && (
                <div className="space-y-5 text-center">
                  <div>
                    <ShieldCheck className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-white">Masukkan 6 Digit PIN Transaksi</h4>
                    <p className="text-xs text-slate-400 mt-1">PIN Default: <code className="text-emerald-400 font-bold">123456</code></p>
                  </div>

                  <div className="flex justify-center space-x-3 py-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border-2 transition ${
                          pinInput.length > idx
                            ? 'bg-teal-400 border-teal-300 shadow-md shadow-teal-500/50 scale-110'
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
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-teal-600/20 disabled:opacity-40"
                  >
                    {isProcessing ? 'Memproses QRIS...' : 'Bayar Sekarang'}
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
                    <h4 className="text-lg font-bold text-white">Pembayaran QRIS Sukses!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Dibayarkan ke <strong className="text-white">{createdTx.title}</strong>
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
                      <span className="text-slate-400 font-sans">Metode:</span>
                      <span className="text-slate-200">QRIS GPN Instant</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Database Status:</span>
                      <span className="text-emerald-400 font-sans font-semibold">Saved to Google Sheets</span>
                    </div>
                  </div>

                  <button
                    onClick={resetAndClose}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-teal-600/20"
                  >
                    Selesai &amp; Kembali ke Wallet
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
