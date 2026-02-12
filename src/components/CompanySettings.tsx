import { Upload, Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
// import { supabase } from '../lib/supabase';
import { saveSettingsToCookie, loadSettingsFromCookie } from '../utils/cookieStorage';

interface CompanySettingsProps {
  onSave: () => void;
  onBack: () => void;
}

export default function CompanySettings({ onSave, onBack }: CompanySettingsProps) {
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only load from cookie/localStorage
    const cookieSettings = loadSettingsFromCookie();
    if (cookieSettings) {
      setCompanyName(cookieSettings.companyName);
      setLogoUrl(cookieSettings.logoUrl);
      setFromAddress(cookieSettings.fromAddress);
      setPhone(cookieSettings.phone);
      setWebsiteUrl(cookieSettings.websiteUrl);
    }
  }, []);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    return `Saved ${Math.floor(seconds / 60)}m ago`;
  };

  const autoSave = useCallback(() => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const settingsData = {
        companyName,
        logoUrl,
        fromAddress,
        phone,
        websiteUrl,
      };
      saveSettingsToCookie(settingsData);
      setLastSaved(new Date());
      onSave();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [companyName, logoUrl, fromAddress, phone, websiteUrl, isSaving, onSave]);

  const debouncedAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 300);
  }, [autoSave]);

  useEffect(() => {
    if (settingsId) {
      debouncedAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [companyName, logoUrl, fromAddress, phone, websiteUrl, debouncedAutoSave, settingsId]);

  const handleSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await autoSave();
    window.location.reload();
  };


  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Company Settings</h2>
            {lastSaved && (
              <p className="text-xs text-green-600 mt-1">
                {formatLastSaved()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quotation
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Auto-saves every 0.3 seconds. Changes appear instantly in preview.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your company name"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will auto-populate "Quotation From" business name field
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="max-h-24 object-contain mb-2 border border-gray-200 rounded p-2"
            />
          )}
          <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload Logo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Address
          </label>
          <textarea
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleSave()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter your company address..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will appear as a clickable link in the footer of your quotations
          </p>
        </div>
      </div>
    </div>
  );
}
