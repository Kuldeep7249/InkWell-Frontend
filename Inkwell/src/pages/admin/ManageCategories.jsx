import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx';
import { categoryApi } from '../../api/categoryApi.js';
import { useApi } from '../../hooks/useApi.js';
import { unwrap } from '../../utils/helpers.js';
import { adminItems } from './AdminDashboard.jsx';

function categoryIdOf(category) {
  return category?.id ?? category?.categoryId;
}

function tagIdOf(tag) {
  return tag?.id ?? tag?.tagId;
}

export default function ManageCategories() {
  const cats = useApi(() => categoryApi.categories(), []);
  const tags = useApi(() => categoryApi.tags(), []);
  const [category, setCategory] = useState({ name: '', description: '' });
  const [tag, setTag] = useState({ name: '' });

  const addCat = async (event) => {
    event.preventDefault();
    const response = await categoryApi.createCategory(category);
    cats.setData([...(cats.data || []), unwrap(response) || response?.data]);
    setCategory({ name: '', description: '' });
    toast.success('Category created');
  };

  const addTag = async (event) => {
    event.preventDefault();
    const response = await categoryApi.createTag(tag);
    tags.setData([...(tags.data || []), unwrap(response) || response?.data]);
    setTag({ name: '' });
    toast.success('Tag created');
  };

  const removeCategory = async (id) => {
    if (!confirm('Delete this category?')) return;

    await categoryApi.deleteCategory(id);
    cats.setData((cats.data || []).filter((item) => categoryIdOf(item) !== id));
    toast.success('Category deleted');
  };

  const removeTag = async (id) => {
    if (!confirm('Delete this tag?')) return;

    await categoryApi.deleteTag(id);
    tags.setData((tags.data || []).filter((item) => tagIdOf(item) !== id));
    toast.success('Tag deleted');
  };

  return (
    <DashboardLayout title="Categories & Tags" items={adminItems}>
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <form onSubmit={addCat} className="card mb-4 grid gap-3">
            <h2 className="text-xl font-bold">New category</h2>
            <input
              className="input"
              placeholder="Name"
              value={category.name}
              onChange={(event) => setCategory({ ...category, name: event.target.value })}
            />
            <input
              className="input"
              placeholder="Description"
              value={category.description}
              onChange={(event) => setCategory({ ...category, description: event.target.value })}
            />
            <button className="btn-primary">Create</button>
          </form>

          <div className="grid gap-2">
            {cats.data?.map((item) => {
              const id = categoryIdOf(item);

              return (
                <div className="card flex items-center justify-between gap-4" key={id}>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    {item.description ? (
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    ) : null}
                  </div>

                  <button onClick={() => removeCategory(id)} className="btn-muted" type="button">
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <form onSubmit={addTag} className="card mb-4 grid gap-3">
            <h2 className="text-xl font-bold">New tag</h2>
            <input
              className="input"
              placeholder="Name"
              value={tag.name}
              onChange={(event) => setTag({ name: event.target.value })}
            />
            <button className="btn-primary">Create</button>
          </form>

          <div className="grid gap-2">
            {tags.data?.map((item) => {
              const id = tagIdOf(item);

              return (
                <div className="card flex items-center justify-between gap-4" key={id}>
                  <div className="font-semibold">{item.name}</div>
                  <button onClick={() => removeTag(id)} className="btn-muted" type="button">
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
