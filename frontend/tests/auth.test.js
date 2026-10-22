import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AUTH_STORAGE_KEY, clearAuthSession, restoreAuthSession, saveAuthSession } from '../src/services/authSession.js'
import { canManageProducts, emptyProductForm, filterProducts, isLowStock, toProductRequest, validateProduct } from '../src/utils/productRules.js'
import { addCartProduct, calculateCartTotal, canCancelSales, createEmployeeSaleSequence, removeCartProduct, revalidateSaleLines, setCartQuantity, toSaleRequest, validateSalePayment } from '../src/utils/saleRules.js'
import { getSaleError } from '../src/utils/saleError.js'
import { batchStatus, countLowStock, filterStockProducts, movementRegistrant, sortBatchesByExpiration, MOVEMENT_TYPES } from '../src/utils/stockRules.js'
import { availablePurchaseProducts, availableSuppliers, canManagePurchases, purchaseTotal, toPurchaseRequest, validatePurchase } from '../src/utils/purchaseRules.js'
import { canManageSuppliers, emptySupplierForm, filterSuppliers, toSupplierRequest, validateSupplier } from '../src/utils/supplierRules.js'
import { daysRemainingLabel, daysUntilExpiration, expirationStatus, filterExpirationBatches, localDateIso, localDatePlusDays } from '../src/utils/expirationRules.js'
import { canManageUsers, emptyUserForm, filterUsers, toUserForm, toUserRequest, validateUser } from '../src/utils/userRules.js'

// Replace only the transport in tests; production always uses the real Axios client.
const server = await createServer({
  configFile: false,
  cacheDir: 'node_modules/.vite-auth-tests',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
})
const { default: api } = await server.ssrLoadModule('/src/services/api.js')
const { login } = await server.ssrLoadModule('/src/services/authService.js')
const { getLoginErrorMessage } = await server.ssrLoadModule('/src/utils/loginError.js')
const { default: AuthProvider } = await server.ssrLoadModule('/src/context/AuthProvider.jsx')
const { default: useAuth } = await server.ssrLoadModule('/src/hooks/useAuth.js')
const { default: ProtectedRoute } = await server.ssrLoadModule('/src/routes/ProtectedRoute.jsx')
const { default: GuestRoute } = await server.ssrLoadModule('/src/routes/GuestRoute.jsx')
const productService = await server.ssrLoadModule('/src/services/productService.js')
const { default: ProductForm } = await server.ssrLoadModule('/src/components/products/ProductForm.jsx')
const { getRootDestination } = await server.ssrLoadModule('/src/routes/rootDestination.js')
const saleService = await server.ssrLoadModule('/src/services/saleService.js')
const notificationService = await server.ssrLoadModule('/src/services/notificationService.js')
const batchService = await server.ssrLoadModule('/src/services/productBatchService.js')
const movementService = await server.ssrLoadModule('/src/services/stockMovementService.js')
const userService = await server.ssrLoadModule('/src/services/userService.js')
const { default: BatchCard } = await server.ssrLoadModule('/src/components/stock/BatchCard.jsx')
const { default: MovementCard } = await server.ssrLoadModule('/src/components/stock/MovementCard.jsx')
const { formatStockDate } = await server.ssrLoadModule('/src/utils/stockFormatters.js')
const purchaseService = await server.ssrLoadModule('/src/services/purchaseService.js')
const supplierService = await server.ssrLoadModule('/src/services/supplierService.js')
const { default: NewPurchasePage } = await server.ssrLoadModule('/src/pages/NewPurchasePage.jsx')
const { default: SuppliersPage } = await server.ssrLoadModule('/src/pages/SuppliersPage.jsx')
const { default: SupplierEditorPage } = await server.ssrLoadModule('/src/pages/SupplierEditorPage.jsx')
const { default: ExpirationCard } = await server.ssrLoadModule('/src/components/expirations/ExpirationCard.jsx')
const { default: AdminRoute } = await server.ssrLoadModule('/src/routes/AdminRoute.jsx')
const { default: MorePage } = await server.ssrLoadModule('/src/pages/MorePage.jsx')
const { default: UserForm } = await server.ssrLoadModule('/src/components/users/UserForm.jsx')
const { visibleNavigation, mainNavigation } = await server.ssrLoadModule('/src/routes/navigation.js')
const originalAdapter = api.defaults.adapter
const originalWindow = globalThis.window

function memoryStorage() {
  const entries = new Map()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  }
}

const response = { token: 'test-token', userId: 42, name: 'Test user', email: 'test@example.test', role: 'SELLER' }
const session = { token: response.token, user: { userId: 42, name: response.name, email: response.email, role: response.role } }

beforeEach(() => {
  globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() }
  api.defaults.adapter = originalAdapter
})

after(async () => {
  api.defaults.adapter = originalAdapter
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
  await server.close()
})

