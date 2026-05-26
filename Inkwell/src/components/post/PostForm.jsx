import { zodResolver } from '@hookform/resolvers/zod';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading1, Heading2, Italic, List, ListOrdered, LoaderCircle, Plus, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import CategorySelect from '../common/CategorySelect.jsx';
import TagMultiSelect from '../common/TagMultiSelect.jsx';
import MediaUploader from '../media/MediaUploader.jsx';

const formSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  categoryId: z.union([z.number(), z.nan()]).optional().transform((value) => (Number.isNaN(value) ? undefined : value)),
  tagIds: z.array(z.number()).default([]),
  tagNames: z.array(z.string().trim().min(2, 'Tag must be at least 2 characters').max(100, 'Tag must be 100 characters or less')).default([]),
  featuredImageUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).default([])
}).superRefine((value, ctx) => {
  if (value.categoryId == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['categoryId'],
      message: 'Category is required'
    });
  }

  const plainText = value.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'Content is required'
    });
  }
});

function EditorToolbar({ editor, disabled = false }) {
  const buttons = [
    { icon: Bold, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: Heading1, label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: List, label: 'Bullet', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, label: 'Numbered', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') }
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
      {buttons.map(({ icon: Icon, label, action, active }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          disabled={disabled}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function ManualTagInput({ value = [], onChange, existingTags = [], disabled = false }) {
  const [draft, setDraft] = useState('');
  const normalizedValue = Array.isArray(value) ? value : [];
  const existingNames = useMemo(
    () => new Set(existingTags.map((tag) => tag?.name?.trim().toLowerCase()).filter(Boolean)),
    [existingTags]
  );

  const addTag = () => {
    const name = draft.trim().replace(/\s+/g, ' ');
    if (!name || disabled) return;

    const lowerName = name.toLowerCase();
    const hasManualTag = normalizedValue.some((tagName) => tagName.trim().toLowerCase() === lowerName);
    if (hasManualTag || existingNames.has(lowerName)) {
      setDraft('');
      return;
    }

    onChange?.([...normalizedValue, name]);
    setDraft('');
  };

  const removeTag = (name) => {
    if (disabled) return;
    onChange?.(normalizedValue.filter((tagName) => tagName !== name));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add your own tags</label>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Type a tag name"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
          disabled={disabled}
        />
        <button
          className="btn-muted inline-flex shrink-0 items-center gap-2"
          type="button"
          onClick={addTag}
          disabled={disabled || !draft.trim()}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {normalizedValue.length ? (
        <div className="flex flex-wrap gap-2">
          {normalizedValue.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => removeTag(name)}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
              disabled={disabled}
            >
              {name}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PostForm({
  mode = 'create',
  initialValues,
  categories = [],
  tags = [],
  currentUser,
  submitting = false,
  onSubmit
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      content: initialValues?.content ?? '<p></p>',
      categoryId: initialValues?.categoryId ?? undefined,
      tagIds: initialValues?.tagIds ?? [],
      tagNames: initialValues?.tagNames ?? [],
      featuredImageUrl: initialValues?.featuredImageUrl ?? '',
      mediaUrls: initialValues?.mediaUrls ?? []
    }
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = form;
  const mediaUrls = watch('mediaUrls');
  const featuredImageUrl = watch('featuredImageUrl');
  const categoryId = watch('categoryId');

  useEffect(() => {
    reset({
      title: initialValues?.title ?? '',
      content: initialValues?.content ?? '<p></p>',
      categoryId: initialValues?.categoryId ?? undefined,
      tagIds: initialValues?.tagIds ?? [],
      tagNames: initialValues?.tagNames ?? [],
      featuredImageUrl: initialValues?.featuredImageUrl ?? '',
      mediaUrls: initialValues?.mediaUrls ?? []
    });
  }, [initialValues, reset]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialValues?.content ?? '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: nextEditor }) => {
      setValue('content', nextEditor.getHTML(), { shouldDirty: true, shouldValidate: true });
    }
  });

  useEffect(() => {
    if (editor && initialValues?.content != null && editor.getHTML() !== initialValues.content) {
      editor.commands.setContent(initialValues.content || '<p></p>', false);
    }
  }, [editor, initialValues]);

  const submitLabel = mode === 'edit' ? 'Update post' : 'Publish post';
  const busy = submitting || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                InkWell Editor
              </p>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                {mode === 'edit' ? 'Refine your story' : 'Create a new post'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Add your title, rich content, taxonomy, and media in one place. Existing auth and protected API behavior stays unchanged.
              </p>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary inline-flex items-center gap-2 self-start disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {submitLabel}
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <div className="space-y-6">
            <div className="card space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Post title</label>
              <input
                className={`input text-xl font-bold ${errors.title ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                placeholder="My First Blog"
                {...form.register('title')}
                disabled={busy}
              />
              {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              {editor ? <EditorToolbar editor={editor} disabled={busy} /> : null}
              <div className="min-h-[360px] bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.07),_transparent_35%),linear-gradient(to_bottom,_rgba(248,250,252,0.9),_rgba(255,255,255,1))] dark:bg-slate-950">
                <EditorContent editor={editor} className="prose-content min-h-[360px] max-w-none px-6 py-5 [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:outline-none" />
              </div>
              {errors.content ? <p className="px-6 pb-5 text-sm text-rose-600">{errors.content.message}</p> : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <CategorySelect
                categories={categories}
                value={categoryId ?? ''}
                onChange={(value) => setValue('categoryId', value ? Number(value) : undefined, { shouldDirty: true, shouldValidate: true })}
                disabled={busy}
                error={errors.categoryId?.message}
                required
              />

              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <TagMultiSelect
                    tags={tags}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    disabled={busy}
                  />
                )}
              />

              <Controller
                control={control}
                name="tagNames"
                render={({ field }) => (
                  <ManualTagInput
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    existingTags={tags}
                    disabled={busy}
                  />
                )}
              />
              {errors.tagNames ? <p className="text-sm text-rose-600">{errors.tagNames.message}</p> : null}
            </div>

            <Controller
              control={control}
              name="mediaUrls"
              render={({ field }) => (
                <MediaUploader
                  userId={currentUser?.userId}
                  value={field.value}
                  featuredImageUrl={featuredImageUrl}
                  onChange={(value) => {
                    field.onChange(value);
                    if (featuredImageUrl && !value.includes(featuredImageUrl)) {
                      setValue('featuredImageUrl', '', { shouldDirty: true });
                    }
                  }}
                  onFeaturedChange={(value) => setValue('featuredImageUrl', value, { shouldDirty: true })}
                  disabled={busy}
                />
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
