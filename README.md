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
