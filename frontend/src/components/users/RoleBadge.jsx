export default function RoleBadge({ role }) {
  const style = role === 'ADMIN' ? 'bg-[#7a2638]/10 text-[#7a2638]' : 'bg-[#f0e6d8] text-[#684735]'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{role}</span>
}
