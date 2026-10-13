/** Controlled input / select / textarea with an inline error message (client or 422 server error). */
export default function FormInput({ label, name, as = 'input', error, options, children, ...props }) {
  const common = { id: name, name, className: error ? 'invalid' : '', ...props };
  let field;

  if (as === 'select') {
    field = (
      <select {...common}>
        {children ||
          options?.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
      </select>
    );
  } else if (as === 'textarea') {
    field = <textarea rows={3} {...common} />;
  } else {
    field = <input {...common} />;
  }

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {field}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