test('login posts the exact backend endpoint and maps its flat response', async () => {
  api.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post')
    assert.equal(config.url, '/api/auth/login')
    assert.deepEqual(JSON.parse(config.data), { email: 'test@example.test', password: ' unchanged ' })
    return { data: response, status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await login(' test@example.test ', ' unchanged '), session)
})

test('malformed successful responses are rejected before persistence', async () => {
  api.defaults.adapter = async (config) => ({ data: { token: 'test-token' }, status: 200, statusText: 'OK', headers: {}, config })
  await assert.rejects(login('test@example.test', 'password'), /respuesta.*no es válida/)
  assert.equal(window.localStorage.getItem(AUTH_STORAGE_KEY), null)
  assert.equal(window.sessionStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('backend failure propagates without writing a session', async () => {
  const failure = { isAxiosError: true, response: { status: 401 } }
  api.defaults.adapter = async () => { throw failure }
  await assert.rejects(login('test@example.test', 'password'), (error) => error === failure)
  assert.equal(window.localStorage.getItem(AUTH_STORAGE_KEY), null)
  assert.equal(window.sessionStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('remember me persists token and user only in localStorage and clears old session', () => {
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, 'old-session')
  saveAuthSession(session, true)
  assert.deepEqual(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY)), session)
  assert.equal(window.sessionStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('unchecked remember me uses sessionStorage and removes a previously remembered login', () => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, 'old-session')
  saveAuthSession(session, false)
  assert.deepEqual(JSON.parse(window.sessionStorage.getItem(AUTH_STORAGE_KEY)), session)
  assert.equal(window.localStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('storage errors surface instead of reporting login success', () => {
  window.sessionStorage.setItem = () => { throw new Error('Quota exceeded') }
  assert.throws(() => saveAuthSession(session, false), /No se pudo guardar la sesión/)
})

test('startup restores authentication from either store without rewriting it', () => {
  assert.equal(restoreAuthSession(), null)
  saveAuthSession(session, true)
  assert.deepEqual(restoreAuthSession(), session)
  saveAuthSession(session, false)
  assert.deepEqual(restoreAuthSession(), session)
})

test('startup discards corrupt or incomplete sessions and falls back to the other store', () => {
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, '{invalid JSON')
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  assert.deepEqual(restoreAuthSession(), session)
  assert.equal(window.sessionStorage.getItem(AUTH_STORAGE_KEY), null)
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'token', user: {} }))
  assert.equal(restoreAuthSession(), null)
  assert.equal(window.localStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('startup tolerates blocked storage and prioritizes the tab session', () => {
  window.localStorage.getItem = () => { throw new Error('Access denied') }
  assert.equal(restoreAuthSession(), null)
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  assert.deepEqual(restoreAuthSession(), session)
})

test('logout clears both stores without affecting unrelated values', () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    storage.setItem('unrelated', 'keep')
  }
  clearAuthSession()
  assert.equal(restoreAuthSession(), null)
  for (const storage of [window.localStorage, window.sessionStorage]) {
    assert.equal(storage.getItem(AUTH_STORAGE_KEY), null)
    assert.equal(storage.getItem('unrelated'), 'keep')
  }
})

test('logout attempts both stores even if one cannot be cleared', () => {
  window.localStorage.removeItem = () => { throw new Error('Access denied') }
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  assert.throws(clearAuthSession, /No se pudo borrar/)
  assert.equal(window.sessionStorage.getItem(AUTH_STORAGE_KEY), null)
})

test('AuthProvider exposes restored state and authentication operations on the first render', () => {
  function Probe() {
    const auth = useAuth()
    assert.equal(typeof auth.login, 'function')
    assert.equal(typeof auth.logout, 'function')
    return createElement('span', null, JSON.stringify({ user: auth.user, token: auth.token, isAuthenticated: auth.isAuthenticated }))
  }
  const render = () => renderToString(createElement(AuthProvider, null, createElement(Probe)))
  assert.match(render(), /isAuthenticated.*false/)
  saveAuthSession(session, false)
  assert.match(render(), /isAuthenticated.*true/)
  assert.match(render(), /test-token/)
})

test('protected route renders its nested outlet with restored authentication', () => {
  saveAuthSession(session, true)
  const tree = createElement(AuthProvider, null,
    createElement(MemoryRouter, { initialEntries: ['/dashboard'] },
      createElement(Routes, null,
        createElement(Route, { element: createElement(ProtectedRoute) },
          createElement(Route, { path: '/dashboard', element: createElement('h1', null, 'Protected content') })),
      )))
  assert.match(renderToString(tree), /Protected content/)
})

test('guest route renders the login outlet without authentication', () => {
  const tree = createElement(AuthProvider, null,
    createElement(MemoryRouter, { initialEntries: ['/login'] },
      createElement(Routes, null,
        createElement(Route, { element: createElement(GuestRoute) },
          createElement(Route, { path: '/login', element: createElement('h1', null, 'Login content') })),
      )))
  assert.match(renderToString(tree), /Login content/)
})

test('root destination follows the shared authentication state', () => {
  assert.equal(getRootDestination(false), '/login')
  assert.equal(getRootDestination(true), '/dashboard')
})

test('login failures have clear Spanish messages without leaking server details', () => {
  const httpError = (status) => ({ isAxiosError: true, response: { status, data: { message: 'internal secret' } } })
  assert.match(getLoginErrorMessage(httpError(401)), /incorrectos/)
  assert.match(getLoginErrorMessage(httpError(403)), /permiso/)
  assert.match(getLoginErrorMessage(httpError(400)), /Revisa/)
  assert.match(getLoginErrorMessage(httpError(429)), /Demasiados intentos/)
  assert.match(getLoginErrorMessage(httpError(500)), /servicio/)
  assert.match(getLoginErrorMessage({ isAxiosError: true }), /servicio/)
  assert.match(getLoginErrorMessage({ isAxiosError: true, code: 'ECONNABORTED' }), /tardó demasiado/)
  assert.equal(getLoginErrorMessage(new Error('No se pudo guardar la sesión.')), 'No se pudo guardar la sesión.')
})

test('product services use the exact Spring Boot paths, catalog-only payload, and saved JWT', async () => {
  saveAuthSession(session, false)
  const values = { name: ' Product ', description: ' Description ', price: '12.50', stock: '0', minimumStock: '3', imageUrl: '', active: false, category: 'unsupported' }
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization'), data: config.data && JSON.parse(config.data) })
    return { data: config.url === '/api/products' && config.method === 'get' ? [] : { id: 7 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await productService.getAllProducts(), [])
  await productService.getProductById(7)
  await productService.createProduct(values)
  await productService.updateProduct(7, values)
  await productService.deactivateProduct(7)
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
    ['get', '/api/products'], ['get', '/api/products/7'], ['post', '/api/products'],
    ['put', '/api/products/7'], ['patch', '/api/products/7/deactivate'],
  ])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
  const payload = { name: 'Product', description: 'Description', price: '12.50', minimumStock: 3, imageUrl: null }
  assert.deepEqual(requests[2].data, payload)
  assert.deepEqual(requests[3].data, payload)
  assert.equal(requests[4].data, undefined)
})

test('Axios stops attaching JWT after logout and does not attach it to login', async () => {
  saveAuthSession(session, true)
  api.defaults.adapter = async (config) => {
    assert.equal(config.headers.get('Authorization'), undefined)
    return { data: response, status: 200, statusText: 'OK', headers: {}, config }
  }
  await login('test@example.test', 'password')
  clearAuthSession()
  await productService.getProductById(7)
})

test('product validation matches DTO constraints and whitelist omits stock and unsupported fields', () => {
  const valid = { ...emptyProductForm, name: 'Product', price: '0.01', minimumStock: '0' }
  assert.deepEqual(validateProduct(valid), {})
  assert.equal(validateProduct({ ...valid, price: '0' }).price !== undefined, true)
  assert.ok(validateProduct({ ...valid, price: '1.234' }).price)
  assert.ok(validateProduct({ ...valid, price: '10000000000' }).price)
  assert.ok(validateProduct({ ...valid, minimumStock: '1.5' }).minimumStock)
  assert.ok(validateProduct({ ...valid, minimumStock: '2147483648' }).minimumStock)
  assert.ok(validateProduct({ ...valid, name: ' ' }).name)
  assert.ok(validateProduct({ ...valid, imageUrl: 'javascript:alert(1)' }).imageUrl)
  assert.equal('active' in toProductRequest({ ...valid, active: false }), false)
  assert.equal('stock' in toProductRequest({ ...valid, stock: 999 }), false)
})

test('stock badge includes equality; search is accent-insensitive; only ADMIN may manage', () => {
  assert.equal(isLowStock({ stock: 5, minimumStock: 5 }), true)
  assert.equal(isLowStock({ stock: 6, minimumStock: 5 }), false)
  assert.equal(canManageProducts({ role: 'EMPLOYEE' }), false)
  assert.equal(canManageProducts({ role: 'ADMIN' }), true)
  assert.equal(canManageProducts(null), false)
  const products = [{ name: 'Jamón', description: 'Artesanal' }, { name: 'Chorizo', description: null }]
  assert.deepEqual(filterProducts(products, ' jamon '), [products[0]])
})

test('employee product form is read-only with no mutation actions or current-stock input', () => {
  const editor = { values: { ...emptyProductForm, name: 'Product', price: '12.50', minimumStock: '3' }, errors: {}, active: true, busy: false, canEdit: false }
  const html = renderToString(createElement(MemoryRouter, null, createElement(ProductForm, { editor, isEditing: true })))
  assert.match(html, /Modo de consulta/)
  assert.match(html, /disabled/)
  assert.doesNotMatch(html, /Guardar producto|Desactivar producto/)
  assert.doesNotMatch(html, /Stock actual|name="stock"/)
})

test('sale services use exact backend endpoints and never send client totals or prices', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization'), data: config.data && JSON.parse(config.data) })
    return { data: config.method === 'get' && config.url === '/api/sales' ? [] : { id: 81, total: 25 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await saleService.getAllSales(), [])
  await saleService.getSaleById(81)
  const product = { id: 9, price: 12.5, stock: 4 }
  await saleService.createSale({ userId: 42, paymentMethod: 'CASH', paymentReference: 'must be omitted', lines: [{ product, quantity: 2 }], total: 25 })
  await saleService.cancelSale(81, ' Error de registro ')
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [['get', '/api/sales'], ['get', '/api/sales/81'], ['post', '/api/sales'], ['post', '/api/sales/81/cancel']])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
  assert.deepEqual(requests[2].data, { userId: 42, paymentMethod: 'CASH', paymentReference: null, lines: [{ productId: 9, quantity: 2 }] })
  assert.deepEqual(requests[3].data, { reason: 'Error de registro' })
  assert.equal('total' in requests[2].data, false)
  assert.equal(canCancelSales({ role: 'ADMIN' }), true)
  assert.equal(canCancelSales({ role: 'EMPLOYEE' }), false)
})

test('notification service lists and marks only through authenticated endpoints', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization') })
    return { data: config.method === 'get' ? [] : config.url.endsWith('/read') ? { id: 5, read: true } : undefined, status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await notificationService.getNotifications(), [])
  assert.deepEqual(await notificationService.markNotificationAsRead(5), { id: 5, read: true })
  await notificationService.markAllNotificationsAsRead()
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
    ['get', '/api/notifications'],
    ['patch', '/api/notifications/5/read'],
    ['patch', '/api/notifications/read-all'],
  ])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
})

