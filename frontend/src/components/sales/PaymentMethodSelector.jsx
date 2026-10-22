import { Banknote, Smartphone } from 'lucide-react'
import { PAYMENT_METHODS, paymentMethodLabel } from '../../utils/saleRules.js'

const icons = { CASH: Banknote, YAPE_PLIN: Smartphone }
export default function PaymentMethodSelector({ value, onChange, disabled }) {
  return <fieldset disabled={disabled}><legend className="mb-3 text-sm font-semibold">Método de pago</legend><div className="grid grid-cols-2 gap-3">{PAYMENT_METHODS.map((method) => { const Icon = icons[method]; return <label key={method} className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${value === method ? 'border-[#7a2638] bg-red-50 text-[#7a2638]' : 'border-stone-200 bg-white text-stone-600'}`}><input type="radio" name="paymentMethod" value={method} checked={value === method} onChange={() => onChange(method)} className="sr-only" /><Icon size={22} aria-hidden="true" />{paymentMethodLabel(method)}</label> })}</div></fieldset>
}
