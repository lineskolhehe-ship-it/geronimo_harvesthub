export default function Button({ variant = 'primary', size, loading, disabled, children, ...props }) {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}`;
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
