import UserCard from './UserCard.jsx'

export default function UserList({ users }) {
  return <section aria-label="Usuarios registrados" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{users.map((user) => <UserCard key={user.id} user={user} />)}</section>
}
