# Embutidos Cáceres frontend

Mobile-first React application foundation using Vite, Tailwind CSS, React Router,
Axios, Lucide React, and Recharts. A not-found page and a login screen at `/login`
are implemented. Login is connected to Spring Boot;
`/dashboard` provides a layout preview with clearly labeled, isolated sample data.
Other business modules remain placeholders. No dashboard endpoints are connected.
Recharts is installed for future reporting modules.

## Run locally

```sh
npm install
```

Copy `.env.example` to `.env.local`. For local development, leave `VITE_API_URL`
empty and set `API_PROXY_TARGET` to the Spring Boot root URL (default:
`http://localhost:8080`). Vite proxies `/api` requests to that backend, avoiding
cross-origin requests. Start Spring Boot separately.

For a separate API origin, set `VITE_API_URL` to its root URL, for example
`https://api.example.com`, WITHOUT an `/api` suffix. The service supplies
`/api/auth/login`. Direct cross-origin access requires backend CORS configuration.
Restart Vite after changing environment variables. Vite exposes `VITE_*` values
in the browser bundle, so do not place secrets in them.

```sh
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run lint
npm test
npm run build
npm run preview
```

## Source structure

| Folder | Responsibility |
| --- | --- |
| `src/components` | Reusable UI pieces, such as the application header. |
| `src/pages` | Route-level views, dashboard preview fixture, and module placeholders. |
| `src/layouts` | Public AppLayout and authenticated MainLayout with nested content outlets. |
| `src/services` | HTTP configuration, authentication requests, and session persistence. |
| `src/hooks` | Login loading/error state and post-login navigation. |
| `src/context` | AuthContext and AuthProvider for shared authentication state. |
| `src/utils` | Login error messages and future pure helpers. |
| `src/assets` | Images, icons, fonts, and other imported static assets. |
| `src/routes` | Router configuration and future route composition. |

Empty folders contain `.gitkeep` so they remain in version control.

`src/App.jsx` composes `AuthProvider` and `AppRouter`. Public routes use `AppLayout`;
authenticated module routes use `MainLayout` through React Router's `Outlet`.
Tailwind is connected through the Vite plugin and imported in `src/index.css`.
Styles start with mobile defaults and expand at `sm` and `lg` breakpoints.

The root route uses `RootRedirect`: anonymous users go to `/login`, while an
authenticated session goes to `/dashboard`. It reads `isAuthenticated` from the
existing AuthContext. The redirect replaces the history entry and no public welcome
page is mounted at `/`.

The `/login` screen uses its own responsive presentation outside `AppLayout`.
It uses a full-height cream/wine layout, a local charcuterie hero, and centered
`LoginBrand` with the tagline Tu negocio, en buenas manos. Below 768px, the photo
covers the entire screen with a warm overlay. The compact form sits directly over
it, with only the brand at the top and Calidad en cada mesa at the bottom. Input
labels remain accessible to screen readers. Tablet retains the hero above the
cream form panel; desktop retains its full-height split view.
The forgotten-password link reveals administrator contact guidance on the page;
it does not implement a password reset flow. The optimized photo and its generation
prompt are stored in `src/assets/login-charcuterie.jpg` and
`src/assets/login-charcuterie.prompt.md`.
`LoginForm` provides email, password visibility, and a remember-me checkbox.
Its `onSubmit` prop receives `FormData`; `isSubmitting` and `error` control
presentation. Submission requires both fields and a handler. `useLogin` handles
the request, errors, session persistence, and redirect to `/dashboard` after success.
Native email/required validation runs before submission. Duplicate submissions
are blocked while pending.

`authService.login(email, password)` posts to `/api/auth/login` and maps the backend's
`{ token, userId, name, email, role }` response to `{ token, user }`. The token and
user are saved together under `embutidos.auth` in `localStorage` only when
Recordarme is checked; otherwise they go into `sessionStorage`. The old entry is
removed from both stores before saving. Passwords are never persisted. Invalid
responses and storage failures show errors and do not redirect.

