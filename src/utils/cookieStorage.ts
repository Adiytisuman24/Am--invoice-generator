interface CompanySettings {
  companyName: string;
  logoUrl: string;
  fromAddress: string;
  phone: string;
  websiteUrl: string;
  logoSize?: number;
}

const STORAGE_KEY = 'company_settings';
const COOKIE_NAME = 'company_settings';
const COOKIE_EXPIRY_DAYS = 365;

export const saveSettingsToCookie = (settings: CompanySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    const cookieValue = encodeURIComponent(JSON.stringify(settings));
    document.cookie = `${COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettingsFromCookie = (): CompanySettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      try {
        const settings = JSON.parse(decodeURIComponent(value));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        return settings;
      } catch (error) {
        console.error('Error parsing cookie:', error);
      }
    }
  }

  return null;
};

export const clearSettingsCookie = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const downloadSettingsAsJSON = (settings: CompanySettings): void => {
  try {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `company-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading settings:', error);
  }
};

export const loadSettingsFromJSON = (file: File): Promise<CompanySettings> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        resolve(settings);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
