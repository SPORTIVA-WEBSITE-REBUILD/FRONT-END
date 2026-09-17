import Seo from '../components/Seo.jsx';
import { backgroundStyle } from '../components/SmartImage.jsx';
import { ErrorState } from '../components/states.jsx';
import GallerySection from '../components/GallerySection.jsx';
import Carousel from '../components/template/Carousel.jsx';
import SmartLink from '../components/template/SmartLink.jsx';
import AboutBlock from '../components/template/AboutBlock.jsx';
import Consultation from '../components/template/Consultation.jsx';
import {
  BlogCard, CaseTile, FlipCard, SectionHeading, ServiceCard, TestimonyCard,
} from '../components/template/cards.jsx';
import { TxtRotate, useParallax } from '../hooks/useAnimations.jsx';
import {
  usePage, useServices, useCases, useArticles, useLawyers, useTestimonials,
  useSiteSettings, useCommon, section,
} from '../hooks/useContent.js';
import { graph, organisation, webSite } from '../lib/structuredData.js';

/** index.html, section for section. */
export default function Home() {
  const { data: page, isError, error, refetch } = usePage('home');
  const { data: services } = useServices();
  const { data: casesResult } = useCases({ limit: 8 });
  const { data: articlesResult } = useArticles({ limit: 3 });
  const { data: lawyers } = useLawyers();
  const { data: testimonials } = useTestimonials();
  const { data: siteData } = useSiteSettings();
  const common = useCommon();
  const heroRef = useParallax(0.5);

  if (isError) return <div className="container py-5"><ErrorState error={error} onRetry={refetch} /></div>;

  const hero = section(page, 'hero');
  const servicesSection = section(page, 'services');
  const recordSection = section(page, 'record');
  const teamSection = section(page, 'team');
  const insightsSection = section(page, 'insights');
  const gallerySection = section(page, 'gallery');
  const words = (hero.items || []).map((i) => i.title).filter(Boolean);
  const cases = casesResult?.data || [];
  const articles = articlesResult?.data || [];

  return (
    <>
      <Seo
        seo={page?.seo}
        path="/"
        jsonLd={siteData?.settings ? graph(organisation(siteData.settings), webSite(siteData.settings)) : null}
      />

      <div
        ref={heroRef}
        className={`hero-wrap js-fullheight${hero.image ? '' : ' pcn-banner-fallback'}`}
        style={backgroundStyle(hero.image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text js-fullheight align-items-center justify-content-start">
            <div className="col-md-6 ftco-animate">
              {hero.subheading && <h2 className="subheading">{hero.subheading}</h2>}
              <h1>
                {hero.heading}{' '}
                {words.length > 0 && <TxtRotate words={words} period={hero.value} />}
              </h1>
              {hero.body && <p className="mb-4">{hero.body}</p>}
              {hero.cta?.label && (
                <p>
                  <SmartLink href={hero.cta.href} className="btn btn-primary mr-md-4 py-2 px-4">
                    {hero.cta.label} <span className="ion-ios-arrow-forward" />
                  </SmartLink>
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
              <div className="heading-section ftco-animate">
                {servicesSection.subheading && <span className="subheading">{servicesSection.subheading}</span>}
                {servicesSection.heading && <h2 className="mb-4">{servicesSection.heading}</h2>}
                {servicesSection.body && <p>{servicesSection.body}</p>}
                {servicesSection.cta?.label && (
                  <p><SmartLink href={servicesSection.cta.href} className="btn btn-primary py-3 px-4">{servicesSection.cta.label}</SmartLink></p>
                )}
              </div>
            </div>
            <div className="col-lg-9 services-wrap px-4 pt-5">
              <div className="row pt-md-3">
                {(services || []).slice(0, 3).map((s) => <ServiceCard service={s} key={s.slug} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutBlock intro={section(page, 'intro')} experience={section(page, 'experience')} />

      {cases.length > 0 && (
        <section className="ftco-section">
          <div className="container">
            <SectionHeading section={recordSection} col="col-md-10" />
            <div className="row">
              <div className="col-md-12">
                <Carousel className="carousel-case" loop label={recordSection.heading}>
                  {cases.map((c) => <div className="item" key={c.slug}><CaseTile item={c} /></div>)}
                </Carousel>
              </div>
              {recordSection.cta?.label && (
                <div className="col-md-12 text-center mt-4">
                  <SmartLink href={recordSection.cta.href} className="btn btn-primary px-5">{recordSection.cta.label}</SmartLink>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {lawyers?.length > 0 && (
        <section className="ftco-section ftco-no-pt">
          <div className="container-fluid px-md-5">
            <SectionHeading section={teamSection} rowClass="mb-5 pb-3" />
            <div className="row">
              {lawyers.slice(0, 4).map((l) => (
                <div className="col-lg-3 col-sm-6" key={l.slug}><FlipCard lawyer={l} /></div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Consultation section={section(page, 'consultation')} />

      {testimonials?.length > 0 && (
        <section className="ftco-section testimony-section">
          <div className="container">
            <SectionHeading section={section(page, 'testimonials')} />
            <div className="row ftco-animate">
              <div className="col-md-12">
                <Carousel className="carousel-testimony" label={section(page, 'testimonials').heading}>
                  {testimonials.map((t) => <div className="item" key={t._id}><TestimonyCard item={t} /></div>)}
                </Carousel>
              </div>
            </div>
          </div>
        </section>
      )}

      <GallerySection heading={gallerySection.heading} subheading={gallerySection.subheading} />

      {articles.length > 0 && (
        <section className="ftco-section bg-light">
          <div className="container">
            <SectionHeading section={insightsSection} rowClass="mb-5 pb-3" h2Class="" />
            <div className="row d-flex">
              {articles.map((a) => <BlogCard article={a} readMore={common.readMore} key={a.slug} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