`AuthProvider` wraps the application and exposes `user`, `token`,
`isAuthenticated`, `login(email, password, rememberMe)`, and `logout()` through
`useAuth`. It restores a valid saved session on its first render, preferring this
tab's `sessionStorage` entry before `localStorage`. Corrupt or incomplete entries
are discarded; unavailable storage does not crash startup. Login persists the
session before updating context; logout clears both stores and in-memory state.

`ProtectedRoute` supports nested routes through `Outlet` or wrapped children.
`/dashboard` redirects anonymous users to `/login`; `GuestRoute` redirects
authenticated users from `/login` to `/dashboard`. Redirects replace the current
history entry. The authenticated header displays the business name, the user's
name, and a Cerrar sesión button.
Dashboard API requests are outside this change; the backend remains
responsible for validating JWTs and permissions.

## Authenticated layout and navigation

`MainLayout` contains `MainHeader`, `Sidebar`, `BottomNavigation`, and an `Outlet`.
Items share one configuration in `src/routes/navigation.js` and use
`NavigationLink` for active styles. Below Tailwind's `lg` breakpoint, the fixed
bottom bar includes Dashboard, Sales, Products, and More. Desktop uses the sidebar
with all nine modules. Content reserves space for the bottom bar and mobile safe
areas; desktop navigation scrolls independently on shorter screens.

`/more` provides links to the additional modules. More remains highlighted on
mobile while visiting these modules. `/sales`, `/stock-batches`,
`/expirations`, `/purchases`, `/suppliers`, `/users`, and `/reports` use the reusable
`ModulePlaceholderPage`. These routes, `/more`, and `/dashboard` are nested under
`ProtectedRoute` and `MainLayout`.

## Dashboard preview

`DashboardPage` composes reusable `StatCard`, `DashboardPanel`, `SalesChart`,
`LowStockList`, `ExpiringProductsList`, `TopProductsList`, and `RecentSalesList`
components from `src/components/dashboard`. It displays daily and monthly sales,
monthly sale count, stock and expiration alerts, daily sales for the selected month,
best-selling products, and recent sales. Mobile uses compact cards and lists;
desktop uses multiple columns and a recent-sales table. The chart also provides
a collapsible data table for keyboard and screen-reader access.

Below 768px, `MobileDashboard` shows a compact greeting using the authenticated
user's first name and role, four KPIs, a 135px seven-day line chart, and exactly
three recent activities. The business header, monthly sale-count card, detailed
lists, and tables are hidden on this view. `MainLayout` reduces mobile dashboard
padding while preserving space for bottom navigation. Tablet/desktop retain the
existing detailed presentation. A small Datos de ejemplo label replaces the large
mobile preview notice; activity labels remain isolated in the same preview fixture.
The notification icon is a visual placeholder without a fake notification action.
The weekly chart offers its values to screen readers without adding visible rows.

All sample values are isolated in `src/pages/dashboard/dashboardPreview.js` and
identified by the visible preview notice. Dates, names, amounts, counts, and COP
currency are illustrative. No inventory thresholds, expiration windows, rankings,
or sales totals are calculated by the page. Replace its single preview source with
an API-backed hook when the backend dashboard contract is available. Lists and
the chart support empty arrays. Currency/number formatting lives in
`src/utils/dashboardFormatters.js`; currency and locale come from the data source.
The dashboard is lazy-loaded so Recharts is excluded from the initial login bundle.

## Products module

Protected routes inside `MainLayout`:

- `/products`: real product list, accent-insensitive name/description search,
  product image or fallback, price, stock, inactive status, and low-stock badge
  when stock is at or below minimum stock. Mobile uses compact cards and an admin
  create FAB; desktop uses a multi-column card grid and a create button.
- `/products/new`: admin-only creation; other roles see an access message.
- `/products/:id/edit`: admin editing, or read-only detail for employees.

`productService.js` uses the shared Axios instance for GET `/api/products`,
GET `/api/products/{id}`, POST `/api/products`, PUT `/api/products/{id}`, and
PATCH `/api/products/{id}/deactivate`. Axios reads the current saved JWT for every
request and supplies a Bearer header, excluding login requests. It stops supplying
the header after logout. The backend enforces permissions.

