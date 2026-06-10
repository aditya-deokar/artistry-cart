# Frontend Basics For Full-Stack Confidence

This folder is the fourth learning block for preparing for a bigger engineering role. It focuses on the frontend knowledge a backend/full-stack/platform engineer should be able to explain confidently.

The goal is not to become only a UI specialist. The goal is to understand how browser apps, React, Next.js, forms, state, auth, and API calls connect to backend services.

## Learning Outcome

After completing this topic, you should be able to explain:

- how frontend applications run in the browser
- what React components, props, state, and hooks are
- how Next.js routing and layouts work
- server components versus client components
- how frontend apps call backend APIs
- how forms and validation work
- how authentication flows appear in frontend apps
- how buyer, seller, and admin dashboards differ
- how frontend architecture connects to backend service design

## Files In This Topic

1. [Frontend Mental Model](./01-frontend-mental-model.md)
2. [React Fundamentals](./02-react-fundamentals.md)
3. [Next.js Fundamentals](./03-nextjs-fundamentals.md)
4. [Data Fetching And API Calls](./04-data-fetching-and-api-calls.md)
5. [State Management, Forms, And Validation](./05-state-management-forms-validation.md)
6. [Authentication Flow In Frontend Apps](./06-authentication-flow-in-frontend-apps.md)
7. [Buyer UI, Seller Dashboard, And Full-Stack Architecture](./07-buyer-ui-seller-dashboard-full-stack-architecture.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Read this topic with one question in mind:

> What happens in the browser, and what belongs on the backend?

Good full-stack engineers know where responsibilities should live:

- rendering and interaction belong in the frontend
- secrets and trusted business logic belong on the backend
- validation belongs on both sides
- authorization must be enforced on the backend
- API contracts connect both sides

## Connection To Artistry Cart

This repo has two major frontend apps:

- `apps/user-ui`: buyer storefront
- `apps/seller-ui`: seller dashboard

They use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- component libraries
- hooks
- API client utilities
- state management
- auth-aware routes and flows

They communicate with backend services through the API gateway and service APIs.

