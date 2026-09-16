export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const window = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i += 1) {
    window.push(i);
  }

  return (
    <div className="row mt-5">
      <div className="col text-center">
        <div className="block-27">
          <ul>
            <li>
              <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
                &lt;
              </button>
            </li>
            {window.map((p) => (
              <li key={p} className={p === page ? 'active' : undefined}>
                <button type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
                  {p}
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages}>
                &gt;
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
