# Requirements and Overview

## Requirements

This section defines the functionalities of this application, a list of requirements to satisfy. Any new requirements should be added below.

Requirements:

1. Interaction with an external storage: Information about performers should never be committed. This application should connect to an external database that stores all those information.
2. Graphical user interface: Users of this application should use the application through a GUI.
3. Target users: For now, we assume that only event organization personnels are allowed access to the application. They will manage the data through the interface and export table views for other personnels (for example, Stage Manager and MC) when necessary.

Features:

1. Home Page
    - Show data summaries for each kind of activity, including: stage overview for stage, performance overview for MCs, applicant overview for liaison
    - Download the views either in picture format or in a format readable by Excel/Google Sheets
2. "Edit Performance" Page
    - Add performance item
    - Edit performance item
    - Delete performance item
3. "Edit Rundown" Page
    - Add concert and rehearsal rundown that represent performance items and breaks
    - Edit concert and rehearsal rundown order
    - Delete concert and rehearsal rundown
    - (Optional) Show summary of rundown, including expected starting and ending time of each item

## Overview

This section outlines a high-level overview of the architectural choices made for this application. Any changes should be reflected here.

- A full-stack Next.js application is used. A web interface is presented to the user.
- Next.js server actions are used in place of backend API routes.
- Prisma ORM is used for database access. MongoDB is used as the database model, as MongoDB Atlas is a cloud-based solution that is relatively easy to set up.
- TailwindCSS is used.
- Component libraries installed are: Handsontable.
- Other libraries installed are: Luxon (for working with dates and time), Zod (for declaring and validating data types)
- For now, there is no UI component suite installed, giving future developers flexibility to choose their own if they decide to improve the user interface with one.
