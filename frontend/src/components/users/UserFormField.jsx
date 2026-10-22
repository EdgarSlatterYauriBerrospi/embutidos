const inputClass = 'min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-800 outline-none focus:border-[#7a2638] focus:ring-2 focus:ring-[#7a2638]/10 disabled:bg-stone-50'

export default function UserFormField({ name, label, value, onChange, error, trailing, ...props }) {
  return <div><label htmlFor={`user-${name}`} className="mb-2 block text-sm font-medium text-stone-700">{label}</label><div className="relative"><input id={`user-${name}`} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `user-${name}-error` : undefined} className={`${inputClass} ${trailing ? 'pr-14' : ''}`} {...props} />{trailing && <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>}</div>{error && <p id={`user-${name}-error`} className="mt-2 text-xs text-red-900">{error}</p>}</div>
}
