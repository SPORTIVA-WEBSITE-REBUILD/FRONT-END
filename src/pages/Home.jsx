import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import SmartImage, { backgroundStyle } from '../components/SmartImage.jsx';
import { LoadingCards, ErrorState } from '../components/states.jsx';
import { Reveal, useCountUp, useTextRotate } from '../hooks/useAnimations.jsx';
import GallerySection from '../components/GallerySection.jsx';
import { usePage, useServices, useCases, useArticles, useSiteSettings, section } from '../hooks/useContent.js';
import { graph, organisation, webSite } from '../lib/structuredData.js';

function Stat({ item }) {
  const [ref, value] = useCountUp(item.value);
  return (
    <div className="col-md-3 d-flex justify-content-center counter-wrap ftco-animate" ref={ref}>
      <div className="block-18 text-center">
        <div className="text">
          <strong className="number">{value}</strong>
          <span>{item.title}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: page, isLoading, isError, error, refetch } = usePage('home');
  const { data: services } = useServices();
  const { data: casesResult } = useCases({ limit: 3 });
  const { data: articlesResult } = useArticles({ limit: 3 });
  const { data: siteData } = useSiteSettings();

  const hero = section(page, 'hero');
  const intro = section(page, 'intro');
  const servicesSection = section(page, 'services');
  const recordSection = section(page, 'record');
  const insightsSection = section(page, 'insights');
  const cta = section(page, 'cta');
  const gallerySection = section(page, 'gallery');
  const stats = section(page, 'stats');

  // The template's hero rotated a word; the words are now content.
  const rotatingWords = (hero.items || []).map((i) => i.title).filter(Boolean);
  const rotating = useTextRotate(rotatingWords);

  if (isError) return <div className="container py-5"><ErrorState error={error} onRetry={refetch} /></div>;

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title === 'Home' ? undefined : page?.title}
        path="/"
        jsonLd={siteData?.settings
          ? graph(organisation(siteData.settings), webSite(siteData.settings))
          : null}
      />

      <div
        className={`hero-wrap js-fullheight${hero.image ? '' : ' pcn-banner-fallback'}`}
        style={backgroundStyle(hero.image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text js-fullheight align-items-center justify-content-start">
            <div className="col-md-6 ftco-animate fadeInUp ftco-animated">
              {hero.subheading && <h2 className="subheading">{hero.subheading}</h2>}
              <h1>
                {hero.heading}
                {rotating && <span className="txt-rotate"> {rotating}</span>}
              </h1>
              {hero.body && <p className="mb-4">{hero.body}</p>}
              {hero.cta?.label && (
                <p>
                  <Link to={hero.cta.href || '/contact'} className="btn btn-primary mr-md-4 py-2 px-4">
                    {hero.cta.label} <span className="ion-ios-arrow-forward" />
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="ftco-section ftco-no-pt">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 py-5">
              <Reveal className="heading-section">
                {servicesSection.subheading && <span className="subheading">{servicesSection.subheading}</span>}
                <h2 className="mb-4">{servicesSection.heading || 'What we do'}</h2>
                {servicesSection.body && <p>{servicesSection.body}</p>}
                <p>
                  <Link to="/services" className="btn btn-primary py-3 px-4">All services</Link>
                </p>
              </Reveal>
            </div>

            <div className="col-lg-9 services-wrap px-4 pt-5">
              {!services && <LoadingCards count={3} />}
              <div className="row pt-md-3">
                {(services || []).slice(0, 3).map((s) => (
                  <div className="col-md-4 d-flex align-items-stretch" key={s.slug}>
                    <div className="services text-center">
                      <div className="icon d-flex justify-content-center align-items-center">
                        <span className={s.icon || 'flaticon-lawyer'} />
                      </div>
                      <div className="text">
                        <h3>{s.title}</h3>
                        <p>{s.summary}</p>
                      </div>
                      <Link
                        to={`/services/${s.slug}`}
                        className="btn-custom d-flex align-items-center justify-content-center"
                        aria-label={`Read about ${s.title}`}
                      >
                        <span className="ion-ios-arrow-round-forward" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {intro.heading && (
        <section className="ftco-section ftco-no-pt ftco-no-pb">
          <div className="container">
            <div className="row d-flex">
              {intro.image && (
                <div className="col-md-6 d-flex">
                  <SmartImage media={intro.image} width={800} className="img-fluid" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              )}
              <div className={`col-md-6 pl-md-5 py-5${intro.image ? '' : ' mx-auto text-center'}`}>
                <Reveal className="heading-section pt-md-5">
                  {intro.subheading && <span className="subheading">{intro.subheading}</span>}
                  <h2 className="mb-4">{intro.heading}</h2>
                  {intro.body && <p>{intro.body}</p>}
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {stats.items?.length > 0 && (
        <section className="ftco-section ftco-counter" id="section-counter">
          <div className="container">
            <div className="row">
              {stats.items.map((item) => <Stat item={item} key={item.title} />)}
            </div>
          </div>
        </section>
      )}

      <section className="ftco-section bg-light">
        <div className="container">
          <div className="row justify-content-center mb-5 pb-3">
            <div className="col-md-7 heading-section text-center ftco-animate">
              {recordSection.subheading && <span className="subheading">{recordSection.subheading}</span>}
              <h2 className="mb-4">{recordSection.heading || 'Our record'}</h2>
              {recordSection.body && <p>{recordSection.body}</p>}
            </div>
          </div>

          {!casesResult && <LoadingCards count={3} />}
          <div className="row">
            {(casesResult?.data || []).map((c) => (
              <div className="col-md-4" key={c.slug}>
                <Reveal className="case-wrap">
                  <Link to={`/record/${c.slug}`} className="d-block">
                    {c.featuredImage && (
                      <SmartImage media={c.featuredImage} width={600} height={400} className="img-fluid mb-3" sizes="(max-width: 768px) 100vw, 33vw" />
                    )}
                    <div className="pcn-meta">
                      <span className="pcn-badge">{c.forum}</span>
                      <span className="pcn-badge">{c.year}</span>
                      <span className={`pcn-badge pcn-badge--${c.outcome}`}>{c.outcome}</span>
                    </div>
                    <h3>{c.title}</h3>
                  </Link>
                  <p>{c.summary}</p>
                </Reveal>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col text-center">
              <Link to="/record" className="btn btn-primary py-3 px-4">See the full record</Link>
            </div>
          </div>
        </div>
      </section>

      <GallerySection
        heading={gallerySection.heading}
        subheading={gallerySection.subheading}
        body={gallerySection.body}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center mb-5 pb-3">
            <div className="col-md-7 heading-section text-center ftco-animate">
              {insightsSection.subheading && <span className="subheading">{insightsSection.subheading}</span>}
              <h2 className="mb-4">{insightsSection.heading || 'Insights'}</h2>
            </div>
          </div>

          {!articlesResult && <LoadingCards count={3} />}
          <div className="row d-flex">
            {(articlesResult?.data || []).map((a) => (
              <div className="col-md-4 d-flex ftco-animate" key={a.slug}>
                <div className="blog-entry justify-content-end">
                  <Link to={`/insights/${a.slug}`} className="block-20">
                    {a.featuredImage && (
                      <SmartImage media={a.featuredImage} width={600} height={400} sizes="(max-width: 768px) 100vw, 33vw" />
                    )}
                  </Link>
                  <div className="text pt-4">
                    <div className="meta mb-3">
                      {a.publishedAt && (
                        <div>
                          <time dateTime={a.publishedAt}>
                            {new Date(a.publishedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </time>
                        </div>
                      )}
                      {a.author?.name && <div><span>{a.author.name}</span></div>}
                    </div>
                    <h3 className="heading">
                      <Link to={`/insights/${a.slug}`}>{a.title}</Link>
                    </h3>
                    <p>{a.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {cta.heading && (
        <section
          className={`ftco-section-parallax${cta.image ? '' : ' pcn-banner-fallback'}`}
          style={backgroundStyle(cta.image, null, 1920, { height: 700, crop: 'fill', gravity: 'auto' })}
        >
          <div className="parallax-img d-flex align-items-center">
            <div className="container">
              <div className="row d-flex justify-content-center">
                <div className="col-md-7 text-center heading-section heading-section-white ftco-animate">
                  <h2>{cta.heading}</h2>
                  {cta.body && <p>{cta.body}</p>}
                  {cta.cta?.label && (
                    <Link to={cta.cta.href || '/contact'} className="btn btn-primary py-3 px-4">
                      {cta.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isLoading && <div className="container py-5"><LoadingCards count={3} /></div>}
    </>
  );
}