test('sale draft caps quantity to available product stock and supports removal', () => {
  const product = { id: 9, price: '12.50', stock: 2 }
  let lines = addCartProduct([], product)
  lines = addCartProduct(lines, product)
  lines = addCartProduct(lines, product)
  assert.equal(lines[0].quantity, 2)
  assert.equal(calculateCartTotal(lines), 25)
  assert.equal(setCartQuantity(lines, 9, 99)[0].quantity, 2)
  assert.equal(setCartQuantity(lines, 9, 0)[0].quantity, 1)
  assert.deepEqual(removeCartProduct(lines, 9), [])
})

test('sale draft matches product ids and numeric fields independent of JSON number representation', () => {
  const stored = { id: 9, name: 'Mayonesa', price: 12, stock: 4, active: true }
  const refreshed = { id: '9', name: 'Mayonesa', price: '12.00', stock: '4', active: true }
  let lines = addCartProduct([], stored)
  lines = addCartProduct(lines, refreshed)
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)

  const result = revalidateSaleLines([{ product: stored, quantity: '1' }], [refreshed])
  assert.equal(result.error, '')
  assert.deepEqual(result.lines, [{ product: { ...refreshed, id: 9, price: 12, stock: 4 }, quantity: 1 }])
  assert.deepEqual(toSaleRequest({ userId: '42', paymentMethod: 'CASH', paymentReference: '', lines: result.lines }), {
    userId: 42,
    paymentMethod: 'CASH',
    paymentReference: null,
    lines: [{ productId: 9, quantity: 1 }],
  })
})

