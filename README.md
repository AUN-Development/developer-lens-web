# Developer Lens

**A minimalistic GitHub activity yearbook for developers**

Visualize your commits and pull requests as a clean, interactive yearly heatmap.

## Overview

Developer Lens turns your GitHub activity into a simple visual story of your year.

Instead of focusing on raw stats, it highlights:

- consistency
- activity patterns
- meaningful daily contributions

## Screenshots

<img src="./public/screenshots/home.png" alt="Homepage of Developer Lens" width="100%" />

<img src="./public/screenshots/dashboard.png" alt="User page with stats" width="100%" />

<img src="./public/screenshots/filters.png" alt="Day details with commits and pull requests" width="100%" />


## Features

- 🔐 GitHub OAuth authentication with NextAuth
- 📊 Interactive yearly contribution heatmap
- 📅 Daily breakdown for commits and pull requests
- 🧠 Smart filtering for commits, PRs, or both
- 🧾 Detailed daily commit viewer
- 🌗 Light/Dark Mode with built-in support from Shadcn UI.
- ⚡ Server-side GitHub data aggregation via `/api/github/activity`
- 🎯 Fully server-rendered dashboard with the App Router

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- NextAuth
- GitHub REST API
- Server Components and Route Handlers

## Demo

Check out the live demo: [https://developer-lens-web.vercel.app](https://developer-lens-web.vercel.app)

## License

This project is licensed under the [MIT License](./LICENSE).
