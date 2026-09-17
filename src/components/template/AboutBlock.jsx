import { backgroundStyle } from '../SmartImage.jsx';
import VideoPopup from './VideoPopup.jsx';
import Tabs from './Tabs.jsx';
import { CountUp } from '../../hooks/useAnimations.jsx';
import { useCommon } from '../../hooks/useContent.js';

/**
 * The about block: image with the video play button, heading, text, the
 * mission/vision/value tabs and the years-of-experience counter. On the About
 * page the text column has extra vertical padding (`py-md-5`).
 */
export default function AboutBlock({ intro, experience, onAboutPage = false }) {
  const common = useCommon();
  return (
    <section className="ftco-section ftco-no-pt ftco-no-pb">
      <div className="container">
        <div className="row d-flex">
          <div className="col-md-6 d-flex">
            <div
              className={`img img-video d-flex align-self-stretch align-items-center justify-content-center justify-content-md-end${intro.image ? '' : ' pcn-banner-fallback'}`}
              style={backgroundStyle(intro.image, null, 1000, { height: 1000, crop: 'fill', gravity: 'auto' })}
            >
              <VideoPopup href={intro.video} closeLabel={common.close} playLabel={common.playVideo} />
            </div>
          </div>
          <div className={`col-md-6 pl-md-5${onAboutPage ? ' py-md-5' : ''}`}>
            <div className="row justify-content-start pt-3 pb-3">
              <div className="col-md-12 heading-section ftco-animate">
                {intro.subheading && <span className="subheading">{intro.subheading}</span>}
                {intro.heading && <h2 className="mb-4">{intro.heading}</h2>}
                {intro.body && <p>{intro.body}</p>}
                <Tabs items={(intro.items || []).filter((t) => t.title)} />
                {experience?.value && (
                  <div className="years d-flex mt-4 mt-md-5">
                    <h4>
                      <CountUp value={experience.value} />
                      <span>{experience.heading}</span>
                    </h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
