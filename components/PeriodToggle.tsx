type Props = {
  value: 7 | 30 | 90;
  onChange: (next: 7 | 30 | 90) => void;
};

const OPTIONS: Array<7 | 30 | 90> = [7, 30, 90];

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`min-w-12 rounded-lg px-3 py-2 text-sm font-semibold ${
              active ? "bg-white text-ink shadow-sm" : "text-slate-500"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
