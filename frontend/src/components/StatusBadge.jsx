import { label } from '../utils/helpers';

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{label(status)}</span>;
}
