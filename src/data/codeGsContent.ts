export const CODE_GS_SCRIPT = `/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Untuk Aplikasi Pembayaran Digital & Wallet
 * ==============================================================================
 * 
 * PETUNJUK DEPLOYMENT LENGKAP:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Klik menu "Ekstensi" > "Apps Script"
 * 3. Hapus semua isi file Code.gs yang ada, lalu salin (paste) seluruh kode ini.
 * 4. Klik ikon Simpan (💾) atau tekan Ctrl+S / Cmd+S.
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas > pilih "Terapkan sebagai Aplikasi Web" (New Deployment).
 * 6. Pada bagian "Jalankan sebagai" (Execute as): Pilih "Saya" (Me / email Anda).
 * 7. Pada bagian "Siapa yang memiliki akses" (Who has access): Pilih "Siapa saja" (Anyone).
 * 8. Klik "Terapkan" (Deploy) dan berikan Izin Akun Google (Allow permissions).
 * 9. Salin URL Aplikasi Web yang didapat (akhiran /exec).
 * 10. Masukkan URL tersebut ke menu "Pengaturan Google Sheets" di aplikasi web frontend ini.
 * 
 * ==============================================================================
 */

// Nama-nama Sheet Database
const SHEET_PENGGUNA = "Pengguna";
const SHEET_TRANSAKSI = "Transaksi";
const SHEET_MUTASI = "Mutasi";
const SHEET_PRODUK = "Produk_PPOB";

/**
 * Menginisialisasi Sheet jika belum ada
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Pengguna
  let sheetUser = ss.getSheetByName(SHEET_PENGGUNA);
  if (!sheetUser) {
    sheetUser = ss.insertSheet(SHEET_PENGGUNA);
    sheetUser.appendRow(["ID_Pengguna", "Nama", "Nomor_HP", "Email", "Nomor_Rekening", "Saldo", "PIN", "Terakhir_Diperbarui"]);
    sheetUser.appendRow(["USR-8821", "Andika Pratama", "081234567890", "andika@gmail.com", "8801928374", 2500000, "123456", new Date().toISOString()]);
    sheetUser.getRange("A1:H1").setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet 2: Transaksi
  let sheetTx = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheetTx) {
    sheetTx = ss.insertSheet(SHEET_TRANSAKSI);
    sheetTx.appendRow(["ID_Transaksi", "Ref_ID", "Tanggal", "Tipe", "Kategori", "Judul", "Nominal", "Biaya_Admin", "Total", "Status", "Pengirim", "Penerima", "Provider_Bank", "Catatan"]);
    sheetTx.appendRow([
      "TX-1001", "PAY-INIT-001", new Date().toISOString(), "TOPUP", "Top Up", "Top Up via BCA VA", 500000, 0, 500000, "SUCCESS", "BCA Virtual Account", "Andika Pratama", "BCA", "Top up saldo awal"
    ]);
    sheetTx.getRange("A1:N1").setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet 3: Mutasi
  let sheetMutasi = ss.getSheetByName(SHEET_MUTASI);
  if (!sheetMutasi) {
    sheetMutasi = ss.insertSheet(SHEET_MUTASI);
    sheetMutasi.appendRow(["ID_Mutasi", "Tanggal", "Tipe_Mutasi", "Keterangan", "Nominal", "Saldo_Sebelum", "Saldo_Sesudah"]);
    sheetMutasi.appendRow(["MUT-001", new Date().toISOString(), "KREDIT", "Top Up Saldo Awal", 500000, 2000000, 2500000]);
    sheetMutasi.getRange("A1:G1").setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet 4: Produk PPOB
  let sheetProduk = ss.getSheetByName(SHEET_PRODUK);
  if (!sheetProduk) {
    sheetProduk = ss.insertSheet(SHEET_PRODUK);
    sheetProduk.appendRow(["ID_Produk", "Kategori", "Provider", "Nama_Produk", "Nominal", "Harga", "Biaya_Admin", "Deskripsi"]);
    sheetProduk.appendRow(["PL-TSEL-25", "PULSA", "Telkomsel", "Pulsa Telkomsel 25.000", 25000, 25500, 1000, "Masa aktif 30 hari"]);
    sheetProduk.appendRow(["PL-TSEL-50", "PULSA", "Telkomsel", "Pulsa Telkomsel 50.000", 50000, 50500, 1000, "Masa aktif 45 hari"]);
    sheetProduk.appendRow(["PL-ISAT-25", "PULSA", "Indosat", "Pulsa Indosat 25.000", 25000, 25300, 1000, "Masa aktif 30 hari"]);
    sheetProduk.appendRow(["PLN-TOKEN-50", "PLN", "PLN", "Token Listrik 50.000", 50000, 50000, 2500, "Token Listrik Prepaid"]);
    sheetProduk.appendRow(["PLN-TOKEN-100", "PLN", "PLN", "Token Listrik 100.000", 100000, 100000, 2500, "Token Listrik Prepaid"]);
    sheetProduk.getRange("A1:H1").setFontWeight("bold").setBackground("#e2e8f0");
  }
}

/**
 * Standard CORS Response Generator
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET Requests (Health Check & Fetch All Data)
 */
function doGet(e) {
  try {
    initDatabase();
    
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_DATA";

    if (action === "PING") {
      return createJsonResponse({
        status: "SUCCESS",
        message: "Google Apps Script Backend Pembayaran Digital Siap!",
        timestamp: new Date().toISOString()
      });
    }

    return handleGetData();
  } catch (err) {
    return createJsonResponse({
      status: "ERROR",
      message: err.toString()
    });
  }
}

/**
 * Handle POST Requests (Commands: Transaksi, Top Up, Transfer, PPOB)
 */
function doPost(e) {
  try {
    initDatabase();
    
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    const action = contents.action || "GET_DATA";

    switch (action) {
      case "GET_DATA":
        return handleGetData();

      case "ADD_TRANSACTION":
        return handleAddTransaction(contents.data);

      case "UPDATE_BALANCE":
        return handleUpdateBalance(contents.amount, contents.type, contents.reason);

      case "TEST_CONNECTION":
        return createJsonResponse({
          status: "SUCCESS",
          message: "Koneksi ke Google Sheets Berhasil!",
          sheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
          time: new Date().toISOString()
        });

      default:
        return createJsonResponse({
          status: "ERROR",
          message: "Aksi tidak dikenal: " + action
        });
    }
  } catch (err) {
    return createJsonResponse({
      status: "ERROR",
      message: err.toString()
    });
  }
}

/**
 * Ambil semua data pengguna & riwayat transaksi dari Google Sheet
 */
function handleGetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get User Profile
  const sheetUser = ss.getSheetByName(SHEET_PENGGUNA);
  const userRows = sheetUser.getDataRange().getValues();
  let user = {
    id: "USR-8821",
    name: "Andika Pratama",
    phone: "081234567890",
    email: "andika@gmail.com",
    accountNumber: "8801928374",
    balance: 2500000,
    pin: "123456",
    updatedAt: new Date().toISOString()
  };

  if (userRows.length > 1) {
    const row = userRows[1];
    user = {
      id: row[0] || "USR-8821",
      name: row[1] || "Andika Pratama",
      phone: row[2] || "081234567890",
      email: row[3] || "andika@gmail.com",
      accountNumber: row[4] || "8801928374",
      balance: Number(row[5]) || 0,
      pin: String(row[6]) || "123456",
      updatedAt: row[7] || new Date().toISOString()
    };
  }

  // Get Transactions
  const sheetTx = ss.getSheetByName(SHEET_TRANSAKSI);
  const txRows = sheetTx.getDataRange().getValues();
  const transactions = [];

  for (let i = 1; i < txRows.length; i++) {
    const r = txRows[i];
    if (r[0]) {
      transactions.unshift({
        id: String(r[0]),
        referenceId: String(r[1]),
        date: r[2] ? new Date(r[2]).toISOString() : new Date().toISOString(),
        type: r[3],
        category: r[4],
        title: r[5],
        amount: Number(r[6]) || 0,
        fee: Number(r[7]) || 0,
        total: Number(r[8]) || (Number(r[6]) + Number(r[7])),
        status: r[9] || "SUCCESS",
        senderName: r[10] || "",
        recipientName: r[11] || "",
        recipientProvider: r[12] || "",
        notes: r[13] || ""
      });
    }
  }

  return createJsonResponse({
    status: "SUCCESS",
    user: user,
    transactions: transactions
  });
}

/**
 * Tambah transaksi baru & perbarui saldo pengguna di Google Sheet
 */
function handleAddTransaction(tx) {
  if (!tx) {
    return createJsonResponse({ status: "ERROR", message: "Data transaksi tidak ditemukan" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Simpan Transaksi ke Sheet Transaksi
  const sheetTx = ss.getSheetByName(SHEET_TRANSAKSI);
  sheetTx.appendRow([
    tx.id || ("TX-" + Date.now()),
    tx.referenceId || ("REF-" + Math.floor(Math.random() * 1000000)),
    tx.date || new Date().toISOString(),
    tx.type || "PAYMENT_QRIS",
    tx.category || "Pembayaran",
    tx.title || "Transaksi Digital",
    tx.amount || 0,
    tx.fee || 0,
    tx.total || ((tx.amount || 0) + (tx.fee || 0)),
    tx.status || "SUCCESS",
    tx.senderName || "Andika Pratama",
    tx.recipientName || "",
    tx.recipientProvider || "",
    tx.notes || ""
  ]);

  // 2. Perbarui Saldo di Sheet Pengguna
  const sheetUser = ss.getSheetByName(SHEET_PENGGUNA);
  const userRows = sheetUser.getDataRange().getValues();
  let currentBalance = 0;

  if (userRows.length > 1) {
    currentBalance = Number(userRows[1][5]) || 0;
    
    // Hitung perubahan saldo
    let balanceChange = 0;
    if (tx.type === "TOPUP" || tx.type === "INCOME") {
      balanceChange = Number(tx.amount) || 0;
    } else {
      balanceChange = -Number(tx.total || tx.amount || 0);
    }

    const newBalance = currentBalance + balanceChange;
    
    // Update cell Saldo & Terakhir_Diperbarui
    sheetUser.getRange(2, 6).setValue(newBalance);
    sheetUser.getRange(2, 8).setValue(new Date().toISOString());

    // 3. Catat ke Sheet Mutasi
    const sheetMutasi = ss.getSheetByName(SHEET_MUTASI);
    sheetMutasi.appendRow([
      "MUT-" + Date.now(),
      new Date().toISOString(),
      balanceChange >= 0 ? "KREDIT" : "DEBET",
      tx.title || tx.category || "Transaksi Digital",
      Math.abs(balanceChange),
      currentBalance,
      newBalance
    ]);

    return createJsonResponse({
      status: "SUCCESS",
      message: "Transaksi berhasil dicatat ke Google Sheets!",
      newBalance: newBalance,
      transactionId: tx.id
    });
  }

  return createJsonResponse({
    status: "SUCCESS",
    message: "Transaksi dicatat",
    transactionId: tx.id
  });
}

/**
 * Manual Update Balance
 */
function handleUpdateBalance(amount, type, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUser = ss.getSheetByName(SHEET_PENGGUNA);
  const userRows = sheetUser.getDataRange().getValues();

  if (userRows.length > 1) {
    const currentBalance = Number(userRows[1][5]) || 0;
    const change = type === "ADD" ? Number(amount) : -Number(amount);
    const newBalance = currentBalance + change;

    sheetUser.getRange(2, 6).setValue(newBalance);
    sheetUser.getRange(2, 8).setValue(new Date().toISOString());

    const sheetMutasi = ss.getSheetByName(SHEET_MUTASI);
    sheetMutasi.appendRow([
      "MUT-" + Date.now(),
      new Date().toISOString(),
      type === "ADD" ? "KREDIT" : "DEBET",
      reason || "Penyesuaian Saldo Manual",
      Math.abs(change),
      currentBalance,
      newBalance
    ]);

    return createJsonResponse({
      status: "SUCCESS",
      message: "Saldo berhasil diperbarui di Google Sheets",
      newBalance: newBalance
    });
  }

  return createJsonResponse({ status: "ERROR", message: "Data pengguna tidak ditemukan" });
}
`;

