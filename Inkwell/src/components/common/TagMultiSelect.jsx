import { Search, Tags, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function getTagId(tag) {
  return tag?.id ?? tag?.tagId ?? null;
}

export default function TagMultiSelect({ tags = [], value = [], onChange, disabled = false }) {
  const [query, setQuery] = useState('');
  const normalizedValue = Array.isArray(value) ? value : [];

  const selectedTags = useMemo(
    () => tags.filter((tag) => normalizedValue.includes(getTagId(tag))),
    [tags, normalizedValue]
  );

  const filteredTags = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return tags.filter((tag) => {
      const id = getTagId(tag);
      if (normalizedValue.includes(id)) return false;
      if (!lowerQuery) return true;
      return (tag?.name ?? '').toLowerCase().includes(lowerQuery);
    });
  }, [query, tags, normalizedValue]);

  const addTag = (id) => {
    if (disabled || normalizedValue.includes(id)) return;
    onChange?.([...normalizedValue, id]);
    setQuery('');
  };

  const removeTag = (id) => {
    if (disabled) return;
    onChange?.(normalizedValue.filter((tagId) => tagId !== id));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Tags className="h-4 w-4" />
        Tags
      </label>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled}
          />
        </div>

        {selectedTags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const id = getTagId(tag);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeTag(id)}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200"
                  disabled={disabled}
                >
                  {tag?.name ?? `Tag ${id}`}
                  <X className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No tags selected yet.</p>
        )}

        <div className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
          {filteredTags.length ? (
            filteredTags.map((tag) => {
              const id = getTagId(tag);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => addTag(id)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  disabled={disabled}
                >
                  <span>{tag?.name ?? `Tag ${id}`}</span>
                  <span className="text-xs text-slate-400">Add</span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No matching tags found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
