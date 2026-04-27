<p align="center">
  <span style="display: inline-flex; align-items: center; gap: 14px;">
    <img src="./public/logo.png" alt="Developer Lens Logo" width="30" />
    <span style="font-size: 34px; font-weight: 700;">
      Developer Lens
    </span>
  </span>
</p>

**A minimalistic GitHub activity yearbook for developers**

Visualize your commits and pull requests as a clean, interactive yearly heatmap.

Built with Next.js • TypeScript • Tailwind CSS • GitHub API • NextAuth

---

## ✨ Overview

Developer Lens transforms your GitHub activity into a visual timeline of your development journey.

Instead of raw statistics, it focuses on:

- consistency
- activity patterns
- meaningful daily contributions

---

## 🚀 Features

- 🔐 GitHub OAuth authentication (NextAuth / Auth.js)
- 📊 Interactive yearly contribution heatmap
- 📅 Daily breakdown with commits and pull requests
- 🧠 Smart filtering (commits / PRs / both)
- 🧾 Detailed commit viewer per day
- ⚡ Server-side GitHub data aggregation (`/api/github/activity`)
- 📤 Export to image (PNG/JPG)
- 📝 Social caption generator (LinkedIn / Instagram ready)
- 🎯 Fully server-rendered dashboard (Next.js App Router)

---

## 🧠 Concept

Developer Lens is designed as a developer yearbook.

It helps you understand:

- when you are most productive
- how consistent your coding habits are
- what your development rhythm looks like

---

## 🛠 Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- NextAuth (Auth.js)
- GitHub REST API
- Server Components & Route Handlers

---

## ⚙️ Installation

### 1. Clone repository

```bash
git clone https://github.com/FrancoisSolomon/developer-lens-web.git
cd developer-lens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and add your GitHub OAuth credentials:

```
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
```

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application in action!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
