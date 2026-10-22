export function getRootDestination(isAuthenticated) {
  return isAuthenticated ? '/dashboard' : '/login'
}
