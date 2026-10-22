import { NavLink } from 'react-router-dom'

export default function NavigationLink({ item, variant = 'sidebar', sectionActive = false }) {
  const Icon = item.icon
  const isBottom = variant === 'bottom'

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => {
        const active = isActive || sectionActive
        if (isBottom) {
          return `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium ${active ? 'bg-red-900/5 text-red-900' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}`
        }
        return `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-[#dac5a6] ${active ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-[#e3d1be] hover:bg-white/5 hover:text-white'}`
      }}
    >
      <Icon size={isBottom ? 21 : 19} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}
