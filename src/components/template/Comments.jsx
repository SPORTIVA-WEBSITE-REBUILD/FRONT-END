import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../lib/api.js';
import { useComments } from '../../hooks/useContent.js';
import { commentDate } from '../../lib/format.js';
import { safeHref } from '../../lib/links.js';

/** Commenters have no photo; a lettered circle fills the template's avatar slot. */
function avatar(name = '') {
  const letter = (name.trim()[0] || '?').toUpperCase().replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#e6e6e6"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-size="44" fill="#999">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function Comment({ comment, labels, onReply }) {
  const site = safeHref(comment.website);
  return (
    <li className="comment">
      <div className="vcard bio">
        <img src={avatar(comment.name)} alt="" />
      </div>
      <div className="comment-body">
        <h3>{site && /^https?:/i.test(site) ? <a href={site} rel="nofollow ugc noopener noreferrer" target="_blank">{comment.name}</a> : comment.name}</h3>
        <div className="meta">{commentDate(comment.createdAt)}</div>
        <p style={{ whiteSpace: 'pre-line' }}>{comment.message}</p>
        <p>
          <a href="#comment-form" className="reply" onClick={(e) => { e.preventDefault(); onReply(comment); }}>
            {labels.reply}
          </a>
        </p>
      </div>
      {comment.replies?.length > 0 && (
        <ul className="children">
          {comment.replies.map((r) => <Comment key={r._id} comment={r} labels={labels} onReply={onReply} />)}
        </ul>
      )}
    </li>
  );
}

const EMPTY = { name: '', email: '', website: '', message: '', phone: '' };

/**
 * The threaded comment list and "Leave a comment" form from blog-single.html.
 * Only approved comments are listed; a new one waits for moderation, and the
 * visitor is told so.
 */
export default function Comments({ slug, labels = {} }) {
  const { data } = useComments(slug);
  const [values, setValues] = useState(EMPTY);
  const [replyTo, setReplyTo] = useState(null);
  const [invalid, setInvalid] = useState({});
  const formRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (payload) => apiPost(`/articles/${slug}/comments`, payload),
    onSuccess: () => { setValues(EMPTY); setReplyTo(null); },
  });

  const roots = data?.data || [];
  const total = data?.meta?.total ?? 0;
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const onReply = (comment) => {
    setReplyTo(comment);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = {
      name: values.name.trim().length < 2,
      email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email),
      website: Boolean(values.website) && !/^https?:\/\/\S+\.\S+/i.test(values.website),
      message: values.message.trim().length < 3,
    };
    setInvalid(found);
    if (Object.values(found).some(Boolean)) return;
    const { phone, website, ...rest } = values;
    mutation.mutate({
      ...rest,
      ...(website ? { website } : {}),
      ...(phone ? { phone } : {}),
      ...(replyTo ? { parent: replyTo._id } : {}),
    });
  };

  return (
    <div className="pt-5 mt-5" id="comments">
      {total > 0 && (
        <>
          <h3 className="mb-5">{total} {total === 1 ? labels.countOne : labels.countMany}</h3>
          <ul className="comment-list">
            {roots.map((c) => <Comment key={c._id} comment={c} labels={labels} onReply={onReply} />)}
          </ul>
        </>
      )}

      <div className="comment-form-wrap pt-5" id="comment-form" ref={formRef}>
        <h3 className="mb-5">{labels.formHeading}</h3>
        <form onSubmit={onSubmit} className="p-5 bg-light" noValidate>
          {mutation.isSuccess && <div className="pcn-form-alert pcn-form-alert--success" role="status">{labels.success}</div>}
          {mutation.isError && <div className="pcn-form-alert pcn-form-alert--error" role="alert">{labels.error}</div>}
          {replyTo && (
            <p>
              {labels.replyingTo} <strong>{replyTo.name}</strong>{' '}
              <a href="#comment-form" onClick={(e) => { e.preventDefault(); setReplyTo(null); }}>{labels.cancelReply}</a>
            </p>
          )}
          <div className="form-group">
            <label htmlFor="name">{labels.name}</label>
            <input type="text" className="form-control" id="name" value={values.name} onChange={set('name')} aria-invalid={invalid.name || undefined} />
          </div>
          <div className="form-group">
            <label htmlFor="email">{labels.email}</label>
            <input type="email" className="form-control" id="email" value={values.email} onChange={set('email')} aria-invalid={invalid.email || undefined} />
          </div>
          <div className="form-group">
            <label htmlFor="website">{labels.website}</label>
            <input type="url" className="form-control" id="website" value={values.website} onChange={set('website')} aria-invalid={invalid.website || undefined} />
          </div>
          <div className="form-group">
            <label htmlFor="message">{labels.message}</label>
            <textarea id="message" cols="30" rows="10" className="form-control" value={values.message} onChange={set('message')} aria-invalid={invalid.message || undefined} />
          </div>
          <div className="pcn-honeypot" aria-hidden="true">
            <input type="text" name="phone" tabIndex={-1} autoComplete="off" value={values.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <input type="submit" value={(mutation.isPending ? labels.sending : labels.submit) ?? ''} className="btn py-3 px-4 btn-primary" disabled={mutation.isPending} />
          </div>
        </form>
      </div>
    </div>
  );
}
