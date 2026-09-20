import { useEffect, useState } from 'react';
import Seo from '../components/Seo.jsx';
import { backgroundStyle } from '../components/SmartImage.jsx';
import { ErrorState } from '../components/states.jsx';
import GallerySection from '../components/GallerySection.jsx';
import Carousel from '../components/template/Carousel.jsx';
import SmartLink from '../components/template/SmartLink.jsx';
import AboutBlock from '../components/template/AboutBlock.jsx';
import Consultation from '../components/template/Consultation.jsx';
import {
  BlogCard, CaseCard, SectionHeading, ServiceCard, TeamCard, TestimonyCard,
} from '../components/template/cards.jsx';
import { useParallax } from '../hooks/useAnimations.jsx';
import {
  usePage, useServices, useCases, useArticles, useLawyers, useTestimonials,
  useSiteSettings, useCommon, section,
} from '../hooks/useContent.js';
import { graph, organisation, webSite } from '../lib/structuredData.js';

/**
 * Added to the hold to get the full cadence. It covers the phrase sliding in
 * (0.6s) with a little room after it lands; the background cross-fade runs
 * underneath and does not need to finish before the next hold starts counting.
 *
 * With the seeded hold of 2000ms this puts a slide on screen for 3.2s. Raising
 * it past about 1500 makes the hero feel like it is waiting rather than moving.
 */
const SLIDE_CYCLE_MS = 1200;

/** index.html, section for section. */
export default function Home() {
  const { data: page, isError, error, refetch } = usePage('home');
  const { data: services } = useServices();
  const { data: casesResult } = useCases({ limit: 3 });
  const { data: articlesResult } = useArticles({ limit: 3 });
  const { data: lawyers } = useLawyers();
  const { data: testimonials } = useTestimonials();
  const { data: siteData } = useSiteSettings();
  const common = useCommon();
  const heroRef = useParallax(0.5);
  const [wordIndex, setWordIndex] = useState(0);
  // Hold the photographs back until after the first paint.
  const [painted, setPainted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPainted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hero = section(page, 'hero');
  const wordItems = (hero.items || []).filter((i) => i.title);
  const slideCount = wordItems.length;
  // `value` is the dashboard-editable hold, as it was for the typewriter.
  const holdMs = Number.parseInt(hero.value, 10) || 2000;

  /*
   * Advancing the slides used to be a side effect of the typewriter finishing a
   * word. With the typewriter gone it is an explicit timer: hold, then change
   * the phrase and cross-fade the background behind it.
   */
  useEffect(() => {
    if (slideCount < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(
      () => setWordIndex((i) => (i + 1) % slideCount),
      holdMs + SLIDE_CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [slideCount, holdMs]);

  if (isError) return <div className="container py-5"><ErrorState error={error} onRetry={refetch} /></div>;

  const servicesSection = section(page, 'services');
  const recordSection = section(page, 'record');
  const teamSection = section(page, 'team');
  const insightsSection = section(page, 'insights');
  const gallerySection = section(page, 'gallery');
  // A background per slide, cross-faded as the phrase changes.
  // Reduced motion pins the hero to the first slide and skips the cross-fade.
  const reduceMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeSlide = reduceMotion ? 0 : wordIndex;
  const phrase = wordItems[activeSlide]?.title;
  // The first slide is the map, and its artwork doubles as the hero's own
  // background so the parallax hook has something to drift.
  const mapItem = wordItems[0];
  const cases = casesResult?.data || [];
  // Total published cases, straight off the archive query the record section
  // already runs — the "Why the firm" record tab prints it rather than a
  // figure typed into the copy.
  const recordCount = casesResult?.meta?.total ?? 0;
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
        className="hero-wrap pcn-hero"
        // The map carries the hero's own background too, so useParallax — which
        // drifts backgroundPositionY — has something to move.
        style={backgroundStyle(mapItem?.image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
        data-stellar-background-ratio="0.5"
      >
        {wordItems.map((item, i) => {
          const isActive = i === activeSlide;
          const isMap = i === 0;
          // Photographs wait for first paint so they never compete with the
          // headline for the opening frame, and never load at all when the
          // reader has asked for reduced motion (first slide only).
          if (!isMap && (!painted || reduceMotion)) return null;
          return (
            <div
              key={item.title}
              className={`pcn-hero-scene${isMap ? ' pcn-hero-scene--map' : ''}${isActive ? ' is-active' : ''}`}
              style={backgroundStyle(item.image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
              aria-hidden="true"
            />
          );
        })}
        {/*
          No .overlay element. The photographs already carry their own
          left-to-right navy scrim, and the map slide's scrim is the third of
          the light layers painted inside .pcn-hero-scene--map — it has to live
          in the transformed layer so it drifts with the artwork rather than
          sitting still over a moving map.
        */}
        <div className="container">
          <div className="row no-gutters slider-text align-items-center justify-content-start">
            <div className="col-md-6 ftco-animate">
              {hero.subheading && <h2 className="subheading">{hero.subheading}</h2>}
              <h1>
                {hero.heading}{' '}
                {phrase && (
                  // Keyed on the slide so React remounts the span and the
                  // slide-in replays on every change.
                  <span key={activeSlide} className="pcn-hero-phrase">{phrase}</span>
                )}
              </h1>
              {hero.body && <p className="mb-4">{hero.body}</p>}
              {hero.cta?.label && (
                <p>
                  <SmartLink href={hero.cta.href} className="btn btn-primary mr-md-4 py-2 px-4">
                    {hero.cta.label}
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
                  <p><SmartLink href={servicesSection.cta.href} className="btn btn-primary pcn-btn--sm">{servicesSection.cta.label}</SmartLink></p>
                )}
              </div>
            </div>
            <div className="col-lg-9 services-wrap px-4 pt-5">
              <div className="row pt-md-3">
                {(services || []).slice(0, 4).map((s) => <ServiceCard service={s} key={s.slug} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutBlock intro={section(page, 'intro')} recordCount={recordCount} />

      {cases.length > 0 && (
        <section className="ftco-section">
          <div className="container">
            {/*
              Centred, matching Team, Testimonials and Insights — the shared
              SectionHeading component rather than the bespoke left-aligned
              .heading-section Services and "Why the firm" use.
            */}
            <SectionHeading section={recordSection} rowClass="mb-4" h2Class="mb-0" />

            {/* Exactly three, ordered by year descending — see useCases below. */}
            <div className="pcn-case-grid">
              {cases.map((c) => <CaseCard item={c} key={c.slug} />)}
            </div>

            {recordSection.cta?.label && (
              <p className="text-center mt-4 mb-0">
                <SmartLink href={recordSection.cta.href} className="btn btn-primary px-5">{recordSection.cta.label}</SmartLink>
              </p>
            )}
          </div>
        </section>
      )}

      {lawyers?.length > 0 && (
        <section className="ftco-section ftco-no-pt">
          <div className="container-fluid px-md-5">
            <SectionHeading section={teamSection} rowClass="mb-5 pb-3" />
            <div className="row justify-content-center">
              {lawyers.slice(0, 3).map((l) => (
                <div className="col-lg-4 col-sm-6" key={l.slug}><TeamCard lawyer={l} /></div>
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

      <GallerySection
        heading={gallerySection.heading}
        subheading={gallerySection.subheading}
        limit={3}
        viewAllHref="/gallery"
        viewAllLabel={common.viewAll || 'View all'}
      />

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
