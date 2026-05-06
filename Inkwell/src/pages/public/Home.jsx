import { useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import PostCard from '../../components/blog/PostCard.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useApi } from '../../hooks/useApi.js';
import { postApi } from '../../api/postApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { unwrap } from '../../utils/helpers.js';

const UNCATEGORIZED_ID = 'uncategorized';

function normalizeCategory(category) {
  const id = category?.id ?? category?.categoryId;
  if (id == null) return null;

  return {
    id: String(id),
    name: category?.name?.trim() || `Category ${id}`
  };
}

function getPostCategories(post, categoryMap) {
  if (Array.isArray(post?.categories) && post.categories.length > 0) {
    const normalized = post.categories
      .map(normalizeCategory)
      .filter(Boolean);

    if (normalized.length > 0) return normalized;
  }

  const fallbackId = post?.categoryId;
  if (fallbackId == null) return [];

  const fallbackKey = String(fallbackId);
  return [
    {
      id: fallbackKey,
      name: categoryMap.get(fallbackKey)?.name || `Category ${fallbackId}`
    }
  ];
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { data: posts, loading } = useApi(() => postApi.public(), []);
  const { data: categories } = useApi(() => categoryApi.listCategories(), []);
  const { data: tags } = useApi(() => categoryApi.trending(), []);

  const categoryMap = useMemo(() => {
    const map = new Map();

    (Array.isArray(categories) ? categories : [])
      .map(normalizeCategory)
      .filter(Boolean)
      .forEach((category) => {
        map.set(category.id, category);
      });

    (Array.isArray(posts) ? posts : []).forEach((post) => {
      getPostCategories(post, map).forEach((category) => {
        if (!map.has(category.id)) {
          map.set(category.id, category);
        }
      });
    });

    return map;
  }, [categories, posts]);

  const groupedPosts = useMemo(() => {
    const buckets = new Map();

    (Array.isArray(posts) ? posts : []).forEach((post) => {
      const postCategories = getPostCategories(post, categoryMap);

      if (postCategories.length === 0) {
        if (!buckets.has(UNCATEGORIZED_ID)) {
          buckets.set(UNCATEGORIZED_ID, {
            id: UNCATEGORIZED_ID,
            name: 'Uncategorized',
            posts: []
          });
        }

        buckets.get(UNCATEGORIZED_ID).posts.push(post);
        return;
      }

      postCategories.forEach((category) => {
        if (!buckets.has(category.id)) {
          buckets.set(category.id, {
            ...category,
            posts: []
          });
        }

        buckets.get(category.id).posts.push(post);
      });
    });

    return [...buckets.values()].sort((left, right) => right.posts.length - left.posts.length);
  }, [categoryMap, posts]);

  const visibleGroups = useMemo(() => {
    if (activeCategory === 'all') return groupedPosts;
    return groupedPosts.filter((group) => group.id === activeCategory);
  }, [activeCategory, groupedPosts]);

  const totalPosts = Array.isArray(posts) ? posts.length : 0;
  const trendingTags = unwrap({ data: tags }) || tags || [];

  return (
    <Layout>
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-slate-950 p-10 text-white">
        <p className="font-semibold text-indigo-100">InkWell</p>
        <h1 className="mt-2 max-w-3xl text-5xl font-black">Write. Publish. Connect. Inspire.</h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          Explore stories organized by category, discover what matters to you, and move between topics without losing the bigger picture.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="space-y-8">
          <div className="card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Browse by category</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Category-wise blog feed</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Jump into a single topic or scan every section with posts grouped under their categories.
                </p>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                {totalPosts} published post{totalPosts === 1 ? '' : 's'}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={activeCategory === 'all' ? 'btn-primary' : 'btn-muted'}
              >
                All categories
              </button>

              {groupedPosts.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveCategory(group.id)}
                  className={activeCategory === group.id ? 'btn-primary' : 'btn-muted'}
                >
                  {group.name} ({group.posts.length})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : totalPosts ? (
            visibleGroups.length ? (
              visibleGroups.map((group) => (
                <section key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{group.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {group.posts.length} post{group.posts.length === 1 ? '' : 's'} in this category
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {group.posts.map((post) => (
                      <PostCard key={`${group.id}-${post.id}`} post={post} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState title="No posts in this category" text="Try switching to another category or view all categories." />
            )
          ) : (
            <EmptyState title="No published posts" text="Approved posts from backend will appear here." />
          )}
        </section>

        <aside className="card h-fit">
          <h3 className="font-bold">Trending Tags</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <span className="badge" key={tag.id || tag.tagId}>
                {tag.name}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </Layout>
  );
}
