import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout.jsx';

// Each route is its own chunk, so a visitor reading one article never downloads
// the case archive's code (CLAUDE.md section 11).
const Home = lazy(() => import('./pages/Home.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const Record = lazy(() => import('./pages/Record.jsx'));
const CaseDetail = lazy(() => import('./pages/CaseDetail.jsx'));
const Insights = lazy(() => import('./pages/Insights.jsx'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail.jsx'));
const LawyerDetail = lazy(() => import('./pages/LawyerDetail.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const VacancyDetail = lazy(() => import('./pages/VacancyDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="record" element={<Record />} />
        <Route path="record/:slug" element={<CaseDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="insights/:slug" element={<ArticleDetail />} />
        <Route path="lawyers/:slug" element={<LawyerDetail />} />
        <Route path="careers" element={<Careers />} />
        <Route path="careers/:slug" element={<VacancyDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
