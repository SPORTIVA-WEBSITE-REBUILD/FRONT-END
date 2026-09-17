import { useEffect, useState } from 'react';

/** The fullscreen spinner (#ftco-loader), removed straight after load. */
export default function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(false), 1);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div id="ftco-loader" className={`${show ? 'show ' : ''}fullscreen`} aria-hidden="true">
      <svg className="circular" width="48px" height="48px">
        <circle className="path-bg" cx="24" cy="24" r="22" fill="none" strokeWidth="4" stroke="#eeeeee" />
        <circle className="path" cx="24" cy="24" r="22" fill="none" strokeWidth="4" strokeMiterlimit="10" stroke="#F96D00" />
      </svg>
    </div>
  );
}
