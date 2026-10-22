export default function EmptyList({ message = 'No hay registros para mostrar.' }) {
  return <p className="px-5 py-8 text-center text-sm text-stone-500">{message}</p>
}
