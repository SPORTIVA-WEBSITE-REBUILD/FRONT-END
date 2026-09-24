import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backgroundStyle } from "../SmartImage.jsx";
import {
  useArticles,
  useCategories,
  useServices,
  useTags,
} from "../../hooks/useContent.js";
import { shortDate, authorsOf } from "../../lib/format.js";

/**
 * The template's sidebar on Practice Single and Blog Single: search, a
 * category list, recent articles, a tag cloud and a text box. On a service
 * page the categories are the services, with the current one active; on an
 * article they are the blog categories.
 */
export default function Sidebar({
  widgets = {},
  paragraph = {},
  kind = "article",
  activeSlug,
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: services } = useServices();
  const { data: categories } = useCategories();
  const { data: recent } = useArticles({ limit: 3 });
  const { data: tags } = useTags();

  const categoryLinks =
    kind === "service"
      ? (services || []).map((s) => ({
          key: s.slug,
          label: s.title,
          href: `/services/${s.slug}`,
          active: s.slug === activeSlug,
        }))
      : (categories || []).map((c) => ({
          key: c.slug,
          label: c.name,
          href: `/articles?category=${encodeURIComponent(c.slug)}`,
          active: c.slug === activeSlug,
        }));

  return (
    <div className="col-lg-4 sidebar pl-lg-5 ftco-animate pcn-sidebar">
      <div className="sidebar-box">
        <form
          className="search-form"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(
              q.trim()
                ? `/articles?q=${encodeURIComponent(q.trim())}`
                : "/articles",
            );
          }}
        >
          <div className="form-group">
            <span className="icon icon-search" />
            <input
              type="text"
              className="form-control"
              placeholder={widgets.searchPlaceholder}
              aria-label={widgets.searchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </form>
      </div>

      {categoryLinks.length > 0 && (
        <div className="sidebar-box ftco-animate">
          <div className="categories">
            <h3>{widgets.categoriesTitle}</h3>
            <ul className="pcn-sidebar-categories list-unstyled mb-0">
              {categoryLinks.map((c) => (
                <li key={c.key} className={c.active ? "active" : undefined}>
                  <Link to={c.href}>
                    {c.label} <span className="ion-ios-arrow-forward" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {recent?.data?.length > 0 && (
        <div className="sidebar-box ftco-animate">
          <h3>{widgets.recentBlogTitle}</h3>
          {recent.data.map((a) => (
            <div className="block-21 mb-4 d-flex" key={a.slug}>
              <Link
                to={`/articles/${a.slug}`}
                className={`blog-img mr-4${a.featuredImage ? "" : " pcn-banner-fallback"}`}
                style={backgroundStyle(a.featuredImage, null, 200, {
                  height: 200,
                  crop: "fill",
                  gravity: "auto",
                })}
                aria-label={a.title}
              />
              <div className="text">
                <h3 className="heading">
                  <Link to={`/articles/${a.slug}`}>{a.title}</Link>
                </h3>
                <div className="meta">
                  <div>
                    <Link to={`/articles/${a.slug}`}>
                      <span className="icon-calendar" />{" "}
                      {shortDate(a.publishedAt)}
                    </Link>
                  </div>
                  {authorsOf(a).length > 0 && (
                    <div>
                      <span className="icon-person" />{" "}
                      {authorsOf(a).map((au, i) => (
                        <span key={au.slug}>
                          {i > 0 && ", "}
                          <Link to={`/lawyers/${au.slug}`}>{au.name}</Link>
                        </span>
                      ))}
                    </div>
                  )}
                  <div>
                    <Link to={`/articles/${a.slug}#comments`}>
                      <span className="icon-chat" /> {a.commentCount || 0}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tags?.length > 0 && (
        <div className="sidebar-box ftco-animate">
          <h3>{widgets.tagCloudTitle}</h3>
          <div className="tagcloud">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/articles?tag=${encodeURIComponent(tag)}`}
                className="tag-cloud-link"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(paragraph.heading || paragraph.body) && (
        <div className="sidebar-box ftco-animate">
          {paragraph.heading && <h3>{paragraph.heading}</h3>}
          {paragraph.body && <p>{paragraph.body}</p>}
        </div>
      )}
    </div>
  );
}
