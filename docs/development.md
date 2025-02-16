# Development

Notes for developers.

## Working with Database using Prisma
To change the database model, change the prisma model file (`prisma/schema.prisma`). Then, update the code type definition by running `npx prisma generate`, and update the database schema by running `npx prisma db push`.

[Other tips for working with Prisma+MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb/)
