# Interview Questions And Answer Patterns

This file gives interview-ready answers for frontend basics.

## Question: What Is A Frontend?

Strong answer:

> A frontend is the user-facing part of an application. It renders UI, handles interactions, collects input, manages local state, and communicates with backend APIs. It improves user experience, but trusted business logic, secrets, database writes, and authorization must be handled on the backend.

## Question: What Is React?

Strong answer:

> React is a component-based JavaScript library for building user interfaces. Components receive props, manage state, and render UI declaratively. When state changes, React re-renders the affected UI.

## Question: What Are Props And State?

Strong answer:

> Props are read-only inputs passed from parent to child components. State is data owned by a component or store that changes over time and causes UI updates.

## Question: What Are Hooks?

Strong answer:

> Hooks are functions that let React function components use features like state, side effects, refs, memoization, and reusable stateful logic. Common hooks include `useState`, `useEffect`, `useRef`, `useMemo`, and custom hooks like `useUser` or `useProducts`.

## Question: What Is Next.js?

Strong answer:

> Next.js is a React framework that adds routing, layouts, server rendering, static generation, route handlers, middleware, build tooling, and deployment conventions. React builds components; Next.js organizes them into a production web application.

## Question: Server Component Versus Client Component?

Strong answer:

> Server components render on the server and are good for fetching data securely and reducing client JavaScript. Client components run in the browser and are needed for interactivity, state, effects, event handlers, and browser APIs. A good pattern is to fetch and prepare data on the server, then pass it to client components for interaction.

## Question: How Does A Frontend Call A Backend API?

Strong answer:

> The frontend uses an HTTP client like fetch or Axios to call API endpoints. In a clean architecture, API calls are wrapped in an API client layer or hooks. The UI handles loading, success, empty, and error states, while the backend validates, authorizes, and performs trusted work.

## Question: Why Not Put Secrets In Frontend Code?

Strong answer:

> Anything sent to the browser can be inspected by users. Frontend public environment variables and bundled JavaScript are not secret. API keys, JWT signing secrets, Stripe secret keys, OAuth secrets, and database URLs must stay on the backend.

## Question: Client Validation Versus Server Validation?

Strong answer:

> Client validation improves user experience by giving immediate feedback. Server validation protects the system because clients can bypass frontend checks. Any important rule must be enforced on the backend.

## Question: How Do You Manage State In React?

Strong answer:

> I separate state into local UI state, shared client state, and server state. Local state handles small interactions like modals or tabs. Shared state handles app-wide concerns like auth, theme, or cart. Server state is data from APIs and needs fetching, caching, invalidation, and loading/error states.

## Question: What Is A Protected Route?

Strong answer:

> A protected route is a frontend route that redirects or blocks users who are not logged in or do not have the right role. It improves UX, but it is not enough for security. Backend APIs must still enforce authentication and authorization.

## Question: How Does Frontend Auth Work?

Strong answer:

> The frontend collects credentials and calls the auth API. The backend verifies the user and issues a cookie or token. The frontend includes credentials in future API requests and uses auth state to show the right UI. Backend services remain the source of truth for auth and permissions.

## Question: Storefront Versus Dashboard?

Strong answer:

> A storefront optimizes for product discovery, SEO, browsing, trust, and checkout conversion. A dashboard optimizes for authenticated operations, data tables, filters, forms, workflow efficiency, and status tracking. They can share services and components, but their UX and data patterns are different.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart has two Next.js frontends. `user-ui` serves buyers with product browsing, cart, checkout, profile, search, recommendations, and AI Vision flows. `seller-ui` serves sellers with product management, orders, discounts, events, offers, and dashboard workflows. Both call backend services through the gateway and rely on backend auth, validation, and business logic.

## Best Short Project Pitch For This Topic

> The frontend side of Artistry Cart uses Next.js and React for two different user experiences: a buyer storefront and a seller dashboard. The frontends handle rendering, interaction, forms, state, and API calls, while backend services enforce trusted logic for auth, products, orders, recommendations, and AI Vision. This separation is what makes the project full-stack rather than just UI pages calling random endpoints.

