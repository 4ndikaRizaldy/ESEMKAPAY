import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, Building2, QrCode } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, generateRefId } from '../utils/formatters';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
  userPhone: string;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2500000];

const PAYMENT_METHODS = [
  { id: 'va_bca', name: 'BCA Virtual Account', provider: 'BCA', category: 'VA', fee: 0, icon: '🏦' },
  { id: 'va_mandiri', name: 'Mandiri Virtual Account', provider: 'Mandiri', category: 'VA', fee: 0, icon: '🏛️' },
  { id: 'va_bri', name: 'BRI Virtual Account', provider: 'BRI', category: 'VA', fee: 0, icon: '💳' },
  { id: 'va_bni', name: 'BNI Virtual Account', provider: 'BNI', category: 'VA', fee: 0, icon: '🏪' },
  { id: 'qris_instan', name: 'QRIS Top Up Instan', provider: 'QRIS', category: 'QRIS', fee: 0, icon: '📱' },
  { id: 'alfamart', name: 'Alfamart / Alfamidi', provider: 'Alfamart', category: 'RETAIL', fee: 2500, icon: '🏬' },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userPhone,
}) => {
  const [step, setStep] = useState<'INPUT' | 'PAYMENT_INFO' | 'SUCCESS'>('INPUT');
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);

  if (!isOpen) return null;

  const amountToUse = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const vaNumber = `88009${userPhone.replace(/^0/, '')}`;

  const handleNextPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToUse < 10000) {
      alert('Nominal Top Up minimal Rp 10.000');
      return;
    }
    setStep('PAYMENT_INFO');
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const refId = generateRefId('TP');
      const tx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        referenceId: refId,
        date: new Date().toISOString(),
        type: 'TOPUP',
        category: 'Top Up Saldo',
        title: `Top Up via ${selectedMethod.name}`,
        amount: amountToUse,
        fee: selectedMethod.fee,
        total: amountToUse + selectedMethod.fee,
        status: 'SUCCESS',
        senderName: selectedMethod.name,
        recipientName: 'Wallet Saya',
        recipientProvider: selectedMethod.provider,
        paymentMethod: selectedMethod.name,
        notes: `Top up saldo digital wallet via ${selectedMethod.name}`,
      };

      setCreatedTx(tx);
      setIsProcessing(false);
      setStep('SUCCESS');
      onSuccess(tx);
    }, 1200);
  };

  const resetAndClose = () => {
    setStep('INPUT');
    setSelectedAmount(100000);
    setCustomAmount('');
    setCreatedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Top Up Saldo Wallet</h3>
              <p className="text-xs text-slate-400">Isi ulang saldo instan tanpa biaya admin VA</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: INPUT NOMINAL & METHOD */}
          {step === 'INPUT' && (
            <form onSubmit={handleNextPayment} className="space-y-5">
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilih Nominal Top Up
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Atau ketik nominal lain..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Metode Pembayaran
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedMethod.id === method.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{method.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {method.fee === 0 ? 'Bebas Biaya Admin' : `Biaya admin: ${formatRupiah(method.fee)}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod.id === method.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700'
                        }`}
                      >
                        {selectedMethod.id === method.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Pembayaran:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatRupiah(amountToUse + selectedMethod.fee)}
                </span>
              </div>

              <button
                type="submit"
                disabled={amountToUse < 10000}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                <span>Lanjut ke Instruksi Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT INSTRUCTIONS & SIMULATOR */}
          {step === 'PAYMENT_INFO' && (
            <div className="space-y-5">
              <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">Nomor Virtual Account {selectedMethod.provider}</p>
                <div className="flex items-center justify-center space-x-3">
                  <span className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                    {vaNumber}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vaNumber);
                      setCopiedVa(true);
                      setTimeout(() => setCopiedVa(false), 2000);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                  >
                    {copiedVa ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Total yang harus dibayar: <strong className="text-white">{formatRupiah(amountToUse + selectedMethod.fee)}</strong></p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cara Pembayaran:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed text-[11px]">
                  <li>Buka aplikasi Mobile Banking / ATM {selectedMethod.provider} Anda.</li>
                  <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                  <li>Masukkan kode VA: <code className="text-emerald-400 font-mono font-bold">{vaNumber}</code></li>
                  <li>Periksa nama penerima: <strong>PaySheets ({userPhone})</strong></li>
                  <li>Konfirmasi dan masukkan PIN transaksi Anda.</li>
                </ol>
              </div>

              {/* Instant Simulator Button */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Memproses Top Up ke Google Sheets...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Berhasil</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('INPUT')}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Ganti Nominal / Metode
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && createdTx && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Top Up Berhasil!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Saldo Anda bertambah <span className="text-emerald-400 font-bold font-mono">{formatRupiah(createdTx.amount)}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Ref ID:</span>
                  <span className="text-slate-200">{createdTx.referenceId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Metode:</span>
                  <span className="text-slate-200">{createdTx.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Database Status:</span>
                  <span className="text-emerald-400 font-sans font-semibold">Synced to Google Sheets</span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-600/20"
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
