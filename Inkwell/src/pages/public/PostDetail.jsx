import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  UserRound,
  ImageOff,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

import Layout from "../../components/layout/Layout.jsx";
import CommentBox from "../../components/comments/CommentBox.jsx";
import CommentItem from "../../components/comments/CommentItem.jsx";
import Loading from "../../components/common/Loading.jsx";

import { postApi } from "../../api/postApi.js";
import { commentApi } from "../../api/commentApi.js";
import { useApi } from "../../hooks/useApi.js";
import { fmt } from "../../utils/helpers.js";
import { useAuth } from "../../hooks/useAuth.js";

const getCommentId = (comment) => comment?.commentId ?? comment?.id;
const getParentId = (comment) =>
  comment?.parentCommentId ?? comment?.parentId ?? null;
const getChildReplies = (comment) =>
  Array.isArray(comment?.replies) ? comment.replies : [];

const buildCommentTree = (comments = []) => {
  if (!Array.isArray(comments)) return [];

  const hasNestedReplies = comments.some(
    (comment) => getChildReplies(comment).length
  );
  const hasFlatParentLinks = comments.some((comment) => getParentId(comment));

  if (hasNestedReplies && !hasFlatParentLinks) return comments;

  const mapped = new Map();

  comments.forEach((comment) => {
    const commentId = getCommentId(comment);
    if (commentId) mapped.set(commentId, { ...comment, replies: [] });
  });

  const roots = [];

  comments.forEach((comment) => {
    const commentId = getCommentId(comment);
    const parentId = getParentId(comment);
    const current = mapped.get(commentId) ?? { ...comment, replies: [] };

    if (parentId && mapped.has(parentId)) {
      mapped.get(parentId).replies.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [commentRefreshKey, setCommentRefreshKey] = useState(0);

  const post = useApi(() => postApi.publicById(id), [id]);
  const comments = useApi(() => commentApi.byPost(id), [id, commentRefreshKey]);

  const refreshComments = () => setCommentRefreshKey((key) => key + 1);

  const rootComments = useMemo(
    () => buildCommentTree(comments.data),
    [comments.data]
  );

  const image =
    post.data?.featuredImageUrl ||
    post.data?.imageUrl ||
    post.data?.thumbnailUrl ||
    post.data?.mediaUrls?.[0];

  return (
    <Layout>
      {post.loading ? (
        <Loading />
      ) : (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-[260px] w-full overflow-hidden bg-slate-100 sm:h-[360px] lg:h-[460px] dark:bg-slate-800">
            {image ? (
              <img
                src={image}
                alt={post.data?.title || "Post image"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                <ImageOff size={52} />
                <p className="mt-3 text-sm">No featured image available</p>
              </div>
            )}

            {image && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            <Link
              to="/"
              className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white dark:bg-slate-900/80 dark:text-slate-200"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {post.data?.categories?.length > 0 ? (
                  post.data.categories.map((c) => (
                    <span
                      key={c.id || c.categoryId}
                      className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-700 backdrop-blur"
                    >
                      {c.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur">
                    Uncategorized
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
                {post.data?.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/90">
                <span className="flex items-center gap-2">
                  <UserRound size={17} />
                  Author #{post.data?.userId || post.data?.authorId}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={17} />
                  {fmt(post.data?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
            <div
              className="prose-content prose max-w-none text-slate-700 dark:text-slate-200"
              dangerouslySetInnerHTML={{ __html: post.data?.content }}
            />
          </div>
        </article>
      )}

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
              <MessageCircle size={24} />
              Comments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Join the discussion and share your thoughts.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {rootComments.length} comments
          </span>
        </div>

        {user ? (
          <CommentBox postId={id} onAdded={refreshComments} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Login to comment on this post.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {rootComments.map((comment) => (
            <CommentItem
              key={getCommentId(comment)}
              comment={comment}
              postId={id}
              onRefresh={refreshComments}
              initialReplies={comment.replies}
            />
          ))}

          {!comments.loading && rootComments.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-800/50">
              No comments yet. Be the first to comment.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}