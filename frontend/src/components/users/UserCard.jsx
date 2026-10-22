import { ChevronRight, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import RoleBadge from './RoleBadge.jsx'
import ActiveStatus from './ActiveStatus.jsx'

export default function UserCard({ user }) {
  return <Link to={`/users/${user.id}/edit`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 transition-colors hover:border-[#7a2638]/40 hover:bg-[#fffdf9] sm:p-4">
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f0e6d8] text-[#7a2638]"><UserRound size={22} strokeWidth={1.7} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-stone-900 sm:text-base">{user.name}</span><span className="mt-0.5 block truncate text-xs text-stone-500 sm:text-sm">{user.email}</span><span className="mt-2 flex flex-wrap gap-1.5"><RoleBadge role={user.roleName} /><ActiveStatus active={user.active} /></span></span>
    <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-stone-400" />
  </Link>
}