test('sale revalidation only blocks changes relevant to completing the sale', () => {
  const selected = [{ product: { id: 9, name: 'Mayonesa', price: '12.00', stock: 4 }, quantity: 1 }]
  const valid = { id: 9, name: 'Mayonesa nueva', price: 12, stock: 3, active: true }
  assert.equal(revalidateSaleLines(selected, [valid]).error, '')
  assert.match(revalidateSaleLines(selected, []).error, /cambiaron/)
  assert.match(revalidateSaleLines(selected, [{ ...valid, active: false }]).error, /cambiaron/)
  assert.match(revalidateSaleLines(selected, [{ ...valid, stock: 0 }]).error, /cambiaron/)
  assert.match(revalidateSaleLines(selected, [{ ...valid, price: 12.5 }]).error, /cambiaron/)
})

test('sale API errors do not label every bad request as changed product data', () => {
  const axiosError = (status, message) => ({ isAxiosError: true, response: { status, data: { message } } })
  assert.match(getSaleError(axiosError(400, 'Insufficient stock for product id: 9')), /stock disponible suficiente/)
  assert.match(getSaleError(axiosError(400, 'lines: must not be empty')), /datos enviados/)
  assert.doesNotMatch(getSaleError(axiosError(400, 'lines: must not be empty')), /cambiaron/)
})

