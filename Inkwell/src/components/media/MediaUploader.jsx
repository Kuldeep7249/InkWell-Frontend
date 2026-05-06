import { ImagePlus, LoaderCircle, Star, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getMediaId, mediaApi, resolveMediaUrl } from '../../api/mediaApi.js';
import { unwrap } from '../../utils/helpers.js';

function getMediaType(media) {
  const contentType = (media?.contentType ?? media?.mimeType ?? '').toLowerCase();
  if (contentType.startsWith('image/')) return 'image';

  const source = media?.originalName ?? media?.filename ?? media?.name ?? media?.url ?? '';
  const ext = source.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext) ? 'image' : 'file';
}

function normalizeUploadedMedia(item) {
  const url = resolveMediaUrl(item);
  return {
    id: getMediaId(item),
    url,
    name: item?.originalName ?? item?.filename ?? item?.name ?? 'Uploaded media',
    altText: item?.altText ?? '',
    contentType: item?.contentType ?? item?.mimeType ?? '',
    raw: item
  };
}

function MediaTile({ item, selected, featured, onToggle, onFeature, onRemove }) {
  const isImage = getMediaType(item) === 'image';

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
        {isImage && item.url ? (
          <img src={item.url} alt={item.altText || item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">File</div>
        )}
        {featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-xs font-semibold text-amber-950">
            <Star className="h-3.5 w-3.5 fill-current" />
            Featured
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{item.url}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'}`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
          <button
            type="button"
            onClick={() => onFeature(item)}
            className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            Set featured
          </button>
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MediaUploader({
  userId,
  value = [],
  featuredImageUrl = '',
  onChange,
  onFeaturedChange,
  disabled = false
}) {
  const [items, setItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMedia() {
      try {
        setIsLoading(true);
        const response = userId ? await mediaApi.listByUploader(userId) : await mediaApi.listMineOrAll();
        const list = unwrap(response);
        if (!active) return;
        setItems(Array.isArray(list) ? list.map(normalizeUploadedMedia) : []);
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadMedia();
    return () => {
      active = false;
    };
  }, [userId]);

  const selectedUrls = Array.isArray(value) ? value : [];
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : ''), [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleSelection = (item) => {
    const url = item?.url;
    if (!url) return;
    const next = selectedUrls.includes(url)
      ? selectedUrls.filter((existingUrl) => existingUrl !== url)
      : [...selectedUrls, url];

    onChange?.(next);

    if (!next.includes(featuredImageUrl) && featuredImageUrl === url) {
      onFeaturedChange?.('');
    }
  };

  const setFeaturedImage = (item) => {
    const url = item?.url;
    if (!url) return;
    if (!selectedUrls.includes(url)) onChange?.([...selectedUrls, url]);
    onFeaturedChange?.(url);
  };

  const removeMedia = (item) => {
    const url = item?.url;
    onChange?.(selectedUrls.filter((existingUrl) => existingUrl !== url));
    if (featuredImageUrl === url) onFeaturedChange?.('');
  };

  const uploadMedia = async () => {
    if (!selectedFile) {
      toast.error('Choose a file before uploading');
      return;
    }

    try {
      setIsUploading(true);
      const response = await mediaApi.uploadMedia(selectedFile, { altText });
      const uploaded = normalizeUploadedMedia(unwrap(response));
      setItems((currentItems) => [uploaded, ...currentItems]);
      onChange?.(selectedUrls.includes(uploaded.url) ? selectedUrls : [uploaded.url, ...selectedUrls]);
      if (!featuredImageUrl) onFeaturedChange?.(uploaded.url);
      setSelectedFile(null);
      setAltText('');
      toast.success('Media uploaded');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Media library</p>
            <p className="text-sm text-slate-500">Upload files, choose which ones belong to this post, and mark one as featured.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <ImagePlus className="h-3.5 w-3.5" />
            {selectedUrls.length} selected
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
          <input
            type="file"
            className="input"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            disabled={disabled || isUploading}
          />
          <input
            type="text"
            className="input"
            placeholder="Alt text (optional)"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            disabled={disabled || isUploading}
          />
          <button
            type="button"
            onClick={uploadMedia}
            disabled={disabled || isUploading}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Upload
          </button>
        </div>

        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            {selectedFile?.type?.startsWith('image/') ? (
              <img src={previewUrl} alt={selectedFile.name} className="h-44 w-full rounded-2xl object-cover" />
            ) : (
              <div className="grid h-44 place-items-center rounded-2xl bg-white text-sm text-slate-500 dark:bg-slate-900">
                {selectedFile.name}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {featuredImageUrl ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/20">
          <p className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-200">Featured image preview</p>
          <img src={featuredImageUrl} alt="Featured preview" className="h-56 w-full rounded-2xl object-cover" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="card md:col-span-2 xl:col-span-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading media...
            </div>
          </div>
        ) : items.length ? (
          items.map((item) => (
            <MediaTile
              key={item.id ?? item.url}
              item={item}
              selected={selectedUrls.includes(item.url)}
              featured={featuredImageUrl === item.url}
              onToggle={toggleSelection}
              onFeature={setFeaturedImage}
              onRemove={removeMedia}
            />
          ))
        ) : (
          <div className="card md:col-span-2 xl:col-span-3 text-sm text-slate-500">
            No uploaded media found yet. Upload a file to get started.
          </div>
        )}
      </div>
    </div>
  );
}
