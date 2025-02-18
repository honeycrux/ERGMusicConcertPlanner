# Development

Notes for developers.

## Recommended VSCode Extensions
- Tailwind CSS IntelliSense: provides tailwind auto-completion and CSS rule preview on hover
- Prisma: provides syntax highlighting, formatting, and auto-completion for the schema.prisma file

## Working with Database using Prisma
To change the database model, change the prisma model file (`prisma/schema.prisma`). Then, update the code type definition by running `npx prisma generate`, and update the database schema by running `npx prisma db push`.

[Other tips for working with Prisma+MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb/)
