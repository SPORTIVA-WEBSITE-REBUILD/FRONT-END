import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import SmartLink from '../components/template/SmartLink.jsx';
import { usePage, section } from '../hooks/useContent.js';

export default function NotFound() {
  const { data: page } = usePage('not-found');
  const hero = section(page, 'hero');
  const body = section(page, 'body');
  const links = (body.items || []).filter((i) => i.title && i.href);

  return (
    <>
      <Seo title={hero.heading || page?.title} seo={{ noIndex: true }} />
      <PageBanner title={hero.heading || page?.title} crumb={hero.subheading} image={hero.image} />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center heading-section ftco-animate">
              {body.heading && <h2 className="mb-4">{body.heading}</h2>}
              {body.body && <p className="mb-5">{body.body}</p>}
              {links.length > 0 && (
                <p>
                  {links.map((l) => (
                    <SmartLink key={`${l.href}-${l.title}`} href={l.href} className="btn btn-primary py-3 px-4 mr-2 mb-2">{l.title}</SmartLink>
                  ))}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
