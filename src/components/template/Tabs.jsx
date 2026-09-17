import { useEffect, useId, useState } from 'react';

/**
 * The about block's pill tabs (`.tabulation-2`), with Bootstrap's tab
 * behaviour: the chosen pane becomes `active`, then `show` on the next frame
 * so `.fade` transitions it in.
 */
export default function Tabs({ items = [] }) {
  const id = useId().replace(/:/g, '');
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(active));
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!items.length) return null;

  const itemClass = (i) => {
    if (i === 0) return 'nav-item mb-md-0 mb-2';
    if (i === items.length - 1) return 'nav-item';
    return 'nav-item px-lg-2 mb-md-0 mb-2';
  };

  return (
    <div className="tabulation-2 mt-4">
      <ul className="nav nav-pills nav-fill d-md-flex d-block" role="tablist">
        {items.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li className={itemClass(i)} key={i} role="presentation">
            <a
              className={`nav-link${i === active ? ' active' : ''} py-2${i === items.length - 1 && i > 0 ? ' mb-md-0 mb-2' : ''}`}
              href={`#${id}-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls={`${id}-${i}`}
              onClick={(e) => { e.preventDefault(); setActive(i); }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
      <div className="tab-content bg-light rounded mt-2">
        {items.map((item, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            id={`${id}-${i}`}
            role="tabpanel"
            className={`tab-pane container p-0${i === 0 ? '' : ' fade'}${i === active ? ' active' : ''}${i === shown && i === active ? ' show' : ''}`}
          >
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
