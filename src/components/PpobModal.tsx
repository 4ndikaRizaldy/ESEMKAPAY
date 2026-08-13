import React, { useState } from 'react';
import {
  X,
  Zap,
  Smartphone,
  Wifi,
  Droplet,
  Wallet,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { PPOB_PRODUCTS } from '../data/mockData';
import { PpobCategory, PpobProduct, Transaction, UserProfile } from '../types';
import { formatRupiah, generateRefId } from '../utils/formatters';

interface PpobModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: (tx: Transaction) => void;
}

const CATEGORIES: { id: PpobCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'PULSA', label: 'Pulsa', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'DATA', label: 'Paket Data', icon: <Wifi className="w-4 h-4" /> },
  { id: 'PLN', label: 'Token PLN', icon: <Zap className="w-4 h-4" /> },
  { id: 'PDAM', label: 'Air PDAM', icon: <Droplet className="w-4 h-4" /> },
  { id: 'EWALLET', label: 'E-Wallet', icon: <Wallet className="w-4 h-4" /> },
  { id: 'GAME', label: 'Voucher Game', icon: <Gamepad2 className="w-4 h-4" /> },
];

export const PpobModal: React.FC<PpobModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [activeCategory, setActiveCategory] = useState<PpobCategory>('PULSA');
  const [targetNumber, setTargetNumber] = useState(user.phone);
  const [selectedProduct, setSelectedProduct] = useState<PpobProduct | null>(null);
  const [step, setStep] = useState<'CATALOG' | 'CONFIRM' | 'PIN' | 'SUCCESS'>('CATALOG');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Auto detect operator
  const detectProvider = (num: string): string => {
    if (num.startsWith('0811') || num.startsWith('0812') || num.startsWith('0813') || num.startsWith('0821') || num.startsWith('0822')) return 'Telkomsel';
    if (num.startsWith('0814') || num.startsWith('0815') || num.startsWith('0816') || num.startsWith('0855') || num.startsWith('0856') || num.startsWith('0857')) return 'Indosat';
    if (num.startsWith('0817') || num.startsWith('0818') || num.startsWith('0819') || num.startsWith('0859') || num.startsWith('0877') || num.startsWith('0878')) return 'XL Axiata';
    return '';
  };

  const detectedProvider = detectProvider(targetNumber);

  // Filter products by category
  const filteredProducts = PPOB_PRODUCTS.filter((p) => {
    if (p.category !== activeCategory) return false;
    if (detectedProvider && (activeCategory === 'PULSA' || activeCategory === 'DATA')) {
      return p.provider.toLowerCase().includes(detectedProvider.toLowerCase());
    }
    return true;
  });

  const handleSelectProduct = (product: PpobProduct) => {
    setSelectedProduct(product);
    setStep('CONFIRM');
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNumber || targetNumber.length < 5) {
      alert('Masukkan nomor / ID pelanggan yang valid');
      return;
    }
    if (!selectedProduct) return;

    const totalCost = selectedProduct.price + selectedProduct.adminFee;
    if (totalCost > user.balance) {
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

    if (!selectedProduct) return;

    setPinError('');
    setIsProcessing(true);

    setTimeout(() => {
      const totalCost = selectedProduct.price + selectedProduct.adminFee;
      const refId = generateRefId('PP');

      const tx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        referenceId: refId,
        date: new Date().toISOString(),
        type: 'PPOB',
        category: CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Tagihan PPOB',
        title: selectedProduct.name,
        amount: selectedProduct.price,
        fee: selectedProduct.adminFee,
        total: totalCost,
        status: 'SUCCESS',
        senderName: user.name,
        recipientName: targetNumber,
        recipientProvider: selectedProduct.provider,
        notes: `Pembelian PPOB ${selectedProduct.name} ke ${targetNumber}`,
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
    setStep('CATALOG');
    setSelectedProduct(null);
    setPinInput('');
    setPinError('');
    setCreatedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Layanan Tagihan &amp; PPOB</h3>
              <p className="text-xs text-slate-400">Pulsa, Paket Data, Token PLN, PDAM &amp; Game</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: CATALOG & INPUT */}
          {step === 'CATALOG' && (
            <div className="space-y-5">
              {/* Category Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      activeCategory === cat.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-[10px] font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Number Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between items-center">
                  <span>
                    {activeCategory === 'PLN'
                      ? 'Nomor Meter / ID Pelanggan PLN'
                      : activeCategory === 'PDAM'
                      ? 'Nomor Pelanggan PDAM'
                      : activeCategory === 'GAME'
                      ? 'User ID Game'
                      : 'Nomor HP Pelanggan'}
                  </span>
                  {detectedProvider && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Operator: {detectedProvider}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Product Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Pilih Produk:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {(filteredProducts.length > 0 ? filteredProducts : PPOB_PRODUCTS.filter((p) => p.category === activeCategory)).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left flex flex-col justify-between transition group relative"
                    >
                      {prod.badge && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                          {prod.badge}
                        </span>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{prod.description}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Harga</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatRupiah(prod.price + prod.adminFee)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY */}
          {step === 'CONFIRM' && selectedProduct && (
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-1">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Detail Pembelian</p>
                <h4 className="text-sm font-bold text-white">{selectedProduct.name}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Tujuan: <strong className="text-white">{targetNumber}</strong> ({selectedProduct.provider})
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Harga Produk:</span>
                  <span className="font-mono text-white">{formatRupiah(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Biaya Admin PPOB:</span>
                  <span className="font-mono text-white">{formatRupiah(selectedProduct.adminFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-slate-300">Total Pembayaran:</span>
                  <span className="font-mono text-amber-400">
                    {formatRupiah(selectedProduct.price + selectedProduct.adminFee)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Saldo Anda saat ini: <strong className="text-emerald-400">{formatRupiah(user.balance)}</strong>
              </p>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('CATALOG')}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Ubah Produk
                </button>
                <button
                  type="submit"
                  disabled={selectedProduct.price + selectedProduct.adminFee > user.balance}
                  className="w-2/3 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PIN */}
          {step === 'PIN' && (
            <div className="space-y-5 text-center">
              <div>
                <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">Masukkan 6 Digit PIN Transaksi</h4>
                <p className="text-xs text-slate-400 mt-1">PIN Default Demo: <code className="text-emerald-400 font-bold">123456</code></p>
              </div>

              <div className="flex justify-center space-x-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition ${
                      pinInput.length > idx
                        ? 'bg-amber-400 border-amber-300 shadow-md shadow-amber-500/50 scale-110'
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
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-amber-600/20 disabled:opacity-40"
              >
                {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi Pembelian'}
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
                <h4 className="text-lg font-bold text-white">Transaksi PPOB Sukses!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Produk <strong className="text-white">{createdTx.title}</strong>
                </p>
                <p className="text-xl font-extrabold text-emerald-400 font-mono mt-2">
                  {formatRupiah(createdTx.total)}
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Ref ID:</span>
                  <span className="text-slate-200">{createdTx.referenceId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">Tujuan:</span>
                  <span className="text-slate-200">{createdTx.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Database Status:</span>
                  <span className="text-emerald-400 font-sans font-semibold">Tersimpan di Google Sheets</span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-amber-600/20"
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
