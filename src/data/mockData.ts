import { BankOrEwallet, PpobProduct, Transaction, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'USR-8821',
  name: 'Andika Pratama',
  phone: '081234567890',
  email: 'andika@gmail.com',
  accountNumber: '8801928374',
  balance: 2450000,
  qrCodeData: '00020101021226670016ID.CO.PAYMENT.WWW01189360091100123456785204581253033605802ID5914ANDIKA PRATAMA6013JAKARTA SELAT6304C0F2',
  pin: '123456',
  updatedAt: new Date().toISOString(),
};

export const BANK_LIST: BankOrEwallet[] = [
  { id: 'bca', name: 'Bank Central Asia (BCA)', code: '014', category: 'BANK', iconColor: 'bg-blue-600' },
  { id: 'mandiri', name: 'Bank Mandiri', code: '008', category: 'BANK', iconColor: 'bg-amber-600' },
  { id: 'bri', name: 'Bank Rakyat Indonesia (BRI)', code: '002', category: 'BANK', iconColor: 'bg-blue-700' },
  { id: 'bni', name: 'Bank Negara Indonesia (BNI)', code: '009', category: 'BANK', iconColor: 'bg-orange-600' },
  { id: 'cimb', name: 'CIMB Niaga', code: '022', category: 'BANK', iconColor: 'bg-red-700' },
  { id: 'permata', name: 'Bank Permata', code: '013', category: 'BANK', iconColor: 'bg-emerald-600' },
  { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', code: '451', category: 'BANK', iconColor: 'bg-teal-600' },
  { id: 'seabank', name: 'SeaBank Indonesia', code: '535', category: 'BANK', iconColor: 'bg-sky-500' },
];

export const EWALLET_LIST: BankOrEwallet[] = [
  { id: 'gopay', name: 'GoPay', code: 'GOPAY', category: 'EWALLET', iconColor: 'bg-emerald-500' },
  { id: 'dana', name: 'DANA Digital Wallet', code: 'DANA', category: 'EWALLET', iconColor: 'bg-blue-500' },
  { id: 'ovo', name: 'OVO Payment', code: 'OVO', category: 'EWALLET', iconColor: 'bg-purple-600' },
  { id: 'shopeepay', name: 'ShopeePay', code: 'SHOPEEPAY', category: 'EWALLET', iconColor: 'bg-orange-500' },
  { id: 'linkaja', name: 'LinkAja', code: 'LINKAJA', category: 'EWALLET', iconColor: 'bg-red-600' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-1092',
    referenceId: 'PAY-8821-X9A2',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'PAYMENT_QRIS',
    category: 'QRIS Payment',
    title: 'Kopi Janji Jiwa - SCBD',
    amount: 35000,
    fee: 0,
    total: 35000,
    status: 'SUCCESS',
    senderName: 'Andika Pratama',
    recipientName: 'Kopi Janji Jiwa SCBD',
    recipientProvider: 'QRIS',
    notes: '2x Ice Americano Regular',
  },
  {
    id: 'TX-1091',
    referenceId: 'PAY-8821-L0M3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'TRANSFER',
    category: 'Transfer Bank',
    title: 'Transfer ke BCA - Budi Santoso',
    amount: 250000,
    fee: 2500,
    total: 252500,
    status: 'SUCCESS',
    senderName: 'Andika Pratama',
    recipientName: 'Budi Santoso',
    recipientAccount: '5271293847',
    recipientProvider: 'BCA',
    notes: 'Bayar patungan makan siang',
  },
  {
    id: 'TX-1090',
    referenceId: 'PAY-8821-TP01',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: 'TOPUP',
    category: 'Top Up Saldo',
    title: 'Top Up via Mandiri Virtual Account',
    amount: 1000000,
    fee: 0,
    total: 1000000,
    status: 'SUCCESS',
    senderName: 'Mandiri Virtual Account',
    recipientName: 'Andika Pratama',
    recipientAccount: '8801928374',
    recipientProvider: 'Mandiri',
    notes: 'Top Up Saldo Sukses',
  },
  {
    id: 'TX-1089',
    referenceId: 'PAY-8821-PPOB1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    type: 'PPOB',
    category: 'Token Listrik PLN',
    title: 'Token Listrik PLN 100.000',
    amount: 100000,
    fee: 2500,
    total: 102500,
    status: 'SUCCESS',
    senderName: 'Andika Pratama',
    recipientName: 'Meter ID 14209823412',
    recipientProvider: 'PLN Prepaid',
    notes: 'Token: 8291-3012-9982-1029-4412',
  },
  {
    id: 'TX-1088',
    referenceId: 'PAY-8821-PPOB2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    type: 'PPOB',
    category: 'Pulsa & Data',
    title: 'Pulsa Telkomsel 50.000',
    amount: 50000,
    fee: 1500,
    total: 51500,
    status: 'SUCCESS',
    senderName: 'Andika Pratama',
    recipientName: '081234567890',
    recipientProvider: 'Telkomsel',
    notes: 'Pengisian pulsa seluler',
  },
];

export const PPOB_PRODUCTS: PpobProduct[] = [
  // PULSA
  { id: 'PL-TSEL-25', category: 'PULSA', provider: 'Telkomsel', name: 'Pulsa Telkomsel 25.000', nominal: 25000, price: 25500, adminFee: 1000, description: 'Masa aktif +30 hari', badge: 'Populer' },
  { id: 'PL-TSEL-50', category: 'PULSA', provider: 'Telkomsel', name: 'Pulsa Telkomsel 50.000', nominal: 50000, price: 50500, adminFee: 1000, description: 'Masa aktif +45 hari', badge: 'Best Seller' },
  { id: 'PL-TSEL-100', category: 'PULSA', provider: 'Telkomsel', name: 'Pulsa Telkomsel 100.000', nominal: 100000, price: 100000, adminFee: 0, description: 'Bebas biaya admin', badge: 'Hemat' },
  { id: 'PL-ISAT-25', category: 'PULSA', provider: 'Indosat', name: 'Pulsa Indosat IM3 25.000', nominal: 25000, price: 25300, adminFee: 1000, description: 'Masa aktif +30 hari' },
  { id: 'PL-ISAT-50', category: 'PULSA', provider: 'Indosat', name: 'Pulsa Indosat IM3 50.000', nominal: 50000, price: 50300, adminFee: 1000, description: 'Masa aktif +45 hari' },
  { id: 'PL-XL-50', category: 'PULSA', provider: 'XL Axiata', name: 'Pulsa XL Axiata 50.000', nominal: 50000, price: 50500, adminFee: 1000, description: 'Masa aktif +45 hari' },

  // DATA
  { id: 'DT-TSEL-10GB', category: 'DATA', provider: 'Telkomsel', name: 'Telkomsel Internet OMG 10GB', nominal: 10000, price: 45000, adminFee: 1000, description: '10GB 24 Jam (30 Hari)', badge: 'Rekomendasi' },
  { id: 'DT-TSEL-25GB', category: 'DATA', provider: 'Telkomsel', name: 'Telkomsel Combo Sakti 25GB', nominal: 25000, price: 85000, adminFee: 1000, description: '25GB + Unlimited Chat (30 Hari)' },
  { id: 'DT-ISAT-15GB', category: 'DATA', provider: 'Indosat', name: 'Freedom Internet 15GB', nominal: 15000, price: 52000, adminFee: 1000, description: 'Full Kuota Utama 15GB (30 Hari)' },

  // PLN
  { id: 'PLN-TOKEN-20', category: 'PLN', provider: 'PLN', name: 'Token PLN 20.000', nominal: 20000, price: 20000, adminFee: 2500, description: 'Token Listrik Prabayar' },
  { id: 'PLN-TOKEN-50', category: 'PLN', provider: 'PLN', name: 'Token PLN 50.000', nominal: 50000, price: 50000, adminFee: 2500, description: 'Token Listrik Prabayar', badge: 'Terlaris' },
  { id: 'PLN-TOKEN-100', category: 'PLN', provider: 'PLN', name: 'Token PLN 100.000', nominal: 100000, price: 100000, adminFee: 2500, description: 'Token Listrik Prabayar' },
  { id: 'PLN-TOKEN-200', category: 'PLN', provider: 'PLN', name: 'Token PLN 200.000', nominal: 200000, price: 200000, adminFee: 2500, description: 'Token Listrik Prabayar' },

  // PDAM
  { id: 'PDAM-TGR', category: 'PDAM', provider: 'PDAM', name: 'Tagihan Air PDAM Tirta Kerta', nominal: 0, price: 78500, adminFee: 2500, description: 'Cek & Bayar Tagihan Air Bulanan' },

  // EWALLET TOPUP
  { id: 'EW-GOPAY-50', category: 'EWALLET', provider: 'GoPay', name: 'Top Up GoPay Customer 50.000', nominal: 50000, price: 50000, adminFee: 1000, description: 'Pengisian saldo GoPay' },
  { id: 'EW-DANA-100', category: 'EWALLET', provider: 'DANA', name: 'Top Up DANA Wallet 100.000', nominal: 100000, price: 100000, adminFee: 1000, description: 'Pengisian saldo DANA' },
  { id: 'EW-OVO-50', category: 'EWALLET', provider: 'OVO', name: 'Top Up OVO Cash 50.000', nominal: 50000, price: 50000, adminFee: 1500, description: 'Pengisian saldo OVO' },

  // GAME
  { id: 'GM-MLBB-86', category: 'GAME', provider: 'Mobile Legends', name: 'Mobile Legends 86 Diamonds', nominal: 86, price: 22000, adminFee: 0, description: 'Proses Instan via User ID' },
  { id: 'GM-MLBB-257', category: 'GAME', provider: 'Mobile Legends', name: 'Mobile Legends 257 Diamonds', nominal: 257, price: 65000, adminFee: 0, description: 'Proses Instan via User ID', badge: 'Favorit' },
  { id: 'GM-FF-140', category: 'GAME', provider: 'Free Fire', name: 'Free Fire 140 Diamonds', nominal: 140, price: 20000, adminFee: 0, description: 'Proses Instan via Player ID' },
];
