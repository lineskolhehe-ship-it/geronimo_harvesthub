import Spinner from './Spinner';

/**
 * columns: [{ header, render: (row) => node }]
 * Shows a spinner while loading and an empty-state message when there are no rows.
 */
export default function DataTable({ columns, rows, loading, emptyText = 'No records found.' }) {
  if (loading) return <Spinner />;
  if (!rows.length) return <div className="empty">{emptyText}</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.header} data-label={c.header}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
