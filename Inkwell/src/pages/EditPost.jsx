import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { categoryApi } from '../api/categoryApi.js';
import { postApi } from '../api/postApi.js';
import { tagApi } from '../api/tagApi.js';
import Loading from '../components/common/Loading.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import PostForm from '../components/post/PostForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useApi } from '../hooks/useApi.js';
import { unwrap } from '../utils/helpers.js';

const items = [
  { to: '/author', label: 'Overview' },
  { to: '/author/posts', label: 'My posts' },
  { to: '/author/posts/new', label: 'Create post' },
  { to: '/author/media', label: 'Media library' }
];

function normalizeId(item, keys) {
  for (const key of keys) {
    if (item?.[key] != null) return Number(item[key]);
  }
  return null;
}

async function syncTaxonomy(postId, currentCategoryIds, currentTagIds, nextCategoryId, nextTagIds) {
  const nextCategoryIds = nextCategoryId != null ? [nextCategoryId] : [];
  const categoriesToAdd = nextCategoryIds.filter((categoryId) => !currentCategoryIds.includes(categoryId));
  const categoriesToRemove = currentCategoryIds.filter((categoryId) => !nextCategoryIds.includes(categoryId));
  const tagsToAdd = (nextTagIds || []).filter((tagId) => !currentTagIds.includes(tagId));
  const tagsToRemove = currentTagIds.filter((tagId) => !(nextTagIds || []).includes(tagId));

  await Promise.all([
    ...categoriesToAdd.map((categoryId) => categoryApi.addCategoryToPost({ postId, categoryId })),
    ...categoriesToRemove.map((categoryId) => categoryApi.removeCategoryFromPost({ postId, categoryId })),
    ...tagsToAdd.map((tagId) => tagApi.addTagToPost({ postId, tagId })),
    ...tagsToRemove.map((tagId) => tagApi.removeTagFromPost({ postId, tagId }))
  ]);
}

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const postQuery = useApi(() => postApi.getPost(id), [id]);
  const categoriesQuery = useApi(() => categoryApi.listCategories(), []);
  const tagsQuery = useApi(() => tagApi.listTags(), []);
  const postCategoriesQuery = useApi(() => categoryApi.getPostCategories(id), [id]);
  const postTagsQuery = useApi(() => tagApi.getPostTags(id), [id]);

  const categories = useMemo(() => (Array.isArray(categoriesQuery.data) ? categoriesQuery.data : []), [categoriesQuery.data]);
  const tags = useMemo(() => (Array.isArray(tagsQuery.data) ? tagsQuery.data : []), [tagsQuery.data]);

  const currentCategoryIds = useMemo(() => {
    const list = Array.isArray(postCategoriesQuery.data) ? postCategoriesQuery.data : [];
    return [...new Set(list.map((item) => normalizeId(item, ['categoryId', 'id'])).filter((value) => value != null))];
  }, [postCategoriesQuery.data]);

  const currentTagIds = useMemo(() => {
    const list = Array.isArray(postTagsQuery.data) ? postTagsQuery.data : [];
    return [...new Set(list.map((item) => normalizeId(item, ['tagId', 'id'])).filter((value) => value != null))];
  }, [postTagsQuery.data]);

  const initialValues = useMemo(() => {
    const post = postQuery.data || {};
    const mediaUrls = Array.isArray(post?.mediaUrls)
      ? post.mediaUrls
      : Array.isArray(post?.media)
        ? post.media.map((item) => item?.url ?? item?.fileUrl).filter(Boolean)
        : [];

    return {
      title: post?.title ?? '',
      content: post?.content ?? '<p></p>',
      categoryId: post?.categoryId ?? currentCategoryIds[0],
      tagIds: Array.isArray(post?.tagIds) && post.tagIds.length ? post.tagIds.map(Number) : currentTagIds,
      featuredImageUrl: post?.featuredImageUrl ?? '',
      mediaUrls
    };
  }, [postQuery.data, currentCategoryIds, currentTagIds]);

  const handleSubmit = async (values) => {
    const payload = {
      title: values.title,
      content: values.content,
      categoryId: values.categoryId,
      tagIds: values.tagIds || [],
      featuredImageUrl: values.featuredImageUrl || '',
      mediaUrls: values.mediaUrls || []
    };

    try {
      setSubmitting(true);
      await postApi.updatePost(id, payload);
      await syncTaxonomy(id, currentCategoryIds, currentTagIds, values.categoryId, values.tagIds || []);
      toast.success('Post updated');
      navigate('/author/posts');
    } catch (error) {
      console.error('Update post failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading =
    postQuery.loading ||
    categoriesQuery.loading ||
    tagsQuery.loading ||
    postCategoriesQuery.loading ||
    postTagsQuery.loading;

  return (
    <DashboardLayout title="Edit post" items={items}>
      {isLoading ? (
        <Loading />
      ) : (
        <PostForm
          mode="edit"
          initialValues={initialValues}
          categories={categories}
          tags={tags}
          currentUser={user}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardLayout>
  );
}
