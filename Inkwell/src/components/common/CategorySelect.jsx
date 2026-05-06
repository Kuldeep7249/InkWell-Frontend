import { FolderOpen } from 'lucide-react';

function getCategoryId(category) {
  return category?.id ?? category?.categoryId ?? null;
}

export default function CategorySelect({
  categories = [],
  value = '',
  onChange,
  disabled = false,
  error,
  required = false
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <FolderOpen className="h-4 w-4" />
        Category
      </label>
      <select
        className={`input ${error ? 'border-rose-400 focus:ring-rose-400' : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value ? Number(event.target.value) : '')}
        disabled={disabled}
      >
        <option value="">{required ? 'Select a category' : 'No category selected'}</option>
        {categories.map((category) => {
          const id = getCategoryId(category);
          return (
            <option key={id} value={id}>
              {category?.name ?? `Category ${id}`}
            </option>
          );
        })}
      </select>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