`useProducts` and `useProductEditor` own request state and mutations. Reusable
components in `src/components/products` handle presentation; DTO validation,
payload whitelisting, stock comparison, search, and role checks live in utilities.
Pending requests disable edits and duplicate mutations are blocked. Loading,
retryable errors, empty results, validation feedback, and successful-save messages
are supported. No sample products or simulated API responses are used by the app.

ProductRequest contains name, description, price, stock, minimumStock, and imageUrl.
The backend has no category field: the category chips are ready for future input
but currently expose only Todos and a disabled upcoming-categories chip. No
category is transmitted. Image URLs support public http/https links with fallback
previews; files are not uploaded to S3. Active status is read-only during editing;
admins can explicitly confirm deactivation. There is no reactivation endpoint, so
the UI does not offer reactivation or send active in the update DTO.

ProductResponse contains no currency. Configure `VITE_CURRENCY` and `VITE_LOCALE`
(examples/defaults: COP and es-CO) to match the actual business configuration.
Prices are displayed with two decimals. Product tests cover endpoint contracts,
exact request fields, JWT headers, validation boundaries, stock equality, search,
and employee read-only presentation without writing to the database.

## Sales module

All sales routes are protected and rendered inside `MainLayout`:

- `/sales`: ADMIN sales history with responsive cards showing the sale ID, date,
  exact time, total, payment method, and registering user. Spring Boot restricts
  `GET /api/sales` to ADMIN, so EMPLOYEE sees a clear access explanation and the
  Nueva venta action without making an unauthorized history request.
- `/sales/new`: product search using `productService`, available stock, add/remove,
  quantity controls, line subtotals, displayed running total, and a mobile action
  bar. Quantity is capped at the product's reported stock for immediate UX; the
  backend still validates batch/product stock and performs every deduction.
- `/sales/confirm`: selected-product summary, CASH and YAPE_PLIN payment methods,
  optional Yape/Plin reference, and duplicate-submit protection.
- `/sales/:id`: compact sale metadata, payment reference when present, sold lines,
  quantity, backend unit price/subtotal, and final backend total.

Successful creation remains on the confirmation route and shows Venta registrada,
sale ID, backend total, payment method, Nueva venta, and Ver detalle. It is not
described as an electronic invoice and no SUNAT behavior exists.

`saleService.js` implements GET `/api/sales`, GET `/api/sales/{id}`, and POST
`/api/sales` through the shared authenticated Axios instance. `toSaleRequest`
whitelists only `userId`, `paymentMethod`, nullable `paymentReference`, and
`{ productId, quantity }` lines. Frontend display totals, product names, images,
and prices are never sent as trusted sale fields; Spring Boot supplies authoritative
prices, subtotals, total, timestamp, and stock updates.

`SaleDraftProvider` holds an in-memory draft across the selection and confirmation
routes. Starting Nueva venta from history or from success explicitly clears it;
returning from payment to selection preserves it. No cart is persisted across a
reload. Hooks own API/loading/error state and presentational components live under
`src/components/sales`.

SaleResponse currently exposes `userId` and product IDs without user/product names.
The UI uses the authenticated name when its ID matches and otherwise displays
`Usuario #ID`; detail resolves product names through the existing product endpoint,
falling back to `Producto #ID`. This preserves the current DTO without inventing
fields. The configured `VITE_CURRENCY` and `VITE_LOCALE` also format sales.

Sales tests use a mocked Axios transport and do not create backend records. They
cover endpoint contracts, JWT headers, request whitelisting, server-owned totals,
cart stock caps, removal, payment-reference handling, and history authorization.

## API client

Import the shared Axios instance from `src/services/api.js` in future service modules.
It uses `VITE_API_URL`, a 15-second timeout, and an `Accept: application/json` header.
Without the variable, relative request URLs use the frontend origin. The login page
uses `authService`; HTTP concerns stay out of presentation components.

For production hosting, configure the server to serve `index.html` for frontend
routes so direct links work with `BrowserRouter`.
The Vite proxy applies only to `npm run dev`. In production (or preview), use an
API origin with CORS enabled or a hosting reverse proxy for `/api`.

`npm test` checks the login request/response contract, malformed responses,
failure handling, storage selection, restoration, stale-session removal, logout,
storage errors, initial context state, and nested route rendering.
Only test transport is mocked; application login always calls the real backend.
