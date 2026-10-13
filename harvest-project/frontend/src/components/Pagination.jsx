import Button from './Button';

/** Works with the `meta` object returned by Laravel's paginate(). */
export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="pagination">
      <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>
        ← Prev
      </Button>
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} records
      </span>
      <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>
        Next →
      </Button>
    </div>
  );
}
