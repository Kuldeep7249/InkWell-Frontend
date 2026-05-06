import { Link } from "react-router-dom";
import { CalendarDays, UserRound, ArrowUpRight, ImageOff } from "lucide-react";
import { excerpt, fmt } from "../../utils/helpers.js";

export default function PostCard({ post }) {
  const image =
    post.featuredImageUrl ||
    post.imageUrl ||
    post.thumbnailUrl ||
    post.mediaUrls?.[0];

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/blog/${post.slug || post.id}`} className="block">
        <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageOff size={42} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {post.categories?.length > 0 ? (
              post.categories.map((c) => (
                <span
                  key={c.id || c.categoryId}
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur"
                >
                  {c.name}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                Uncategorized
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/blog/${post.slug || post.id}`} className="group/title block">
          <div className="flex items-start justify-between gap-4">
            <h2 className="line-clamp-2 text-2xl font-black leading-tight text-slate-900 transition-colors group-hover/title:text-indigo-600 dark:text-white">
              {post.title}
            </h2>

            <ArrowUpRight
              size={22}
              className="mt-1 shrink-0 text-slate-400 transition-all group-hover/title:translate-x-1 group-hover/title:-translate-y-1 group-hover/title:text-indigo-600"
            />
          </div>
        </Link>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {excerpt(post.content)}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <UserRound size={16} />
            Author #{post.userId || post.authorId}
          </span>

          <span className="flex items-center gap-2">
            <CalendarDays size={16} />
            {fmt(post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}