import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useArticle, useSiteSettings } from '../hooks/useContent.js';
import { graph, article as articleSchema, breadcrumbs } from '../lib/structuredData.js';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useArticle(slug);
  const { data: siteData } = useSiteSettings();

  const article = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) {
      navigate(`/insights/${redirectTo}`, { replace: true });
    }
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} title="Article not found" /></div>;

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    : null;

  return (
    <>
      <Seo
        seo={article.seo}
        title={article.title}
        description={article.excerpt}
        image={article.featuredImage}
        path={`/insights/${article.slug}`}
        type="article"
        article={{ publishedAt: article.publishedAt, author: article.author?.name }}
        jsonLd={graph(
          articleSchema(article, siteData?.settings, '/insights'),
          breadcrumbs([
            { label: 'Home', href: '/' },
            { label: 'Insights', href: '/insights' },
            { label: article.title },
          ]),
        )}
      />
      <PageHero
        title={article.title}
        image={article.featuredImage}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights' }, { label: article.title }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              <div className="meta mb-4 d-flex flex-wrap" style={{ gap: '1.5rem' }}>
                {published && <time dateTime={article.publishedAt}>{published}</time>}
                {article.author?.name && (
                  <span>
                    By{' '}
                    <Link to={`/lawyers/${article.author.slug}`}>{article.author.name}</Link>
                  </span>
                )}
                {article.category?.name && <span>{article.category.name}</span>}
                {article.readingMinutes && <span>{article.readingMinutes} min read</span>}
              </div>

              {article.featuredImage && (
                <SmartImage
                  media={article.featuredImage}
                  width={1200}
                  className="img-fluid mb-4"
                  sizes="(max-width: 992px) 100vw, 66vw"
                  priority
                />
              )}

              <RichText html={article.body} />

              {article.tags?.length > 0 && (
                <div className="tag-widget post-tag-container mb-5 mt-5">
                  <div className="tagcloud">
                    {article.tags.map((tag) => (
                      <Link key={tag} to={`/insights?tag=${encodeURIComponent(tag)}`} className="tag-cloud-link">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {article.author?.bio && (
                <div className="about-author d-flex p-4 bg-light">
                  {article.author.photo && (
                    <div className="bio mr-5">
                      <SmartImage media={article.author.photo} width={150} height={150} crop="fill" className="img-fluid mb-4" />
                    </div>
                  )}
                  <div className="desc">
                    <h3>{article.author.name}</h3>
                    <RichText html={article.author.bio} />
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              {article.related?.length > 0 && (
                <div className="sidebar-box ftco-animate">
                  <h3 className="heading">Related insights</h3>
                  {article.related.map((r) => (
                    <div className="block-21 mb-4 d-flex" key={r.slug}>
                      {r.featuredImage && (
                        <Link to={`/insights/${r.slug}`} className="blog-img mr-4">
                          <SmartImage media={r.featuredImage} width={200} height={140} crop="fill" />
                        </Link>
                      )}
                      <div className="text">
                        <h3 className="heading"><Link to={`/insights/${r.slug}`}>{r.title}</Link></h3>
                        {r.publishedAt && (
                          <div className="meta">
                            <time dateTime={r.publishedAt}>
                              {new Date(r.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </time>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sidebar-box">
                <h3 className="heading">Speak to the firm</h3>
                <p>If this raises a question about your own position, get in touch.</p>
                <Link to="/contact" className="btn btn-primary py-2 px-4">Make an enquiry</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
