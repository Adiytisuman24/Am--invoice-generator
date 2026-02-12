interface DiscountChargesProps {
  discountType: string;
  discountValue: number;
  additionalCharges: number;
  additionalChargesLabel: string;
  onDiscountTypeChange: (value: string) => void;
  onDiscountValueChange: (value: number) => void;
  onAdditionalChargesChange: (value: number) => void;
  onAdditionalChargesLabelChange: (value: string) => void;
}

export default function DiscountCharges({
  discountType,
  discountValue,
  additionalCharges,
  additionalChargesLabel,
  onDiscountTypeChange,
  onDiscountValueChange,
  onAdditionalChargesChange,
  onAdditionalChargesLabelChange,
}: DiscountChargesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Adjustments</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Discount
          </label>
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Discount</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            {discountType !== 'none' && (
              <input
                type="number"
                value={discountValue}
                onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                step="0.01"
                min="0"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Additional Charges
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={additionalChargesLabel}
              onChange={(e) => onAdditionalChargesLabelChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Shipping, Handling"
            />
            <input
              type="number"
              value={additionalCharges}
              onChange={(e) => onAdditionalChargesChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
