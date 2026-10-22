const inputStyle = 'min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-800 focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/10 disabled:bg-stone-50 disabled:text-stone-600'

export default function ProductFormField({ name, label, value, onChange, error, multiline = false, ...props }) {
  const Input = multiline ? 'textarea' : 'input'
  return (
    <div>
      <label htmlFor={`product-${name}`} className="mb-2 block text-sm font-medium text-stone-700">{label}</label>
      <Input id={`product-${name}`} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `product-${name}-error` : undefined} className={inputStyle} {...props} />
      {error && <p id={`product-${name}-error`} className="mt-2 text-xs leading-5 text-red-900">{error}</p>}
    </div>
  )
}
