import { Plus, Trash2, Copy } from 'lucide-react';
import { QuotationItemType } from '../lib/supabase';
import { calculateItemAmount, calculateItemGST, formatCurrency } from '../utils/calculations';

interface ItemsTableProps {
  items: QuotationItemType[];
  currency: string;
  currencySymbol: string;
  onItemsChange: (items: QuotationItemType[]) => void;
}

export default function ItemsTable({ items, currency, currencySymbol, onItemsChange }: ItemsTableProps) {
  const addItem = () => {
    const newItem: QuotationItemType = {
      item_name: '',
      description: '',
      hsn_sac: '',
      gst_rate: 18,
      quantity: 1,
      rate: 0,
      discount: 0,
      additional_charges: 0,
      sort_order: items.length
    };
    onItemsChange([...items, newItem]);
  };


  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = { ...items[index], sort_order: items.length };
    onItemsChange([...items, itemToDuplicate]);
  };

  const updateItem = (index: number, field: keyof QuotationItemType, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onItemsChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Items</h2>
        <button
          onClick={addItem}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-48">
                Item Name
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                HSN/SAC
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase w-16">
                GST%
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase w-16">
                Qty
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-28">
                Rate
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-24">
                Disc.
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-24">
                Add.Ch.
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-32">
                Amount
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-28">
                CGST
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-28">
                SGST
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase w-32">
                Total
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => {
              const amount = calculateItemAmount(item);
              const gst = calculateItemGST(item);

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Item name"
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        placeholder="Description"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={item.hsn_sac || ''}
                      onChange={(e) => updateItem(index, 'hsn_sac', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      placeholder="HSN"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.gst_rate}
                      onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      step="1"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.additional_charges}
                      onChange={(e) => updateItem(index, 'additional_charges', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 text-right">
                    {formatCurrency(amount, currency, currencySymbol)}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 text-right">
                    {formatCurrency(gst.cgst, currency, currencySymbol)}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 text-right">
                    {formatCurrency(gst.sgst, currency, currencySymbol)}
                  </td>
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900 text-right">
                    {formatCurrency(gst.totalWithGst, currency, currencySymbol)}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => duplicateItem(index)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No items added yet. Click "Add Item" to get started.</p>
        </div>
      )}
    </div>
  );
}
