import ProductCard from './ProductCard.jsx'

export default function ProductList({ products }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {products.map((product) => <li key={product.id} className="min-w-0"><ProductCard product={product} /></li>)}
    </ul>
  )
}
