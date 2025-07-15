// js/storageHelper.js
export class StorageHelper {
  static setItem(key, value, useSession = false) {
    const storage = useSession ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(value));
  }

  static getItem(key, useSession = false) {
    const storage = useSession ? sessionStorage : localStorage;
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static removeItem(key, useSession = false) {
    const storage = useSession ? sessionStorage : localStorage;
    storage.removeItem(key);
  }

  static clearAll(useSession = false) {
    const storage = useSession ? sessionStorage : localStorage;
    storage.clear();
  }

  static purgeNonAuth() {
    // Keep auth-related (token, user); remove others
    localStorage.removeItem('theme');
    localStorage.removeItem('uiMode');
    // Add other non-auth keys as needed
  }
}