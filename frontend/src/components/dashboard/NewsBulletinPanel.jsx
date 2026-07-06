import { useState } from 'react';

import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Button from '../ui/Button.jsx';
import useInfiniteList from '../../hooks/useInfiniteList.js';
import newsBulletinApiService from '../../api/services/newsBulletinApiService.js';
import { formatDateTime } from '../../utils/formatDate.js';

import NewsBulletinModal from './NewsBulletinModal.jsx';

const PAGE_SIZE = 5;
// Trigger the next page a little before the scroll container's actual
// bottom, so the next batch is loading before the user hits the edge.
const LOAD_MORE_THRESHOLD_PX = 80;

/**
 * Dashboard's right-hand News Bulletin panel: latest-first, lazily
 * loaded on scroll (see hooks/useInfiniteList.js), each item clamped
 * to 3 lines with a "View more" full-detail modal.
 */
export default function NewsBulletinPanel() {
  const { items, isLoading, isLoadingMore, hasMore, loadMore, error } = useInfiniteList(
    newsBulletinApiService,
    { limit: PAGE_SIZE, params: { sort: '-publishedAt' } },
  );
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD_PX) {
      loadMore();
    }
  };

  return (
    <Card title="News Bulletin" className="flex h-full flex-col">
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {!isLoading && error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && items.length === 0 && <EmptyState title="No news yet" />}

      {!isLoading && items.length > 0 && (
        <div onScroll={handleScroll} className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
          {items.map((bulletin) => (
            <article key={bulletin._id} className="border-b border-slate-100 pb-3 last:border-0">
              <p className="text-xs font-medium text-slate-400">{formatDateTime(bulletin.publishedAt)}</p>
              <h4 className="mt-0.5 text-sm font-semibold text-slate-900">{bulletin.title}</h4>
              <p className="mt-1 line-clamp-3 text-sm text-slate-600">{bulletin.description}</p>
              <button
                type="button"
                onClick={() => setSelectedBulletin(bulletin)}
                className="mt-1 text-xs font-medium text-blue-600 hover:underline"
              >
                View more
              </button>
            </article>
          ))}

          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Spinner size="sm" />
            </div>
          )}

          {!hasMore && !isLoadingMore && (
            <p className="pt-1 text-center text-xs text-slate-400">You&apos;re all caught up.</p>
          )}
        </div>
      )}

      {hasMore && !isLoadingMore && (
        <Button variant="ghost" size="sm" className="mt-2 self-center" onClick={loadMore}>
          Load more
        </Button>
      )}

      <NewsBulletinModal bulletin={selectedBulletin} onClose={() => setSelectedBulletin(null)} />
    </Card>
  );
}
