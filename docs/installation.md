# Installation

This is a Next.js applicaation that runs on Node.js. This page is about how to setup, install and update the application.

## Guide

### Setup

#### Dependencies
Install Node.js:
- Install [Node.js](https://nodejs.org/en) on your system.
- Check if you have an installation of Node.js by running `node --version` and `npm --version` in the terminal.

Install Git:
- Install [Git](https://git-scm.com/downloads) on your system.
- Check if you have an installation of Git by running `git --version`.

#### Download
Download our code by running `git clone git@github.com:honeycrux/ERGMusicConcertPlanner.git`.

#### Database
This project will not run locally without .env files containing databases login credentials.

Use a MongoDB database. For example, [MongoDB Atlas](https://www.mongodb.com/atlas) can be used. They offer 1 free cluster per account.

After setting up, you may use tools such as [MongoDB Compass](https://www.mongodb.com/products/tools/compass) to connect to and manage the database.

Create a `.env` file in the project's root directory. Then, add the line `DATABASE_URL=""`.

Add the [connection string](https://www.prisma.io/docs/orm/reference/connection-urls#mongodb) inside the double quotes. It should look like `mongodb+srv://dbUser:dbPassword@clusterName.something.mongodb.net/databaseName`. Check that the string is complete with all information, including DB user/password, a cluster name, and a database name.

### Run Application
Installing dependencies:
- Run `npm install`.
    - This should automatically run `prisma generate`.

Run in development:
- Run `npm run dev` to start the application.

Build & run (for production):
- Run `npm run build` to build.
- Run `npm run start` to start the application.

Build & run should be quicker than development, but it requires rebuilding when the code is modified.

By default, app should be accessible on http://localhost:3000 after starting.

### Update
If there is a new version, use `git pull` in the project's root directory.

For good measure, reinstall using `npm install`, then run it.

## Note
The installation was tested on: Windows 10, Node 20.18.3, NPM 10.8.2
(As of 2025/02, using a higher version of node gives error when installing Prisma and tsx.)
(Development is ok. Build still fails.)
