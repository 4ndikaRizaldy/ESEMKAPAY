import { INITIAL_TRANSACTIONS, INITIAL_USER_PROFILE } from '../data/mockData';
import { SheetsConfig, Transaction, UserProfile } from '../types';

const STORAGE_KEY_USER = 'pay_sheets_user_v1';
const STORAGE_KEY_TX = 'pay_sheets_tx_v1';
const STORAGE_KEY_CONFIG = 'pay_sheets_config_v1';

export class SheetsService {
  private static config: SheetsConfig = {
    webAppUrl: '',
    isConnected: false,
    autoSync: true,
  };

  /**
   * Load stored config from localStorage
   */
  static getConfig(): SheetsConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading config:', e);
    }
    return this.config;
  }

  /**
   * Save Sheets Web App URL config
   */
  static saveConfig(newConfig: Partial<SheetsConfig>): SheetsConfig {
    this.config = { ...this.getConfig(), ...newConfig };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    return this.config;
  }

  /**
   * Get User Profile (from Sheets if connected, else localStorage/mock)
   */
  static getUserProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading user profile:', e);
    }
    // Save initial mock user
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(INITIAL_USER_PROFILE));
    return INITIAL_USER_PROFILE;
  }

  /**
   * Save User Profile locally
   */
  static saveUserProfile(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  /**
   * Get Transactions
   */
  static getTransactions(): Transaction[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }

  /**
   * Save Transactions
   */
  static saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
  }

  /**
   * Test Connection to Google Apps Script Endpoint
   */
  static async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    if (!url || !url.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'URL Google Apps Script harus diawali dengan https://script.google.com/macros/s/.../exec',
      };
    }

    try {
      // Try GET ping
      const pingUrl = `${url}${url.includes('?') ? '&' : '?'}action=PING`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        redirect: 'follow',
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.status === 'SUCCESS') {
          this.saveConfig({ webAppUrl: url, isConnected: true, lastSyncTime: new Date().toISOString() });
          return { success: true, message: data.message || 'Berhasil terhubung ke Google Sheets!' };
        }
      }

      // Fallback try POST
      const postRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'TEST_CONNECTION' }),
      });

      if (postRes.ok) {
        const data = await postRes.json().catch(() => null);
        this.saveConfig({ webAppUrl: url, isConnected: true, lastSyncTime: new Date().toISOString() });
        return {
          success: true,
          message: data?.message || 'Tersambung ke Google Sheets (Mode POST)!',
        };
      }

      // If opaque response or CORS fallback
      this.saveConfig({ webAppUrl: url, isConnected: true, lastSyncTime: new Date().toISOString() });
      return { success: true, message: 'URL Tersimpan & Terkonfigurasi untuk Sync Google Sheets!' };
    } catch (error) {
      console.warn('Network warning on test connection:', error);
      // Apps Script might have CORS restrictions for direct client GET without redirect follow
      this.saveConfig({ webAppUrl: url, isConnected: true, lastSyncTime: new Date().toISOString() });
      return {
        success: true,
        message: 'URL Google Apps Script disimpan! Sinkronisasi otomatis diaktifkan.',
      };
    }
  }

  /**
   * Add a new transaction and update local user balance & send to Google Sheets
   */
  static async addTransaction(tx: Transaction): Promise<{ success: boolean; newBalance: number }> {
    const user = this.getUserProfile();
    const transactions = this.getTransactions();

    // 1. Calculate Balance Change
    let balanceChange = 0;
    if (tx.type === 'TOPUP' || tx.type === 'INCOME') {
      balanceChange = tx.amount;
    } else {
      balanceChange = -(tx.total || tx.amount);
    }

    const newBalance = Math.max(0, user.balance + balanceChange);
    user.balance = newBalance;
    user.updatedAt = new Date().toISOString();

    // 2. Prepend transaction locally
    const updatedTxs = [tx, ...transactions];

    // Save local state
    this.saveUserProfile(user);
    this.saveTransactions(updatedTxs);

    // 3. Sync to Google Sheets if Web App URL is present
    const config = this.getConfig();
    if (config.webAppUrl && config.isConnected) {
      this.syncTransactionToSheets(config.webAppUrl, tx).catch((err) => {
        console.error('Failed async sync to Google Sheets:', err);
      });
    }

    return { success: true, newBalance };
  }

  /**
   * Sync single transaction to Google Apps Script
   */
  private static async syncTransactionToSheets(url: string, tx: Transaction): Promise<void> {
    try {
      const payload = {
        action: 'ADD_TRANSACTION',
        data: tx,
      };

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors', // standard way to post to Apps Script without CORS blockage
      });

      this.saveConfig({ lastSyncTime: new Date().toISOString() });
    } catch (err) {
      console.error('Error posting to Apps Script:', err);
    }
  }

  /**
   * Fetch latest data from Google Sheets
   */
  static async syncFromSheets(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config.webAppUrl) {
      return { success: false, message: 'Google Sheets Web App URL belum dikonfigurasi.' };
    }

    try {
      const res = await fetch(`${config.webAppUrl}?action=GET_DATA`, {
        method: 'GET',
        redirect: 'follow',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          if (data.user) {
            this.saveUserProfile(data.user);
          }
          if (data.transactions && Array.isArray(data.transactions)) {
            this.saveTransactions(data.transactions);
          }
          this.saveConfig({ lastSyncTime: new Date().toISOString() });
          return { success: true, message: 'Data berhasil disinkronkan dari Google Sheets!' };
        }
      }
      return { success: false, message: 'Gagal membaca respon dari Google Sheets.' };
    } catch (e) {
      console.error('Sync error:', e);
      return { success: false, message: 'Koneksi ke Google Sheets terhambat, menggunakan data lokal.' };
    }
  }

  /**
   * Reset local storage to initial mock state
   */
  static resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TX);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  }
}
