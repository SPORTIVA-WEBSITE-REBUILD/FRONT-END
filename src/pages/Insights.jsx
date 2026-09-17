import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Pagination from '../components/Pagination.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import { BlogCard } from '../components/template/cards.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useArticles, useCommon, usePage, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** blog.html. The sidebar's search, category and tag links land here. */
export default function Insights() {
  const [params] = useSearchParams();
  const { data: page } = usePage('insights');
  const common = useCommon();
  const filters = {
    q: params.get('q') || '',
    tag: params.get('tag') || '',
    category: params.get('category') || '',
    page: Number(params.get('page')) || 1,
    limit: 9,
  };
  const { data: result, isLoading, isError, error, refetch } = useArticles(filters);

  const hero = section(page, 'hero');
  const list = section(page, 'list').labels || {};
  const articles = result?.data || [];
  const meta = result?.meta;

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/insights"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />

      <section className="ftco-section bg-light">
        <div className="container">
          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && !result && <LoadingCards count={6} />}
          {result && articles.length === 0 && <EmptyState title={list.emptyTitle} message={list.emptyText} />}

          <div className="row d-flex">
            {articles.map((a) => <BlogCard article={a} readMore={common.readMore} key={a.slug} />)}
          </div>

          {meta && <Pagination page={meta.page} pages={meta.pages} />}
        </div>
      </section>
    </>
  );
}