test('sale payment rules match the backend DTO and role authorization', () => {
  const lines = [{ product: { id: 9 }, quantity: 1 }]
  assert.deepEqual(toSaleRequest({ userId: 42, paymentMethod: 'YAPE_PLIN', paymentReference: ' ref ', lines }), { userId: 42, paymentMethod: 'YAPE_PLIN', paymentReference: 'ref', lines: [{ productId: 9, quantity: 1 }] })
  assert.equal(validateSalePayment({ userId: 42, paymentMethod: 'CASH', paymentReference: '', lines }), '')
  assert.match(validateSalePayment({ userId: 42, paymentMethod: 'CARD', paymentReference: '', lines }), /método/)
  assert.match(validateSalePayment({ userId: 42, paymentMethod: 'CASH', paymentReference: '', lines: [] }), /producto/)
})

test('employee sale numbering is personal and ordered from oldest to newest', () => {
  const sales = [
    { id: 13, userId: 7, saleDate: '2026-10-03T09:00:00' },
    { id: 8, userId: 8, saleDate: '2026-10-01T09:00:00' },
    { id: 11, userId: 7, saleDate: '2026-10-01T10:00:00' },
    { id: 12, userId: 7, saleDate: '2026-10-02T10:00:00' },
  ]
  const employeeSeven = createEmployeeSaleSequence(sales, 7)
  const employeeEight = createEmployeeSaleSequence(sales, 8)

  assert.equal(employeeSeven.get('11'), 1)
  assert.equal(employeeSeven.get('12'), 2)
  assert.equal(employeeSeven.get('13'), 3)
  assert.equal(employeeEight.get('8'), 1)
  assert.equal(employeeSeven.has('8'), false)
})

test('stock services use the Spring Boot product-scoped endpoints with JWT', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push([config.method, config.url, config.headers.get('Authorization')])
    return { data: [], status: 200, statusText: 'OK', headers: {}, config }
  }
  await batchService.getBatchesByProduct(9)
  await movementService.getMovementsByProduct(9)
  await userService.getAllUsers()
  assert.deepEqual(requests, [
    ['get', '/api/product-batches/product/9', 'Bearer test-token'],
    ['get', '/api/stock-movements/product/9', 'Bearer test-token'],
    ['get', '/api/users', 'Bearer test-token'],
  ])
})

test('stock filters, batch ordering and status use raw DTO fields and calendar dates', () => {
  const products = [
    { id: 1, name: 'Jamón', stock: 2, minimumStock: 2 },
    { id: 2, name: 'Mayonesa', stock: 4, minimumStock: 1 },
  ]
  assert.equal(countLowStock(products), 1)
  assert.deepEqual(filterStockProducts(products, 'jamon', true), [products[0]])
  assert.deepEqual(filterStockProducts(products, '', false), products)
  const batches = [{ id: 2, expirationDate: '2026-09-25' }, { id: 1, expirationDate: '2026-09-18' }]
  assert.deepEqual(sortBatchesByExpiration(batches).map((batch) => batch.id), [1, 2])
  assert.deepEqual(batches.map((batch) => batch.id), [2, 1])
  const today = new Date(2026, 8, 18)
  const status = (quantity, expirationDate, active = true) => batchStatus({ quantity, expirationDate, active }, today).label
  assert.equal(status(1, '2026-09-18'), 'Próximo a vencer')
  assert.equal(status(1, '2026-09-17'), 'Vencido')
  assert.equal(status(1, '2026-09-25'), 'Próximo a vencer')
  assert.equal(status(1, '2026-09-26'), 'Vigente')
  assert.equal(status(0, '2026-09-17'), 'Agotado')
  assert.equal(status(1, '2026-09-25', false), 'Inactivo')
  assert.notEqual(formatStockDate('2026-09-18'), 'Fecha no disponible')
})

test('batch purchase price is admin-only and movement registrants use DTO userId', () => {
  const batch = { id: 3, quantity: 4, entryDate: '2026-09-01', expirationDate: '2026-09-25', purchasePrice: 19.5, active: true }
  const employeeView = renderToString(createElement(BatchCard, { batch, isAdmin: false }))
  const adminView = renderToString(createElement(BatchCard, { batch, isAdmin: true }))
  assert.doesNotMatch(employeeView, /Precio de compra/)
  assert.match(adminView, /Precio de compra/)
  const movement = { id: 7, type: 'PURCHASE_IN', quantity: 2, movementDate: '2026-09-18T11:34:52', userId: 4, reason: 'Recepción' }
  assert.equal(movementRegistrant(movement, { userId: 4, name: 'Ernesto' }, []), 'Ernesto')
  assert.equal(movementRegistrant(movement, { userId: 2, name: 'Otra' }, [{ id: 4, name: 'Ernesto' }]), 'Ernesto')
  assert.equal(movementRegistrant(movement, { userId: 2 }, []), 'Usuario #4')
  assert.equal(Object.keys(MOVEMENT_TYPES).length, 6)
  assert.equal(MOVEMENT_TYPES.SALE_CANCELLATION_IN.direction, 'in')
  assert.match(renderToString(createElement(MovementCard, { movement, user: { userId: 4, name: 'Ernesto' }, users: [] })), /Entrada por compra/)
})

