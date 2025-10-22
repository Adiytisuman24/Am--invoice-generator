import { BusinessInfoType, QuotationItemType, BankDetailsType } from '../lib/supabase';
import { calculateItemGST, calculateQuotationTotals, numberToWords, formatCurrency } from '../utils/calculations';
import { currencies } from '../data/locations';
import PaymentCard from './PaymentCard';
import { useState, useRef, useEffect } from 'react';
import { saveSettingsToCookie, loadSettingsFromCookie } from '../utils/cookieStorage';

interface QuotationPreviewProps {
  quotationNo: string;
  quotationDate: string;
  dueDate: string;
  fromInfo: Partial<BusinessInfoType>;
  toInfo: Partial<BusinessInfoType>;
  items: QuotationItemType[];
  currency: string;
  roundOff: string;
  notes: string;
  contactDetails: string;
  signatureUrl?: string;
  termsContent?: string;
  upiId?: string;
  bankDetails?: BankDetailsType[];
  companyLogoUrl?: string;
  companyName?: string;
  websiteUrl?: string;
  documentType?: 'quotation' | 'invoice';
  companyPhone?: string;
  companyAddress?: string;
  onLogoSizeChange?: (size: number) => void;
}

export default function QuotationPreview({
  quotationNo,
  quotationDate,
  dueDate,
  fromInfo,
  toInfo,
  items,
  currency,
  roundOff,
  notes,
  contactDetails,
  signatureUrl,
  termsContent,
  upiId,
  bankDetails = [],
  companyLogoUrl,
  companyName,
  websiteUrl,
  documentType = 'quotation',
  companyPhone,
  companyAddress,
  onLogoSizeChange
}: QuotationPreviewProps) {
  const [logoSize, setLogoSize] = useState(() => {
    const settings = loadSettingsFromCookie();
    return settings?.logoSize || 120;
  });
  const [isResizing, setIsResizing] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, size: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      size: logoSize
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      const delta = Math.max(deltaX, deltaY);
      const newSize = Math.max(60, Math.min(200, startPos.current.size + delta));
      setLogoSize(newSize);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        const settings = loadSettingsFromCookie();
        if (settings) {
          saveSettingsToCookie({ ...settings, logoSize });
        }
        if (onLogoSizeChange) {
          onLogoSizeChange(logoSize);
        }
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, logoSize, onLogoSizeChange]);
  const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
  const totals = calculateQuotationTotals(items, roundOff);
  const totalInWords = numberToWords(Math.floor(totals.grandTotal));

  const formatAddress = (info: Partial<BusinessInfoType>) => {
    const parts = [];
    if (info.address) parts.push(info.address);
    const cityStateParts = [];
    if (info.city) cityStateParts.push(info.city);
    if (info.state) cityStateParts.push(info.state);
    if (cityStateParts.length > 0) parts.push(cityStateParts.join(', '));
    if (info.zip_code) parts.push(info.zip_code);
    if (info.country) parts.push(info.country);
    return parts.join(', ');
  };

  return (
    <div
      className="bg-white print:shadow-none border border-gray-200 print:border-0"
      id="quotation-preview"
      style={{
        width: '100%',
        maxWidth: '210mm',
        aspectRatio: '210/297',
        margin: '0 auto',
        padding: '5%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transform: 'scale(0.95)',
        transformOrigin: 'top center'
      }}
    >
      <div
        className="flex flex-col h-full"
        style={{ maxHeight: 'calc(297mm - 40mm)' }}
      >
        <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-300">
          {companyLogoUrl ? (
            <div
              ref={logoRef}
              className="flex-shrink-0 flex items-center justify-center relative group cursor-nwse-resize"
              style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
              onMouseDown={handleMouseDown}
            >
              <img
                src={companyLogoUrl}
                alt="Company Logo"
                className="object-contain w-full h-full pointer-events-none"
                style={{ maxWidth: `${logoSize}px`, maxHeight: `${logoSize}px` }}
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-tl" />
            </div>
          ) : (
            <div style={{ width: '120px' }} />
          )}

          <div className="flex-1 px-4 flex flex-col justify-center">
          </div>

          <div className="text-right space-y-1 flex-shrink-0" style={{ minWidth: '150px' }}>
            <div className="font-bold uppercase" style={{ fontSize: '18pt', fontFamily: 'Space Grotesk, sans-serif' }}>
              {documentType === 'invoice' ? 'INVOICE' : 'QUOTATION'}
            </div>
            <div className="font-semibold" style={{ fontSize: '14pt' }}>
              {quotationNo}
            </div>
            <div style={{ fontSize: '10pt' }}>
              <div>Date: {quotationDate || 'N/A'}</div>
              {dueDate && <div>Due: {dueDate}</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className="p-3 rounded border border-gray-200"
            style={{ fontSize: '10pt', minHeight: '100px' }}
          >
            <p className="font-semibold mb-2 text-gray-600 uppercase" style={{ fontSize: '11pt' }}>
              From
            </p>
            <p className="font-semibold">{fromInfo.business_name || 'N/A'}</p>
            {fromInfo.gstin && (
              <p className="truncate" title={`GSTIN: ${fromInfo.gstin}`}>
                GSTIN: {fromInfo.gstin}
              </p>
            )}
            {fromInfo.pan && <p>PAN: {fromInfo.pan}</p>}
            <p className="break-words" style={{ lineHeight: '1.4' }}>
              {formatAddress(fromInfo)}
            </p>
            {fromInfo.email && <p className="truncate">{fromInfo.email}</p>}
            {fromInfo.phone && <p className="truncate">Phone: {fromInfo.phone}</p>}
          </div>

          <div
            className="p-3 rounded border border-gray-200"
            style={{ fontSize: '10pt', minHeight: '100px' }}
          >
            <p className="font-semibold mb-2 text-gray-600 uppercase" style={{ fontSize: '11pt' }}>
              To
            </p>
            <p className="font-semibold">{toInfo.business_name || 'N/A'}</p>
            {toInfo.gstin && (
              <p className="truncate" title={`GSTIN: ${toInfo.gstin}`}>
                GSTIN: {toInfo.gstin}
              </p>
            )}
            {toInfo.pan && <p>PAN: {toInfo.pan}</p>}
            <p className="break-words" style={{ lineHeight: '1.4' }}>
              {formatAddress(toInfo)}
            </p>
            {toInfo.email && <p className="truncate">{toInfo.email}</p>}
            {toInfo.phone && <p className="truncate">Phone: {toInfo.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <table className="w-full table-fixed" style={{ fontSize: '10.5pt', borderCollapse: 'collapse' }}>
                <colgroup>
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '24%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#F3F4F6' }}>
                    <th className="px-2 py-2 text-left font-semibold border-b border-gray-300">Item</th>
                    <th className="px-2 py-2 text-left font-semibold border-b border-gray-300" style={{ fontSize: '9pt' }}>
                      PID
                    </th>
                    <th className="px-2 py-2 text-center font-semibold border-b border-gray-300" style={{ fontSize: '9pt' }}>Qty</th>
                    <th className="px-2 py-2 text-right font-semibold border-b border-gray-300" style={{ fontSize: '9pt' }}>Rate</th>
                    <th className="px-2 py-2 text-center font-semibold border-b border-gray-300" style={{ fontSize: '9pt' }}>
                      GST%
                    </th>
                    <th className="px-2 py-2 text-right font-semibold border-b border-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const gst = calculateItemGST(item);
                    return (
                      <tr
                        key={index}
                        style={{
                          background: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          borderBottom: '1px solid #E5E7EB'
                        }}
                      >
                        <td className="px-2 py-2">
                          <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                            <p className="font-semibold break-words" style={{ fontSize: '9.5pt', lineHeight: '1.3' }}>{item.item_name}</p>
                            {item.description && (
                              <p className="text-gray-600 italic break-words" style={{ fontSize: '7pt', lineHeight: '1.3', marginTop: '2px' }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-700 text-center" style={{ fontSize: '9pt' }}>
                          {item.hsn_sac || '-'}
                        </td>
                        <td className="px-2 py-2 text-center font-medium" style={{ fontSize: '9pt' }}>{item.quantity}</td>
                        <td className="px-2 py-2 text-right font-medium" style={{ fontSize: '9pt' }}>
                          {formatCurrency(item.rate, currency, currencyInfo.symbol)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-1 rounded font-medium bg-blue-100 text-blue-700" style={{ fontSize: '8pt' }}>
                            {item.gst_rate}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right font-semibold" style={{ fontSize: '10pt' }}>
                          {formatCurrency(gst.totalWithGst, currency, currencyInfo.symbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            <div className="mt-4 pt-3 border-t border-gray-300">
              <div className="space-y-1.5" style={{ fontSize: '10pt' }}>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal, currency, currencyInfo.symbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST:</span>
                  <span className="font-medium">{formatCurrency(totals.totalCGST, currency, currencyInfo.symbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST:</span>
                  <span className="font-medium">{formatCurrency(totals.totalSGST, currency, currencyInfo.symbol)}</span>
                </div>
                {totals.roundOffAmount !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round Off:</span>
                    <span className="font-medium">
                      {totals.roundOffAmount > 0 ? '+' : ''}
                      {formatCurrency(totals.roundOffAmount, currency, currencyInfo.symbol)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t-2 border-gray-900 flex justify-between items-center">
                <span className="font-bold" style={{ fontSize: '16pt' }}>
                  TOTAL AMOUNT
                </span>
                <span className="font-bold break-all text-right" style={{ fontSize: '24pt', lineHeight: '1.1', maxWidth: '60%' }}>
                  {formatCurrency(totals.grandTotal, currency, currencyInfo.symbol)}
                </span>
              </div>

              <p className="mt-2 italic text-gray-600" style={{ fontSize: '8.5pt', lineHeight: '1.3' }}>
                {totalInWords} {currencyInfo.name} Only
              </p>
            </div>
          </div>

          <div className="col-span-4">
            <PaymentCard
              amount={totals.grandTotal}
              upiId={upiId}
              businessName={fromInfo.business_name || 'Business'}
              quotationNo={quotationNo}
              bankDetails={bankDetails}
              currency={currency}
              currencySymbol={currencyInfo.symbol}
            />
          </div>
        </div>

        {notes && (
          <div className="mt-4 pt-2 border-t border-gray-200">
            <p className="font-semibold mb-1" style={{ fontSize: '10pt' }}>
              Notes
            </p>
            <p className="text-gray-700" style={{ fontSize: '9pt', lineHeight: '1.4' }}>
              {notes}
            </p>
          </div>
        )}

        {signatureUrl && (
          <div className="mt-4 pt-2 border-t border-gray-200 flex justify-end">
            <div className="text-right">
              <img
                src={signatureUrl}
                alt="Signature"
                className="object-contain mb-1"
                style={{ maxHeight: '40px', maxWidth: '150px' }}
              />
              <div style={{ width: '150px', height: '1px', background: '#9CA3AF' }} />
              {fromInfo.city && (
                <p className="mt-1 text-gray-600" style={{ fontSize: '8pt' }}>
                  Place: {fromInfo.city}, Date: {quotationDate}
                </p>
              )}
            </div>
          </div>
        )}

        {termsContent && (
          <div className="mt-4 pt-2 border-t border-gray-200">
            <p className="font-semibold mb-1" style={{ fontSize: '9pt' }}>
              T&C
            </p>
            <p className="text-gray-700" style={{ fontSize: '7.5pt', lineHeight: '1.3' }}>
              {termsContent.split('\n').slice(0, 3).join(' ')}
            </p>
          </div>
        )}

        <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between items-center">
          <p className="italic text-gray-500" style={{ fontSize: '8pt' }}>
            Powered by Grapepaylabs
          </p>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              style={{ fontSize: '8pt' }}
            >
              Visit: {websiteUrl}
            </a>
          )}
        </div>
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          #quotation-preview {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 20mm !important;
            margin: 0 !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }

          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
