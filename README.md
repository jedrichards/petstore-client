# Pawprint

A React client for the [Swagger Petstore v3](https://petstore3.swagger.io) demo API. It talks
to the live server, so the data is shared with everyone else using the demo and changes often.

## Run it

```bash
npm install
npm run dev
```

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Starts the Vite dev server          |
| `npm run build`     | Typechecks, then builds to `dist/`  |
| `npm run check`     | Typecheck, lint and tests in one go |
| `npm run typecheck` | Runs the TypeScript compiler        |
| `npm run lint`      | Runs oxlint                         |
| `npm test`          | Runs the Vitest suite once          |
| `npm run format`    | Formats every file with Prettier    |

To point the app at another Petstore server, copy `.env.example` to `.env.local` and set
`VITE_PETSTORE_API_URL`.

## Stack

- **Vite 8, React 19, TypeScript 7** in strict mode
- **React Router 8** with a data router, lazy routes and a route guard
- **TanStack Query 5** for all server state
- **CSS Modules** on top of CSS custom property tokens; no CSS framework
- **Fraunces and Nunito** variable fonts, bundled through Fontsource
- **Vitest and Testing Library** for tests, **oxlint** and **Prettier** for linting and formatting

## What it does

| Route                                 | Purpose                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| `/`                                   | Dashboard: stock by status, featured pets, recent orders     |
| `/pets`                               | Browse pets by status, name, category and tag; grid or table |
| `/pets/new`, `/pets/:petId/edit`      | Create and edit a pet                                        |
| `/pets/:petId`                        | Pet detail: change status, upload a photo, delete            |
| `/favorites`                          | Pets marked with a heart                                     |
| `/cart`                               | Cart and checkout                                            |
| `/orders`, `/orders/:orderId`         | Orders placed or looked up, with cancel                      |
| `/users`, `/users/:username`, `/edit` | Look up, create, edit and delete users                       |
| `/sign-in`, `/account`                | Session; `/account` requires a signed-in user                |
| `/settings`                           | Theme, page size, API key, local data                        |

Every operation in the API's OpenAPI document has a typed method in `src/api/petstoreApi.ts`.

## Layout

```
src/
  main.tsx              Entry point
  app/                  Provider composition, router, app shell, error pages
  api/                  HTTP client, typed API, normalisers, query keys, ApiProvider
  design-system/
    tokens/             Design tokens (tokens.css), reset, token types
    components/         UI components, one .tsx and one .module.css each
    index.ts            The design system's public surface
  features/
    pets/               Pages, components, queries, FavoritesProvider
    store/              Cart, checkout, orders, inventory
    users/              User pages and queries
    session/            SessionProvider, sign-in, route guard
    preferences/        ThemeProvider, PreferencesProvider, settings
    dashboard/          Dashboard page
  components/           Small composites shared across features
  lib/                  Framework-free helpers and hooks
  test/                 Test setup, fake API, whole-app render helper
```

Imports go one way: `features` use `api`, `design-system` and `lib`; the design system uses
only `lib`. App code imports components from `@/design-system`, never from a component file.

## Design system

`src/design-system/tokens/tokens.css` holds two layers of custom properties:

- **Primitives** such as `--ds-neutral-200` and `--ds-space-4`: the raw palette and scales.
- **Semantic tokens** such as `--ds-color-surface` and `--ds-color-accent`: a role mapped to a
  primitive. Components read only these, so the dark theme is one block of overrides under
  `[data-theme='dark']`.

Components: `Alert`, `Avatar`, `Badge`, `Button`, `IconButton`, `LinkButton`, `Card`, `Dialog`,
`DescriptionList`, `EmptyState`, `Field`, `Grid`, `Input`, `Textarea`, `Select`, `Checkbox`,
`Switch`, `SegmentedControl`, `TagInput`, `PageHeader`, `Pagination`, `Skeleton`, `Spinner`,
`Stack`, `Inline`, `StatTile`, `Table`, `Text`, `Heading`, `VisuallyHidden`, plus the
`ToastProvider` and `ConfirmProvider` contexts.

## State

| Kind                  | Where it lives                                                        |
| --------------------- | --------------------------------------------------------------------- |
| Server data           | TanStack Query, keyed by `src/api/queryKeys.ts`                       |
| List filters          | The URL's search params, so a filtered view can be shared             |
| Session               | `SessionProvider`, kept in session storage                            |
| Cart                  | `CartProvider`, a reducer persisted to local storage                  |
| Favorites             | `FavoritesProvider`, persisted to local storage                       |
| Theme and preferences | `ThemeProvider` and `PreferencesProvider`, persisted to local storage |
| Toasts and confirms   | `ToastProvider` and `ConfirmProvider` in the design system            |
| API client            | `ApiProvider`, which tests replace with an in-memory fake             |

`src/app/AppProviders.tsx` composes the providers in dependency order.

## Working with the demo server

The live server differs from its own specification. The client handles each case:

- **The client chooses ids.** Creating a pet, order or user without an id fails, so
  `src/lib/ids.ts` generates one.
- **Errors are plain text or JSON.** `src/api/client.ts` reads both into an `ApiError`.
- **Stored data is messy.** Pets can lack a name, repeat in a list, or hold photo "URLs" such
  as `string`. `src/api/normalize.ts` repairs every response.
- **`GET /store/inventory` returns a 500.** `useInventory` falls back to counting the three
  status lists and says so on the dashboard.
- **`POST /pet/{id}` needs the name.** The specification calls it optional; the server
  rejects a status change without it.
- **There is no way to list orders or users.** The app remembers the ids and usernames it
  has seen and fetches each one.
- **Sign-in accepts anything.** `GET /user/login` takes the credentials in the query string
  and returns a session for any input. Never enter a real password.

## Tests

`npm test` runs unit tests for the HTTP client, normalisers, filters and cart reducer,
component tests for the form field wiring, and whole-app tests in `src/app/App.test.tsx`
that drive real routes against the in-memory API in `src/test/fakeApi.ts`.