test('purchase service uses exact endpoints and sends only PurchaseRequest DTO fields', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization'), body: config.data && JSON.parse(config.data) })
    return { data: config.method === 'get' && ['/api/purchases', '/api/suppliers'].includes(config.url) ? [] : { id: 31, total: 25 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await purchaseService.getAllPurchases(), [])
  await purchaseService.getPurchaseById(31)
  assert.deepEqual(await supplierService.getAllSuppliers(), [])
  await purchaseService.createPurchase({
    supplierId: '5', userId: '42', invoiceNumber: ' F-001 ', total: 999, stock: 999,
    lines: [{ productId: '9', quantity: '2', unitCost: '12.50', entryDate: '2026-09-18', expirationDate: '2026-10-18', subtotal: 999, batchId: 8 }],
  })
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
    ['get', '/api/purchases'], ['get', '/api/purchases/31'], ['get', '/api/suppliers'], ['post', '/api/purchases'],
  ])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
  assert.deepEqual(requests[3].body, {
    supplierId: 5, userId: 42, invoiceNumber: 'F-001',
    lines: [{ productId: 9, quantity: 2, unitCost: '12.50', entryDate: '2026-09-18', expirationDate: '2026-10-18' }],
  })
})

test('purchase form validates required DTO fields and does not expose registration to employee', () => {
  const line = { productId: 9, quantity: '2', unitCost: '12.50', entryDate: '2026-09-18', expirationDate: '2026-10-18' }
  const request = { supplierId: '5', userId: '42', invoiceNumber: '', lines: [line] }
  assert.equal(validatePurchase(request), '')
  assert.equal(purchaseTotal([line]), 25)
  assert.equal(validatePurchase({ ...request, lines: [] }).includes('producto'), true)
  assert.equal(validatePurchase({ ...request, lines: [{ ...line, quantity: '0' }] }).includes('cantidad'), true)
  assert.equal(validatePurchase({ ...request, lines: [{ ...line, unitCost: '1.234' }] }).includes('costo'), true)
  assert.equal(validatePurchase({ ...request, lines: [{ ...line, expirationDate: '' }] }).includes('fechas'), true)
  assert.equal(toPurchaseRequest(request).invoiceNumber, null)
  assert.equal(canManagePurchases({ role: 'ADMIN' }), true)
  assert.equal(canManagePurchases({ role: 'EMPLOYEE' }), false)
  assert.equal(availableSuppliers([{ active: true }, { active: false }]).length, 1)
  assert.equal(availablePurchaseProducts([{ name: 'Mayonesa', active: true }, { name: 'Otro', active: false }], 'mayo').length, 1)
  const employeeSession = { ...session, user: { ...session.user, role: 'EMPLOYEE' } }
  saveAuthSession(employeeSession, false)
  const html = renderToString(createElement(AuthProvider, null, createElement(MemoryRouter, null, createElement(NewPurchasePage))))
  assert.match(html, /Solo ADMIN puede registrar compras/)
  assert.doesNotMatch(html, /Registrar ingreso/)
})

test('supplier service uses exact endpoints, DTO payload, JWT, and deactivation PATCH', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization'), body: config.data && JSON.parse(config.data) })
    return { data: config.method === 'get' && config.url === '/api/suppliers' ? [] : { id: 5, active: true }, status: 200, statusText: 'OK', headers: {}, config }
  }
  const values = { name: '  Cáceres Norte  ', phone: ' 123 ', email: ' info@example.test ', address: ' Calle 1 ', active: false, id: 999 }
  assert.deepEqual(await supplierService.getAllSuppliers(), [])
  await supplierService.getSupplierById(5)
  await supplierService.createSupplier(values)
  await supplierService.updateSupplier(5, values)
  await supplierService.deactivateSupplier(5)
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
    ['get', '/api/suppliers'], ['get', '/api/suppliers/5'], ['post', '/api/suppliers'],
    ['put', '/api/suppliers/5'], ['patch', '/api/suppliers/5/deactivate'],
  ])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
  assert.deepEqual(requests[2].body, { name: 'Cáceres Norte', phone: '123', email: 'info@example.test', address: 'Calle 1' })
  assert.deepEqual(requests[3].body, requests[2].body)
  assert.equal(requests[4].body, undefined)
})

