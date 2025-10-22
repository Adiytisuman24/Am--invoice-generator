interface QuotationHeaderProps {
  quotationNo: string;
  quotationDate: string;
  dueDate: string;
  logoUrl: string;
  documentType: 'quotation' | 'invoice';
  onQuotationDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onLogoUpload: (file: File) => void;
  onDocumentTypeChange: (value: 'quotation' | 'invoice') => void;
}

export default function QuotationHeader({
  quotationNo,
  quotationDate,
  dueDate,
  logoUrl,
  documentType,
  onQuotationDateChange,
  onDueDateChange,
  onLogoUpload,
  onDocumentTypeChange
}: QuotationHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => onDocumentTypeChange(e.target.value as 'quotation' | 'invoice')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="quotation">Quotation</option>
            <option value="invoice">Invoice</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Logo
          </label>
          {logoUrl && (
            <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 inline-block">
              <img
                src={logoUrl}
                alt="Document Logo"
                className="object-contain"
                style={{ maxWidth: '120px', maxHeight: '120px' }}
              />
            </div>
          )}
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Logo
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLogoUpload(file);
              }}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Logo will auto-fit to 120x120px in the document header
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {documentType === 'invoice' ? 'Invoice' : 'Quotation'} Number (System Generated)
          </label>
          <input
            type="text"
            value={quotationNo}
            readOnly
            disabled
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            This number is automatically generated and immutable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {documentType === 'invoice' ? 'Invoice' : 'Quotation'} Date
            </label>
            <input
              type="date"
              value={quotationDate}
              onChange={(e) => onQuotationDateChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
