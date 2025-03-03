# Development

Notes for developers.

## Documentation
[Requirements](./requirement.md)  
[Diagrams](./diagrams.drawio) (See [#Diagrams](#diagrams))  

## File Structure
This section outlines the project structure and the purpose of each subdirectory. Any changes should be reflected here.
```
.
├── docs/ - project documentation
├── prisma/
│   └── schema.prisma - prisma schema that defines how data is stored in the database
├── public/ - static assets served by next.js
└── src/
    ├── app - the frontend, using next.js app router
    ├── components - supporting components for the frontend
    ├── actions - server actions which the frontend communicates with; controllers (presenters) that handles client input, interacts with the usecases and produces client output
    ├── usecases - usecases that handles business logic for every way that users interact with the backend, interacts with the repositories
    ├── db - repositories that handles data logic, interacts with the databases
    └── models - types and schemas that are defined for and used across the backend
```

### Diagrams
Draw.io is used to draw diagrams that assist this project.

Existing diagrams:
- Entity relationship diagram
- Use case diagram
- Class diagram

To open drawio files, use [drawio-desktop](https://github.com/jgraph/drawio-desktop/releases) (recommended) or [on the web](https://www.drawio.com/). Alternatively, use the VSCode extension [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) to view them within VSCode.

## Recommended VSCode Extensions
- Tailwind CSS IntelliSense: provides tailwind auto-completion and CSS rule preview on hover
- Prisma: provides syntax highlighting, formatting, and auto-completion for the schema.prisma file

## Working with Database using Prisma
To change the database model, change the prisma model file (`prisma/schema.prisma`). Then, update the code type definition by running `npx prisma generate`, and update the database schema by running `npx prisma db push`.

[Other tips for working with Prisma+MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb/)
