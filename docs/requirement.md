# Requirements and Overview

## Requirements

This section defines the functionalities of this application, a list of requirements to satisfy. Any new requirements should be added below.

Requirements:

1. Interaction with an external storage: Information about performers should never be committed. This application should connect to an external database that stores all those information.
2. Graphical user interface: Users of this application should use the application through a GUI.
3. Target users: For now, we assume that only event organization personnels are allowed access to the application. They will manage the data through the interface and export table views for other personnels (for example, Stage Manager and MC) when necessary.

Features:

1. Home Page
    - Show overall view
    - Show stage view, rundown view, and MC view, which are data summaries for each kind of activity
    - Download the views either in picture format or in a format readable by Excel/Google Sheets
2. "Edit Performance" Page
    - Add performance item
    - Edit performance item
    - Delete performance item
3. "Edit Rundown" Page
    - Add concert and rehearsal slots that represent performance items and breaks
    - Edit concert and rehearsal slots order
    - Delete concert and rehearsal slots
    - Show summary of rundown, including expected starting and ending time of each item

## Overview

This section outlines a high-level overview of the architectural choices made for this application. Any changes should be reflected here.

- A full-stack Next.js application is used. A web interface is presented to the user.
- (Where should backend logic exist? Server actions, or routes?)
- Prisma ORM is used for database access. MongoDB is used as the database model, as MongoDB Atlas is a cloud-based solution that is relatively easy to set up.
- TailwindCSS is used.
- Component libraries installed are: AG Grid.
- For now, there is no UI component suite installed, giving future developers flexibility to choose their own if they decide to improve the user interface with one.
