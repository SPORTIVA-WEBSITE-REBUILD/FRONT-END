import { useId, useRef, useState } from 'react';

/**
 * A tab set following the WAI-ARIA tabs pattern with automatic activation:
 * arrow keys move focus and switch the panel in the same step, Home and End
 * jump to the ends, and only the selected tab is in the tab order (roving
 * tabindex) so Tab steps past the set rather than through every tab.
 *
 * Every panel stays in the layout, stacked in one grid cell, so the set is
 * always as tall as its tallest panel and nothing below moves when the tab
 * changes. Inactive panels carry `hidden`, which keeps them out of the
 * accessibility tree and out of the tab order; app.css then overrides the
 * display:none that `hidden` implies with visibility:hidden, so they still
 * take part in sizing the grid. Dropping either half brings the jumping back.
 *
 * `item.extra` renders after the paragraph — the record tab uses it to hang a
 * live count off content that is otherwise plain text from the CMS.
 *
 * `panelsRef` and `panelMinHeight` are how a parent that needs the panel set
 * to line up against something else of its own (a photograph, in
 * AboutBlock.jsx) gets a hook into the panels host without Tabs needing to
 * know anything about that geometry itself.
 */
export default function Tabs({ items = [], panelsRef, panelMinHeight }) {
  const id = useId().replace(/:/g, '');
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  if (!items.length) return null;

  const focusTab = (i) => {
    setActive(i);
    tabRefs.current[i]?.focus();
  };

  const onKeyDown = (e) => {
    const last = items.length - 1;
    const keys = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    focusTab(keys[e.key]);
  };

  return (
    <div className="pcn-tabs">
      <div className="pcn-tabs__list" role="tablist" onKeyDown={onKeyDown}>
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            ref={(el) => { tabRefs.current[i] = el; }}
            className={`pcn-tabs__tab${i === active ? ' is-active' : ''}`}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div
        className="pcn-tabs__panels"
        ref={panelsRef}
        style={panelMinHeight ? { minHeight: panelMinHeight } : undefined}
      >
        {items.map((item, i) => (
          <div
            key={item.title}
            id={`${id}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${i}`}
            className={`pcn-tabs__panel${i === active ? ' is-active' : ''}`}
            hidden={i !== active}
          >
            {item.text && <p className="pcn-tabs__text">{item.text}</p>}
            {item.extra}
          </div>
        ))}
      </div>
    </div>
  );
}
