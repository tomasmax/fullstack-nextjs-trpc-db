# Fullstack trpc database

Setup the project:

Make sure you install all the dependencies (currently pnpm, but you can opt-out) and start the solution in dev mode.

There is a simple homepage that will display a typical "feed" page.

Requirements:

- Using trpc for data fetching and mutations (https://trpc.io/)
- Using MUI5 components out-of-the box, check the docs here https://mui.com/material-ui/
- Fetch the data from the sqlite file that sits in the "prisma" folder, with the prisma library, more info here https://www.prisma.io/docs/orm/overview/databases/sqlite

Features:

- Show a centered column of posts which are simple boxes with at least title and content properties.
- For each post, show a button with a counter of the comments, or nothing if there are no comments.
- When clicking on the comment counter, the comments appear below it.
- Although there is no authentication, user can add a comment to a post.

Technical considerations:

- Scalability of the solution
- Performance
- What Database type would be fit
- How monitoring and logging could be implemented
- SSR and SSG
- Possible infrastructure setup to help with the above

# Technical Considerations

## Testing

I would add components testing with vitest, to cover al unit testing. And for a production ready web app it would be nice to add E2E testing, let's say with playwright or similar. Always trying to keep them light, testing only the needed integration flows, as E2E test are the most expensive tests, CI time and resources.

## Scalability of the Solution

The current implementation with `react-virtualized` provides good client-side scalability for rendering large lists of posts. Otherwise when a lot of posts were loaded into the DOM the web interactivity was very slow.
https://github.com/bvaughn/react-virtualized/blob/master/docs/List.md

## Web Performance

The current virtualization approach addresses UI performance concerns. And the Row dynamic height calc maintains a good CLS

## Database Type Considerations

SQLite is currently used, which works well for development but has limitations:

- **Production Database**: Consider PostgreSQL which handles concurrent writes better than SQLite.
- **Hybrid Approach**: For even higher scale, consider a hybrid approach with relational DB for core data and Redis for caching.

## Monitoring and Logging

Add structured logging and monitoring:

Add middleware for request logging and performance tracking
Track API performance metrics

- **Error Tracking**: Integrate with services like Sentry for error tracking.
- **Distributed Tracing**: Add OpenTelemetry for distributed tracing, especially for API calls.
- **Business Metrics**: Implement custom metrics for business-critical operations (post creation, comment rates).
- **Performance Monitoring**: Set up dashboard monitoring for API performance and error rates. Datadog, Grafana...

## SSR and SSG

The feed page would benefit from SSR for initial load performance and optimizations, and if SEO is needed it would be needed:

- **Incremental Static Regeneration**: Use ISR for post content that changes infrequently.
- **Static Site Generation**: Pure static pages (SSG) make sense for about pages, FAQs, etc.

## Infrastructure Setup

A robust infrastructure would include:

- **Hosting**: Deploy Next.js on Vercel or similar platform. Or AWS
- **Content Delivery**: Use a CDN for media content (images, videos).
- **Development Environment**: Consider containerization (Docker) for consistent environments across development and production. And deploying the container in kubernetes would be very scalable, as kubernetes Paas platforms are very
