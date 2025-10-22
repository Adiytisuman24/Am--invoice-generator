import { ArrowLeft, Save } from 'lucide-react';

interface TermsEditorProps {
  content: string;
  onChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function TermsEditor({ content, onChange, onClose, onSave }: TermsEditorProps) {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotation
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit Terms & Conditions</h1>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions Content
            </label>
            <p className="text-sm text-gray-500 mb-4">
              These terms will be included at the end of your quotation PDF.
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSave();
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={20}
            placeholder="Enter your terms and conditions here...

Example:
1. Payment Terms
   - Payment is due within 30 days of the invoice date
   - Late payments may incur additional charges

2. Validity
   - This quotation is valid for 30 days from the date of issue

3. Delivery
   - Delivery times are estimates and may vary

4. Cancellation Policy
   - Orders cannot be cancelled once confirmed"
          />

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Preview</h3>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {content || 'No terms and conditions added yet.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
