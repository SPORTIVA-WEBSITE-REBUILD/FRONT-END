import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import Consultation from '../components/template/Consultation.jsx';
import { usePage, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/**
 * The firm's own account of itself: a lead paragraph, then one titled block per
 * topic. Every word comes from the page in the dashboard (`intro` for the lead,
 * `sections` items for the blocks), so the approved copy is edited there and
 * never in this file.
 */
export default function About() {
  const { data: page } = usePage('about');
  const hero = section(page, 'hero');
  const intro = section(page, 'intro');
  const blocks = (section(page, 'sections').items || []).filter((b) => b.title || b.text);

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/about"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />

      <section className="ftco-section pcn-about">
        <div className="container">
          {intro.body && (
            <div className="pcn-about__lead ftco-animate">
              {intro.subheading && <span className="pcn-about__eyebrow">{intro.subheading}</span>}
              {intro.heading && <h2 className="pcn-about__lead-heading">{intro.heading}</h2>}
              <p className="pcn-about__lead-text">{intro.body}</p>
            </div>
          )}

          {blocks.map((b) => (
            <div className="pcn-about__block ftco-animate" key={b.title || b.text.slice(0, 24)}>
              {b.title && <h2 className="pcn-about__heading">{b.title}</h2>}
              {b.text && <p className="pcn-about__text">{b.text}</p>}
            </div>
          ))}
        </div>
      </section>

      <Consultation section={section(page, 'consultation')} />
      <div className="pcn-about__end" aria-hidden="true" />
    </>
  );
}
