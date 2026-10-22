export default function DashboardMessage({ message, compact = false }) {
  return (
    <p
      role="status"
      className={
        compact
          ? 'px-1 py-3 text-center text-[11px] leading-4 text-stone-500'
          : 'px-5 py-8 text-center text-sm text-stone-500'
      }
    >
      {message}
    </p>
  )
}