test('supplier filtering, validation, and role controls match backend constraints', () => {
  const valid = { ...emptySupplierForm, name: 'Proveedor' }
  assert.deepEqual(validateSupplier(valid), {})
  assert.ok(validateSupplier({ ...valid, name: ' ' }).name)
  assert.ok(validateSupplier({ ...valid, email: 'bad-address' }).email)
  assert.ok(validateSupplier({ ...valid, name: 'X'.repeat(256) }).name)
  assert.ok(validateSupplier({ ...valid, phone: '1'.repeat(256) }).phone)
  assert.ok(validateSupplier({ ...valid, address: 'X'.repeat(256) }).address)
  assert.deepEqual(toSupplierRequest(valid), { name: 'Proveedor', phone: null, email: null, address: null })
  assert.equal('active' in toSupplierRequest({ ...valid, active: false }), false)
  const suppliers = [
    { name: 'Jamón Cáceres', phone: '123', email: null, address: 'Centro', active: true },
    { name: 'Embutidos Sur', phone: null, email: 'sur@example.test', address: null, active: false },
  ]
  assert.deepEqual(filterSuppliers(suppliers, ' jamon ', 'active'), [suppliers[0]])
  assert.deepEqual(filterSuppliers(suppliers, 'sur@example', 'inactive'), [suppliers[1]])
  assert.equal(canManageSuppliers({ role: 'ADMIN' }), true)
  assert.equal(canManageSuppliers({ role: 'EMPLOYEE' }), false)
  const employeeSession = { ...session, user: { ...session.user, role: 'EMPLOYEE' } }
  saveAuthSession(employeeSession, false)
  const page = renderToString(createElement(AuthProvider, null, createElement(MemoryRouter, null, createElement(SuppliersPage))))
  const editor = renderToString(createElement(AuthProvider, null, createElement(MemoryRouter, null, createElement(SupplierEditorPage))))
  assert.doesNotMatch(page, /Nuevo proveedor/)
  assert.match(editor, /Solo ADMIN puede gestionar proveedores/)
})

test('expiration batch endpoints use JWT and the requested date range', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, params: config.params, authorization: config.headers.get('Authorization') })
    return { data: [], status: 200, statusText: 'OK', headers: {}, config }
  }
  assert.deepEqual(await batchService.getAllBatches(), [])
  assert.deepEqual(await batchService.getExpiringBatches('2026-09-18', '2026-10-18'), [])
  assert.deepEqual(requests, [
    { method: 'get', url: '/api/product-batches', params: undefined, authorization: 'Bearer test-token' },
    { method: 'get', url: '/api/product-batches/expiring', params: { fromDate: '2026-09-18', toDate: '2026-10-18' }, authorization: 'Bearer test-token' },
  ])
})

test('expiration statuses use local calendar days at every requested boundary', () => {
  const today = new Date(2026, 8, 18, 23, 30)
  const status = (date) => expirationStatus({ expirationDate: date }, today).label
  assert.equal(localDateIso(today), '2026-09-18')
  assert.equal(localDatePlusDays(30, today), '2026-10-18')
  assert.equal(daysUntilExpiration('2026-09-18', today), 0)
  assert.equal(status('2026-09-17'), 'Vencido')
  assert.equal(status('2026-09-18'), 'Urgente')
  assert.equal(status('2026-09-25'), 'Urgente')
  assert.equal(status('2026-09-26'), 'Próximo')
  assert.equal(status('2026-10-03'), 'Próximo')
  assert.equal(status('2026-10-04'), 'Por vencer')
  assert.equal(status('2026-10-18'), 'Por vencer')
  assert.equal(status('2026-10-19'), 'Vigente')
  assert.equal(daysRemainingLabel(-1), 'Venció hace 1 día')
  assert.equal(daysRemainingLabel(0), 'Vence hoy')
  assert.equal(daysRemainingLabel(1), '1 día restante')
})

test('expiration filters include only active batches with remaining quantity and sort oldest first', () => {
  const today = new Date(2026, 8, 18)
  const batches = [
    { id: 4, productId: 9, quantity: 2, active: true, expirationDate: '2026-10-19' },
    { id: 2, productId: 9, quantity: 1, active: true, expirationDate: '2026-09-20' },
    { id: 1, productId: 9, quantity: 3, active: true, expirationDate: '2026-09-17' },
    { id: 3, productId: 9, quantity: 0, active: true, expirationDate: '2026-09-19' },
    { id: 5, productId: 9, quantity: 1, active: false, expirationDate: '2026-09-18' },
  ]
  assert.deepEqual(filterExpirationBatches(batches, 'all', today).map((batch) => batch.id), [1, 2, 4])
  assert.deepEqual(filterExpirationBatches(batches, 'expired', today).map((batch) => batch.id), [1])
  assert.deepEqual(filterExpirationBatches(batches, '7', today).map((batch) => batch.id), [2])
  assert.deepEqual(batches.map((batch) => batch.id), [4, 2, 1, 3, 5])
  const html = renderToString(createElement(MemoryRouter, null, createElement(ExpirationCard, { batch: batches[1], product: { name: 'Mayonesa', imageUrl: null } })))
  assert.match(html, /Mayonesa/)
  assert.match(html, /Lote #(?:<!-- -->)?2/)
  assert.match(html, /stock\/9/)
  assert.doesNotMatch(html, /purchasePrice|Precio de compra/)
})

test('user service uses exact admin endpoints, JWT, and UserRequest DTO fields', async () => {
  saveAuthSession(session, false)
  const requests = []
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization'), body: config.data && JSON.parse(config.data) })
    return { data: config.method === 'get' && config.url === '/api/users' ? [] : { id: 4, roleName: 'EMPLOYEE' }, status: 200, statusText: 'OK', headers: {}, config }
  }
  const values = { name: ' Empleado ', email: ' EMPLOYEE@example.test ', password: ' unchanged ', role: 'EMPLOYEE', active: false, id: 999 }
  assert.deepEqual(await userService.getAllUsers(), [])
  await userService.getUserById(4)
  await userService.createUser(values)
  await userService.updateUser(4, { ...values, password: '' })
  await userService.deactivateUser(4)
  assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
    ['get', '/api/users'], ['get', '/api/users/4'], ['post', '/api/users'],
    ['put', '/api/users/4'], ['patch', '/api/users/4/deactivate'],
  ])
  assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-token'))
  assert.deepEqual(requests[2].body, { name: 'Empleado', email: 'EMPLOYEE@example.test', password: ' unchanged ', role: 'EMPLOYEE' })
  assert.deepEqual(requests[3].body, { name: 'Empleado', email: 'EMPLOYEE@example.test', password: null, role: 'EMPLOYEE' })
  assert.equal(requests[4].body, undefined)
})