export const CODE_GS_SETUP_STEPS = [
  {
    step: 1,
    title: 'Buat Spreadsheet Baru',
    description: 'Buka browser dan akses Google Sheets di https://sheets.new. Beri nama spreadsheet misalnya "Database Pembayaran Digital".',
  },
  {
    step: 2,
    title: 'Buka Apps Script Editor',
    description: 'Di Google Sheets, klik menu bar atas: Ekstensi > Apps Script.',
  },
  {
    step: 3,
    title: 'Salin Kode Code.gs',
    description: 'Hapus seluruh isi default Code.gs, lalu paste kode yang telah kami sediakan di tombol Salin Kode.',
  },
  {
    step: 4,
    title: 'Simpan Script',
    description: 'Klik tombol Simpan (ikon disket 💾) atau gunakan shortcut Ctrl+S / Cmd+S.',
  },
  {
    step: 5,
    title: 'Terapkan sebagai Aplikasi Web (Deploy)',
    description: 'Klik tombol Terapkan (Deploy) di sudut kanan atas > pilih "Terapkan sebagai Aplikasi Web" (New deployment).',
  },
  {
    step: 6,
    title: 'Atur Akses Keamanan',
    description: 'Ubah "Jalankan sebagai" -> "Saya" (email Anda), dan "Siapa yang memiliki akses" -> "Siapa saja" (Anyone). Kemudian klik Terapkan.',
  },
  {
    step: 7,
    title: 'Izinkan Akses (Permissions)',
    description: 'Klik "Beri Izin" (Authorize Access), pilih akun Google Anda, klik "Advanced", lalu "Go to Untitled project (unsafe)" & klik "Allow".',
  },
  {
    step: 8,
    title: 'Salin Web App URL & Tempel di App',
    description: 'Salin Web App URL (berakhiran /exec) lalu tempel ke dalam form Pengaturan Google Sheets di aplikasi ini.',
  },
];
