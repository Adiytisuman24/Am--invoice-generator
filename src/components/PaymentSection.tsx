import { Plus, Trash2, Smartphone } from 'lucide-react';
import { BankDetailsType } from '../lib/supabase';

interface PaymentSectionProps {
  upiId: string;
  bankDetails: BankDetailsType[];
  onUpiIdChange: (value: string) => void;
  onBankDetailsChange: (value: BankDetailsType[]) => void;
}

export default function PaymentSection({
  upiId,
  bankDetails,
  onUpiIdChange,
  onBankDetailsChange,
}: PaymentSectionProps) {
  const addBankAccount = () => {
    onBankDetailsChange([
      ...bankDetails,
      {
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        branch: '',
        account_type: ''
      }
    ]);
  };

  const removeBankAccount = (index: number) => {
    onBankDetailsChange(bankDetails.filter((_, i) => i !== index));
  };

  const updateBankDetail = (index: number, field: keyof BankDetailsType, value: string) => {
    const newBankDetails = [...bankDetails];
    newBankDetails[index] = { ...newBankDetails[index], [field]: value };
    onBankDetailsChange(newBankDetails);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Smartphone className="inline-block w-4 h-4 mr-1" />
            UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => onUpiIdChange(e.target.value)}
            placeholder="e.g., merchant@paytm or 9876543210@ybl"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your UPI ID to generate a scan-to-pay QR code automatically
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Bank Account Details (Optional Fallback)</h3>
            <button
              onClick={addBankAccount}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Account
            </button>
          </div>

          {bankDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">No bank accounts added yet.</p>
              <p className="text-xs mt-1">Add bank details as a fallback payment option.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bankDetails.map((bank, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Account {index + 1}
                    </h4>
                    <button
                      onClick={() => removeBankAccount(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={bank.bank_name}
                        onChange={(e) => updateBankDetail(index, 'bank_name', e.target.value)}
                        placeholder="e.g., State Bank of India"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={bank.account_number}
                        onChange={(e) => updateBankDetail(index, 'account_number', e.target.value)}
                        placeholder="Enter account number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        value={bank.ifsc_code}
                        onChange={(e) => updateBankDetail(index, 'ifsc_code', e.target.value.toUpperCase())}
                        placeholder="e.g., SBIN0001234"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={bank.branch || ''}
                        onChange={(e) => updateBankDetail(index, 'branch', e.target.value)}
                        placeholder="e.g., Main Branch"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <select
                        value={bank.account_type || ''}
                        onChange={(e) => updateBankDetail(index, 'account_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Salary">Salary</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
