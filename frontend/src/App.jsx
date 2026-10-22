import AppRouter from './routes/AppRouter.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import SaleDraftProvider from './context/SaleDraftProvider.jsx'

export default function App() {
  return (
    <AuthProvider>
      <SaleDraftProvider>
        <AppRouter />
      </SaleDraftProvider>
    </AuthProvider>
  )
}
