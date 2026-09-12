/**
 * Storage Utility for Press Ledger (No Tax - Clean Backend Ready Data Store)
 */

const STORAGE_KEYS = {
  SETTINGS: 'press_ledger_settings',
  JOBS: 'press_ledger_jobs',
  CLIENTS: 'press_ledger_clients',
  INVOICES: 'press_ledger_invoices',
  INVENTORY: 'press_ledger_inventory',
  LEDGER: 'press_ledger_entries',
};

const DEFAULT_SETTINGS = {
  companyName: 'My Printing Press',
  address: '',
  phone: '',
  email: '',
  currency: '৳',
  ctpPlateRate: 250,
  impressionRatePerThousand: 150,
};

const INITIAL_CLIENTS = [];
const INITIAL_JOBS = [];
const INITIAL_INVOICES = [];
const INITIAL_INVENTORY = [];
const INITIAL_LEDGER = [];

/**
 * Storage Helpers
 */
export function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function loadAllAppData() {
  return {
    settings: getStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    jobs: getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS),
    clients: getStoredData(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
    invoices: getStoredData(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
    inventory: getStoredData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY),
    ledger: getStoredData(STORAGE_KEYS.LEDGER, INITIAL_LEDGER),
  };
}

export function clearAllAppData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key === STORAGE_KEYS.SETTINGS) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_SETTINGS));
    } else {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
}

export { STORAGE_KEYS, DEFAULT_SETTINGS };
