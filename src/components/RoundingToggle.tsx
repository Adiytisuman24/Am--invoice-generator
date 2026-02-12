interface RoundingToggleProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoundingToggle({ value, onChange }: RoundingToggleProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          Round Off Total
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange('none')}
            className={`px-4 py-2 rounded-md transition-colors ${
              value === 'none'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No Rounding
          </button>
          <button
            onClick={() => onChange('up')}
            className={`px-4 py-2 rounded-md transition-colors ${
              value === 'up'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Round Up
          </button>
          <button
            onClick={() => onChange('down')}
            className={`px-4 py-2 rounded-md transition-colors ${
              value === 'down'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Round Down
          </button>
        </div>
      </div>
    </div>
  );
}
