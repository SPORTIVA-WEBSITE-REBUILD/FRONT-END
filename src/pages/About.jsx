import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import SmartImage, { backgroundStyle } from '../components/SmartImage.jsx';
import { LoadingCards, LoadingSection } from '../components/states.jsx';
import { Reveal, useCountUp } from '../hooks/useAnimations.jsx';
import { usePage, useLawyers, section } from '../hooks/useContent.js';

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

export default function About() {
  const { data: page, isLoading } = usePage('about');
  const { data: lawyers } = useLawyers();

  const intro = section(page, 'intro');
  const stats = section(page, 'stats');
  const team = section(page, 'team');

  return (
    <>
      <Seo seo={page?.seo} title={page?.title || 'About'} path="/about" />
      <PageHero
        title={intro.heading || 'About'}
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="ftco-section">
        <div className="container">
          {isLoading && <LoadingSection rows={6} />}

          <div className="row d-flex">
            {intro.image && (
              <div className="col-md-6 d-flex">
                <SmartImage media={intro.image} width={800} className="img-fluid" sizes="(max-width: 768px) 100vw, 50vw" priority />
              </div>
            )}
            <div className={`col-md-6 pl-md-5 py-5${intro.image ? '' : ' mx-auto'}`}>
              <Reveal className="heading-section">
                {intro.subheading && <span className="subheading">{intro.subheading}</span>}
                <h2 className="mb-4">{intro.heading}</h2>
                {intro.body && <p>{intro.body}</p>}
                {intro.cta?.label && (
                  <p><Link to={intro.cta.href || '/contact'} className="btn btn-primary py-3 px-4">{intro.cta.label}</Link></p>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

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
              {team.subheading && <span className="subheading">{team.subheading}</span>}
              <h2 className="mb-4">{team.heading || 'The team'}</h2>
              {team.body && <p>{team.body}</p>}
            </div>
          </div>

          {!lawyers && <LoadingCards count={4} col="col-lg-3 col-sm-6" />}
          <div className="row">
            {(lawyers || []).map((l) => (
              <div className="col-lg-3 col-sm-6 mb-4" key={l.slug}>
                {/*
                  The template's own team card: a 400px flip card whose front is
                  a background image with the name laid over it. These exact
                  classnames are what give it its height. The markup here before
                  used classes the stylesheet never defined, so the cards had no
                  height and the photographs were clipped.
                */}
                <div className="block-2 ftco-animate">
                  <div className="flipper">
                    <div
                      className="front"
                      style={{
                        // A neutral ground for a profile with no photograph yet;
                        // the stylesheet's own fallback for .front is lightgreen.
                        backgroundColor: '#2c2f3a',
                        ...(backgroundStyle(l.photo, null, 700, {
                          height: 840, crop: 'fill', gravity: 'faces:auto',
                        }) || {}),
                      }}
                    >
                      <div className="box">
                        <h2>{l.name}</h2>
                        {l.role && <p>{l.role}</p>}
                      </div>
                    </div>

                    <div className="back">
                      <blockquote>
                        <p>
                          {l.role
                            ? `${l.role} at the firm, working across our service areas.`
                            : 'Working across the firm\u2019s service areas.'}
                        </p>
                      </blockquote>
                      <div className="author d-flex">
                        {l.photo && (
                          <div className="image align-self-center">
                            <SmartImage
                              media={l.photo}
                              width={80}
                              height={80}
                              crop="fill"
                              gravity="faces:auto"
                              alt=""
                            />
                          </div>
                        )}
                        <div className="name align-self-center ml-3">
                          <Link to={`/lawyers/${l.slug}`}>{l.name}</Link>
                          {l.role && <span className="position">{l.role}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
