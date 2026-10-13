export const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Root Crops', 'Legumes', 'Herbs & Spices'];
export const HARVEST_STATUSES = ['planned', 'harvested', 'listed'];
export const LISTING_STATUSES = ['available', 'sold_out'];
export const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
export const ROLES = ['admin', 'farmer', 'buyer'];

export const peso = (n) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(n) || 0);

export const label = (s) =>
  String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Pulls a readable message and per-field errors (HTTP 422) out of an Axios error. */
export function parseError(err) {
  const data = err.response?.data;
  return {
    message: data?.message || (err.response ? 'Something went wrong.' : 'Cannot reach the server.'),
    fields: err.response?.status === 422 ? data?.errors || {} : {},
  };
}

/** Laravel returns arrays of messages per field; the UI shows the first one. */
export const firstError = (fields, name) => fields?.[name]?.[0];
