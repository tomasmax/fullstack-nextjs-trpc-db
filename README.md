# Fanvue's Fullstack challenge

Setup the project:

Make sure you install all the dependencies (currently pnpm, but you can opt-out) and start the solution in dev mode.

There is a simple homepage that will display a typical "feed" page.

Requirements:

- Use trpc for data fetching and mutations (https://trpc.io/) this is already setup for you.
- Custom styling is not required, you should use MUI5 components out-of-the box, check the docs here https://mui.com/material-ui/
- Fetch the data from the sqlite file that sits in the "prisma" folder, with the prisma library, more info here https://www.prisma.io/docs/orm/overview/databases/sqlite

Note:

- The database is already seeded, but you can add more data if you want to.

Please complete the following tasks:

- Show a centered column of posts which are simple boxes with at least title and content properties, you can aggregate more data where it makes sense.
- For each post, show a button with a counter of the comments, or nothing if there are no comments.
- When clicking on the comment counter, the comments appear below it, you can choose what component to use.
- Although there is no authentication, user can add a comment to a post.

Consider the following, for instance leaving comments close to where this is relevant:

- Scalability of the solution
- Performance
- What Database type would be fit
- How monitoring and logging could be implemented
- SSR and SSG
- Possible infrastructure setup to help with the above
