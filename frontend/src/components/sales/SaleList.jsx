import SaleCard from './SaleCard.jsx'
import { createEmployeeSaleSequence } from '../../utils/saleRules.js'

export default function SaleList({ sales, user }) {
  const employeeSequence = user?.role === 'EMPLOYEE'
    ? createEmployeeSaleSequence(sales, user.userId)
    : null

  return <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">{sales.map((sale) => <li key={sale.id}><SaleCard sale={sale} user={user} employeeNumber={employeeSequence?.get(String(sale.id))} /></li>)}</ul>
}
