import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

async function assignTaxonomy(postId, categoryId, tagIds) {
  if (categoryId != null) {
    await categoryApi.addCategoryToPost({ postId, categoryId });
  }

  await Promise.all((tagIds || []).map((tagId) => tagApi.addTagToPost({ postId, tagId })));
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const categoriesQuery = useApi(() => categoryApi.listCategories(), []);
  const tagsQuery = useApi(() => tagApi.listTags(), []);

  const categories = useMemo(() => (Array.isArray(categoriesQuery.data) ? categoriesQuery.data : []), [categoriesQuery.data]);
  const tags = useMemo(() => (Array.isArray(tagsQuery.data) ? tagsQuery.data : []), [tagsQuery.data]);

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
      const response = await postApi.createPost(payload);
      const created = unwrap(response);
      const postId = created?.id ?? created?.postId;

      if (postId) {
        await assignTaxonomy(postId, values.categoryId, values.tagIds || []);
      }

      toast.success('Post created');
      navigate('/author/posts');
    } catch (error) {
      console.error('Create post failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = categoriesQuery.loading || tagsQuery.loading;

  return (
    <DashboardLayout title="Create post" items={items}>
      {isLoading ? (
        <Loading />
      ) : (
        <PostForm
          mode="create"
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
