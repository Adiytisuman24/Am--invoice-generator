import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Download, Save, File as FileEdit, Settings } from 'lucide-react';
import QuotationHeader from './components/QuotationHeader';
import BusinessInfo from './components/BusinessInfo';
import ItemsTable from './components/ItemsTable';
import AdditionalOptions from './components/AdditionalOptions';
import QuotationPreview from './components/QuotationPreview';
import TermsEditor from './components/TermsEditor';
import PaymentSection from './components/PaymentSection';
import CompanySettings from './components/CompanySettings';
import { supabase, BusinessInfoType, QuotationItemType, BankDetailsType } from './lib/supabase';
import { generateQuotationNumber } from './utils/quotationNumber';
import { loadSettingsFromCookie, saveSettingsToCookie } from './utils/cookieStorage';

function App() {
  const [showTermsEditor, setShowTermsEditor] = useState(false);
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [quotationLogoUrl, setQuotationLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(120);
  const [documentType, setDocumentType] = useState<'quotation' | 'invoice'>('quotation');
  const [quotationNo, setQuotationNo] = useState(generateQuotationNumber('quotation'));
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const handleDocumentTypeChange = (type: 'quotation' | 'invoice') => {
    setDocumentType(type);
    setQuotationNo(generateQuotationNumber(type));
  };

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    const cookieSettings = loadSettingsFromCookie();

    if (cookieSettings) {
      setCompanyName(cookieSettings.companyName);
      setCompanyLogoUrl(cookieSettings.logoUrl);
      setCompanyPhone(cookieSettings.phone);
      setCompanyAddress(cookieSettings.fromAddress);
      setWebsiteUrl(cookieSettings.websiteUrl);
      setLogoSize(cookieSettings.logoSize || 120);

      setFromInfo(prev => ({
        ...prev,
        business_name: cookieSettings.companyName || prev.business_name,
        address: cookieSettings.fromAddress || prev.address,
        phone: cookieSettings.phone || prev.phone,
      }));
    }

    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setCompanyName(data.company_name || '');
      setCompanyLogoUrl(data.logo_url || '');
      setCompanyPhone(data.phone || '');
      setCompanyAddress(data.from_address || '');
      setWebsiteUrl(data.website_url || '');

      const existingSettings = loadSettingsFromCookie();
      setLogoSize(existingSettings?.logoSize || 120);

      setFromInfo(prev => ({
        ...prev,
        business_name: data.company_name || prev.business_name,
        address: data.from_address || prev.address,
        phone: data.phone || prev.phone,
      }));

      saveSettingsToCookie({
        companyName: data.company_name || '',
        logoUrl: data.logo_url || '',
        fromAddress: data.from_address || '',
        phone: data.phone || '',
        websiteUrl: data.website_url || '',
        logoSize: existingSettings?.logoSize || 120,
      });
    }
  };
  const [signatureUrl, setSignatureUrl] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [roundOff, setRoundOff] = useState('none');
  const [notes, setNotes] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [upiId, setUpiId] = useState('');
  const [advancePayment, setAdvancePayment] = useState(0);
  const [bankDetails, setBankDetails] = useState<BankDetailsType[]>([]);

  const [fromInfo, setFromInfo] = useState<Partial<BusinessInfoType>>({
    info_type: 'from',
    business_name: '',
    email: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    zip_code: ''
  });

  const [toInfo, setToInfo] = useState<Partial<BusinessInfoType>>({
    info_type: 'to',
    business_name: 'Client Company Name',
    email: 'client@example.com',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    address: '456 Client Avenue',
    zip_code: '560001'
  });

  const [items, setItems] = useState<QuotationItemType[]>([
    {
      item_name: 'Sample Item',
      hsn_sac: '1234',
      gst_rate: 18,
      quantity: 1,
      rate: 1000,
      discount: 0,
      additional_charges: 0,
      sort_order: 0
    }
  ]);

  const handleSignatureUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSignatureUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setQuotationLogoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const autoSaveQuotation = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    const currentQuotationNo = quotationNo;
    try {
      let qId = quotationId;

      if (!qId) {
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            quotation_no: quotationNo,
            quotation_date: quotationDate,
            due_date: dueDate || null,
            currency,
            upi_id: upiId,
            signature_url: signatureUrl,
            logo_url: quotationLogoUrl,
            notes,
            contact_details: contactDetails,
            round_off: roundOff,
            status: 'draft',
            bank_details: bankDetails,
            advance_payment: advancePayment
          })
          .select()
          .maybeSingle();

        if (quotationError) throw quotationError;
        qId = quotation?.id || null;
        setQuotationId(qId);
      } else {
        const { error: updateError } = await supabase
          .from('quotations')
          .update({
            quotation_no: quotationNo,
            quotation_date: quotationDate,
            due_date: dueDate || null,
            currency,
            upi_id: upiId,
            signature_url: signatureUrl,
            logo_url: quotationLogoUrl,
            notes,
            contact_details: contactDetails,
            round_off: roundOff,
            bank_details: bankDetails,
            advance_payment: advancePayment
          })
          .eq('id', qId);

        if (updateError) throw updateError;
      }

      if (qId) {
        await supabase.from('business_info').delete().eq('quotation_id', qId);

        await supabase.from('business_info').insert([
          { ...fromInfo, quotation_id: qId, info_type: 'from' },
          { ...toInfo, quotation_id: qId, info_type: 'to' }
        ]);

        await supabase.from('quotation_items').delete().eq('quotation_id', qId);

        const itemsToInsert = items.map((item, index) => ({
          ...item,
          quotation_id: qId,
          sort_order: index
        }));

        await supabase.from('quotation_items').insert(itemsToInsert);

        if (termsContent) {
          await supabase.from('terms_conditions').delete().eq('quotation_id', qId);
          await supabase.from('terms_conditions').insert({
            quotation_id: qId,
            content: termsContent,
            is_default: false
          });
        }
      }

      setLastSaved(new Date());

      // Save to LocalStorage for fallback viewing (when DB is not reachable)

      const tempInvoiceData = {
        quotation_no: currentQuotationNo,
        quotation_date: quotationDate,
        due_date: dueDate || null,
        currency,
        upi_id: upiId,
        signature_url: signatureUrl,
        logo_url: quotationLogoUrl,
        notes,
        contact_details: contactDetails,
        round_off: roundOff,
        bank_details: bankDetails,
        advance_payment: advancePayment,
        fromInfo,
        toInfo,
        items,
        termsContent
      };
      
      console.log('Saving to LocalStorage:', `invoice_${currentQuotationNo}`, tempInvoiceData);
      
      // We save it associated with the quotation number so the viewer can find it
      localStorage.setItem(`invoice_${currentQuotationNo}`, JSON.stringify(tempInvoiceData));
      // Also save as 'latest' for convenience
      localStorage.setItem('last_generated_invoice', JSON.stringify(tempInvoiceData));

    } catch (error) {
      console.error('Error saving quotation:', error);
      
      // Even if DB fails, save to LocalStorage so the user can still see "their" invoice
      const tempInvoiceData = {
        quotation_no: currentQuotationNo,
        quotation_date: quotationDate,
        due_date: dueDate || null,
        currency,
        upi_id: upiId,
        signature_url: signatureUrl,
        logo_url: quotationLogoUrl,
        notes,
        contact_details: contactDetails,
        round_off: roundOff,
        bank_details: bankDetails,
        advance_payment: advancePayment,
        fromInfo,
        toInfo,
        items,
        termsContent
      };
       
      console.log('Saving to LocalStorage (Fallback):', `invoice_${currentQuotationNo}`, tempInvoiceData);
      localStorage.setItem(`invoice_${currentQuotationNo}`, JSON.stringify(tempInvoiceData));
      localStorage.setItem('last_generated_invoice', JSON.stringify(tempInvoiceData));

    } finally {
      setIsSaving(false);
    }
  }, [quotationId, quotationNo, quotationDate, dueDate, currency, upiId, signatureUrl, notes, contactDetails, roundOff, bankDetails, fromInfo, toInfo, items, termsContent, isSaving]);

  const debouncedAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveQuotation();
    }, 300);
  }, [autoSaveQuotation]);

  useEffect(() => {
    if (quotationId) {
      debouncedAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [fromInfo, toInfo, items, quotationNo, quotationDate, dueDate, currency, upiId, signatureUrl, notes, contactDetails, roundOff, bankDetails, termsContent, debouncedAutoSave, quotationId]);

  const saveQuotation = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await autoSaveQuotation();
    window.location.reload();
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    return `Saved ${Math.floor(seconds / 60)}m ago`;
  };

  const downloadPDF = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const originalTitle = document.title;
    document.title = quotationNo;
    window.print();
    document.title = originalTitle;
  };

  if (showCompanySettings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Company Settings</h1>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <CompanySettings
            onSave={() => {
              loadCompanySettings();
              setShowCompanySettings(false);
            }}
            onBack={() => setShowCompanySettings(false)}
          />
        </div>
      </div>
    );
  }

  if (showTermsEditor) {
    return (
      <TermsEditor
        content={termsContent}
        onChange={setTermsContent}
        onClose={() => setShowTermsEditor(false)}
        onSave={saveQuotation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">AllManiac Invoice/Quotation Generator</h1>
              <p className="text-sm text-gray-500">
                Create professional A4 quotations with UPI payments
                {lastSaved && <span className="ml-2 text-green-600">• {formatLastSaved()}</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompanySettings(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Company Settings
            </button>
            <button
              onClick={() => setShowTermsEditor(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Edit Terms & Conditions
            </button>
            <button
              onClick={saveQuotation}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save & Reload'}
            </button>
            <button
              onClick={(e) => downloadPDF(e)}
              type="button"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 print:hidden">
            <QuotationHeader
              quotationNo={quotationNo}
              quotationDate={quotationDate}
              dueDate={dueDate}
              logoUrl={quotationLogoUrl}
              documentType={documentType}
              onQuotationDateChange={setQuotationDate}
              onDueDateChange={setDueDate}
              onLogoUpload={handleLogoUpload}
              onDocumentTypeChange={handleDocumentTypeChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BusinessInfo
                type="from"
                data={fromInfo}
                onChange={setFromInfo}
              />
              <BusinessInfo
                type="to"
                data={toInfo}
                onChange={setToInfo}
              />
            </div>

            <ItemsTable
              items={items}
              currency={currency}
              currencySymbol="₹"
              onItemsChange={setItems}
            />

            <PaymentSection
              upiId={upiId}
              bankDetails={bankDetails}
              onUpiIdChange={setUpiId}
              onBankDetailsChange={setBankDetails}
            />

            <AdditionalOptions
              items={items}
              currency={currency}
              roundOff={roundOff}
              notes={notes}
              contactDetails={contactDetails}
              signatureUrl={signatureUrl}
              advancePayment={advancePayment}
              onCurrencyChange={setCurrency}
              onRoundOffChange={setRoundOff}
              onNotesChange={setNotes}
              onContactDetailsChange={setContactDetails}
              onSignatureUpload={handleSignatureUpload}
              onAdvancePaymentChange={setAdvancePayment}
            />
          </div>

          <div className="print:col-span-2">
            <div className="sticky top-24 print:static">
              <div className="mb-4 print:hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Live Preview
                </h2>
                <p className="text-sm text-gray-500">
                  Real-time preview of your quotation
                </p>
              </div>
              <QuotationPreview
                quotationNo={quotationNo}
                quotationDate={quotationDate}
                dueDate={dueDate}
                fromInfo={fromInfo}
                toInfo={toInfo}
                items={items}
                currency={currency}
                roundOff={roundOff}
                notes={notes}
                contactDetails={contactDetails}
                signatureUrl={signatureUrl}
                termsContent={termsContent}
                upiId={upiId}
                bankDetails={bankDetails}
                companyLogoUrl={quotationLogoUrl || companyLogoUrl}
                companyName={companyName}
                websiteUrl={websiteUrl}
                documentType={documentType}
                companyPhone={companyPhone}
                companyAddress={companyAddress}
                advancePayment={advancePayment}
                onLogoSizeChange={setLogoSize}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: auto;
          margin: 0mm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 297mm !important;
            width: 210mm !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:col-span-2 {
            grid-column: span 2 / span 2;
          }

          .print\\:static {
            position: static !important;
          }

          #quotation-preview {
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 12mm !important;
            overflow: visible !important;
          }

          .page-break {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
