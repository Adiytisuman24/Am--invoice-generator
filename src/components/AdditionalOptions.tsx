import { Upload } from 'lucide-react';
import { currencies } from '../data/locations';
import { calculateQuotationTotals, numberToWords, formatCurrency } from '../utils/calculations';
import { QuotationItemType } from '../lib/supabase';

interface AdditionalOptionsProps {
  items: QuotationItemType[];
  currency: string;
  roundOff: string;
  notes: string;
  contactDetails: string;
  signatureUrl?: string;
  advancePayment: number;
  onCurrencyChange: (currency: string) => void;
  onRoundOffChange: (roundOff: string) => void;
  onNotesChange: (notes: string) => void;
  onContactDetailsChange: (contactDetails: string) => void;
  onSignatureUpload: (file: File) => void;
  onAdvancePaymentChange: (amount: number) => void;
}

export default function AdditionalOptions({
  items,
  currency,
  roundOff,
  notes,
  contactDetails,
  signatureUrl,
  advancePayment,
  onCurrencyChange,
  onRoundOffChange,
  onNotesChange,
  onContactDetailsChange,
  onSignatureUpload,
  onAdvancePaymentChange
}: AdditionalOptionsProps) {
  const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
  const totals = calculateQuotationTotals(items, roundOff);
  const totalInWords = numberToWords(Math.floor(totals.grandTotal));

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSignatureUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Round Off
          </label>
          <select
            value={roundOff}
            onChange={(e) => onRoundOffChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">No Rounding</option>
            <option value="up">Round Up</option>
            <option value="down">Round Down</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal, currency, currencyInfo.symbol)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">CGST:</span>
            <span className="font-medium">{formatCurrency(totals.totalCGST, currency, currencyInfo.symbol)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SGST:</span>
            <span className="font-medium">{formatCurrency(totals.totalSGST, currency, currencyInfo.symbol)}</span>
          </div>
          {totals.roundOffAmount !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Round Off:</span>
              <span className="font-medium">
                {totals.roundOffAmount > 0 ? '+' : ''}
                {formatCurrency(totals.roundOffAmount, currency, currencyInfo.symbol)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
            <span>Grand Total:</span>
            <span>{formatCurrency(totals.grandTotal, currency, currencyInfo.symbol)}</span>
          </div>
          
          <div className="pt-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Paid / Part Payment
             </label>
             <input
                type="number"
                min="0"
                value={advancePayment || ''}
                onChange={(e) => onAdvancePaymentChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
             />
          </div>

          {(advancePayment > 0) && (
            <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="flex justify-between text-sm text-green-600">
                    <span>Advance Paid:</span>
                    <span>{formatCurrency(advancePayment, currency, currencyInfo.symbol)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-700 mt-1">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(Math.max(0, totals.grandTotal - advancePayment), currency, currencyInfo.symbol)}</span>
                </div>
            </div>
          )}

          <div className="text-sm text-gray-600 italic mt-2">
            <span className="font-medium">Amount in Words: </span>
            {totalInWords} {currencyInfo.name} Only
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Add any additional notes or instructions..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Contact Details
        </label>
        <textarea
          value={contactDetails}
          onChange={(e) => onContactDetailsChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Phone, website, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Signature
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
          {signatureUrl ? (
            <div className="relative">
              <img
                src={signatureUrl}
                alt="Signature"
                className="max-h-24 mx-auto object-contain"
              />
              <label className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Change Signature
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Upload signature</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