test('user roles use exact backend names without exposing database IDs in form state', () => {
  const users = [
    { id: 1, name: 'Ernesto Cáceres', email: 'admin@example.test', roleId: 11, roleName: 'ADMIN', active: true },
    { id: 2, name: 'Ana', email: 'ana@example.test', roleId: 23, roleName: 'EMPLOYEE', active: false },
  ]
  assert.deepEqual(toUserForm(users[1]), { name: 'Ana', email: 'ana@example.test', password: '', role: 'EMPLOYEE' })
  assert.deepEqual(filterUsers(users, ' ernesto ', 'ADMIN', 'active'), [users[0]])
  assert.deepEqual(filterUsers(users, 'ana@', 'EMPLOYEE', 'inactive'), [users[1]])
  assert.equal(canManageUsers({ role: 'ADMIN' }), true)
  assert.equal(canManageUsers({ role: 'EMPLOYEE' }), false)
  const values = { ...emptyUserForm, name: 'Ana', email: 'ana@example.test', password: 'secure-password', role: 'EMPLOYEE' }
  assert.deepEqual(validateUser(values, false), {})
  assert.ok(validateUser({ ...values, name: ' ' }, false).name)
  assert.ok(validateUser({ ...values, email: 'bad' }, false).email)
  assert.ok(validateUser({ ...values, password: ' ' }, false).password)
  assert.ok(validateUser({ ...values, role: 'MANAGER' }, false).role)
  assert.deepEqual(validateUser({ ...values, password: '' }, true), {})
  assert.equal('active' in toUserRequest({ ...values, active: false }, false), false)
})

test('employee navigation hides Users and direct user routes are blocked', () => {
  const employee = { ...session.user, role: 'EMPLOYEE' }
  const employeePaths = visibleNavigation(mainNavigation, employee).map((item) => item.path)
  assert.deepEqual(employeePaths.filter((path) => ['/purchases', '/suppliers', '/users', '/reports'].includes(path)), [])
  assert.ok(employeePaths.includes('/stock'))
  assert.ok(employeePaths.includes('/expirations'))
  assert.equal(visibleNavigation(mainNavigation, { ...employee, role: 'ADMIN' }).some((item) => item.path === '/users'), true)
  saveAuthSession({ ...session, user: employee }, false)
  const more = renderToString(createElement(AuthProvider, null, createElement(MemoryRouter, null, createElement(MorePage))))
  assert.doesNotMatch(more, /href="\/users"/)
  const tree = createElement(AuthProvider, null,
    createElement(MemoryRouter, { initialEntries: ['/users'] },
      createElement(Routes, null,
        createElement(Route, { element: createElement(AdminRoute) },
          createElement(Route, { path: '/users', element: createElement('h1', null, 'User management') })),
        createElement(Route, { path: '/dashboard', element: createElement('h1', null, 'Dashboard') }))))
  assert.doesNotMatch(renderToString(tree), /User management/)
})

test('user form shows read-only status and optional password on edit', () => {
  const editor = {
    values: { name: 'Ana', email: 'ana@example.test', password: '', role: 'EMPLOYEE' },
    errors: {}, active: false, busy: false, error: '',
    change: () => {}, save: () => {}, deactivate: () => {},
  }
  const html = renderToString(createElement(MemoryRouter, null, createElement(UserForm, { editor, isEditing: true })))
  assert.match(html, /Nueva contraseña \(opcional\)/)
  assert.match(html, /Usuario inactivo/)
  assert.match(html, /EMPLOYEE/)
  assert.doesNotMatch(html, /name="active"/)
})
