import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import AboutBlock from '../components/template/AboutBlock.jsx';
import Consultation from '../components/template/Consultation.jsx';
import Carousel from '../components/template/Carousel.jsx';
import { SectionHeading, TestimonyCard } from '../components/template/cards.jsx';
import { usePage, useTestimonials, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** about.html */
export default function About() {
  const { data: page } = usePage('about');
  const { data: testimonials } = useTestimonials();
  const hero = section(page, 'hero');
  const testimonialSection = section(page, 'testimonials');

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/about"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />
      <AboutBlock intro={section(page, 'intro')} experience={section(page, 'experience')} onAboutPage />
      <Consultation section={section(page, 'consultation')} />
      {testimonials?.length > 0 && (
        <section className="ftco-section testimony-section">
          <div className="container">
            <SectionHeading section={testimonialSection} />
            <div className="row ftco-animate">
              <div className="col-md-12">
                <Carousel className="carousel-testimony" label={testimonialSection.heading}>
                  {testimonials.map((t) => <div className="item" key={t._id}><TestimonyCard item={t} /></div>)}
                </Carousel>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
