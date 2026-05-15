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
    <article className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-200/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-none dark:hover:shadow-indigo-500/10">
      <Link to={`/blog/${post.slug || post.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={post.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageOff size={42} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-5 top-5 flex flex-wrap gap-2 z-10">
            {post.categories?.length > 0 ? (
              post.categories.map((c) => (
                <span
                  key={c.id || c.categoryId}
                  className="rounded-full border border-white/20 bg-white/20 px-3 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md shadow-sm"
                >
                  {c.name}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/20 bg-white/20 px-3 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md shadow-sm">
                Uncategorized
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <Link to={`/blog/${post.slug || post.id}`} className="group/title block flex-1">
          <div className="flex items-start justify-between gap-4">
            <h2 className="line-clamp-2 text-2xl font-black tracking-tight leading-snug text-slate-900 transition-colors group-hover/title:text-indigo-600 dark:text-white">
              {post.title}
            </h2>

            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 opacity-0 transition-all duration-300 group-hover/title:-translate-y-1 group-hover/title:translate-x-1 group-hover/title:bg-indigo-50 group-hover/title:text-indigo-600 group-hover/title:opacity-100 dark:bg-slate-800 dark:group-hover/title:bg-indigo-500/20 dark:group-hover/title:text-indigo-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
        </Link>

        <p className="mt-5 line-clamp-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {excerpt(post.content)}
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-sm font-medium text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <UserRound size={14} />
            </div>
            Author #{post.userId || post.authorId}
          </span>

          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-slate-400" />
            {fmt(post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}