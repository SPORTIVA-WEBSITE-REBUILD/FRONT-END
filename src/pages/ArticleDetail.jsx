import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import SmartImage from "../components/SmartImage.jsx";
import RichText from "../components/RichText.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import Sidebar from "../components/template/Sidebar.jsx";
import Comments from "../components/template/Comments.jsx";
import { LoadingSection, ErrorState } from "../components/states.jsx";
import {
  useArticle,
  usePage,
  useSiteSettings,
  section,
} from "../hooks/useContent.js";
import {
  graph,
  article as articleSchema,
  breadcrumbs,
} from "../lib/structuredData.js";

/** blog-single.html */
export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useArticle(slug);
  const { data: page } = usePage("article-detail");
  const { data: siteData } = useSiteSettings();

  const article = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug)
      navigate(`/insights/${redirectTo}`, { replace: true });
  }, [redirectTo, slug, navigate]);

  if (isLoading)
    return (
      <div className="container py-5">
        <LoadingSection rows={8} />
      </div>
    );
  if (isError)
    return (
      <div className="container py-5">
        <ErrorState error={error} />
      </div>
    );

  const hero = section(page, "hero");
  const parent = { label: hero.labels?.parent, href: "/insights" };

  return (
    <>
      <Seo
        seo={article.seo}
        title={article.title}
        description={article.excerpt}
        image={article.featuredImage}
        path={`/insights/${article.slug}`}
        type="article"
        article={{
          publishedAt: article.publishedAt,
          author: article.author?.name,
        }}
        jsonLd={graph(
          articleSchema(article, siteData?.settings, "/insights"),
          breadcrumbs([
            { label: "Home", href: "/" },
            { label: parent.label, href: parent.href },
            { label: article.title },
          ]),
        )}
      />
      <PageBanner
        title={article.title}
        image={hero.image || article.featuredImage}
        parent={parent}
      />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {article.featuredImage && (
                <div className="pcn-featured-media mb-4">
                  <SmartImage
                    media={article.featuredImage}
                    width={1200}
                    className="img-fluid"
                    sizes="(max-width: 992px) 100vw, 66vw"
                    priority
                  />
                </div>
              )}
              <div
                className="pcn-case__meta mb-2"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-3)",
                  fontSize: 13,
                }}
              >
                {[
                  article.category?.name,
                  article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : null,
                  article.readingMinutes
                    ? `${article.readingMinutes} min read`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              <h1
                className="mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  letterSpacing: "-0.01em",
                }}
              >
                {article.title}
              </h1>
              <RichText html={article.body} />

              {article.tags?.length > 0 && (
                <div className="tag-widget post-tag-container mb-5 mt-5">
                  <div className="tagcloud">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/insights?tag=${encodeURIComponent(tag)}`}
                        className="tag-cloud-link"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {article.author && (
                <div className="pcn-author-box p-4 my-5 d-flex align-items-center">
                  {article.author.photo && (
                    <div className="pcn-author-avatar mr-4 flex-shrink-0">
                      <SmartImage
                        media={article.author.photo}
                        width={100}
                        height={100}
                        crop="fill"
                        gravity="faces"
                        className="rounded-circle"
                        alt={article.author.name}
                      />
                    </div>
                  )}
                  <div className="desc">
                    <span
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--ink-3)",
                        fontWeight: 600,
                      }}
                    >
                      Written by
                    </span>
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.35rem",
                        fontWeight: 600,
                      }}
                    >
                      <Link
                        to={`/lawyers/${article.author.slug}`}
                        style={{ color: "var(--ink-1)" }}
                      >
                        {article.author.name}
                      </Link>
                    </h3>
                    <RichText html={article.author.bio} />
                  </div>
                </div>
              )}

              <Comments
                slug={article.slug}
                labels={section(page, "comments").labels}
              />
            </div>

            <Sidebar
              kind="article"
              activeSlug={article.category?.slug}
              widgets={section(page, "widgets").labels}
              paragraph={section(page, "sidebar")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
