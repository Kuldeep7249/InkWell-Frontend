export const unwrap = (res) => res?.data?.data ?? res?.data;
export const fmt = (d) => d ? new Date(d).toLocaleString() : '';
export const excerpt = (html='', n=150) => html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,n) + (html.length>n?'...':'');
export const idOf = (x) => x?.id ?? x?.userId ?? x?.postId ?? x?.categoryId ?? x?.tagId ?? x?.commentId ?? x?.mediaId ?? x?.notificationId;
