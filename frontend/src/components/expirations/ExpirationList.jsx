import ExpirationCard from './ExpirationCard.jsx'

export default function ExpirationList({ batches, productById }) {
  return <section aria-label="Lotes por fecha de vencimiento" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {batches.map((batch) => <ExpirationCard key={batch.id} batch={batch} product={productById.get(String(batch.productId))} />)}
  </section>
}
