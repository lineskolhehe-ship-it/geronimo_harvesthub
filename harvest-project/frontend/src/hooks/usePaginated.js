import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { parseError } from '../utils/helpers';

/** Fetches a paginated Laravel list and exposes loading / error / reload. */
export default function usePaginated(url, params = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(url, { params: JSON.parse(key) });
      setItems(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [url, key]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, meta, loading, error, reload: load };
}
