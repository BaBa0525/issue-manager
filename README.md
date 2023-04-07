# Issue Manager

Help you manage issues

## Demo

https://issue-manager-baba0525.vercel.app/

## Run Locally

Clone the project

```bash
  git clone git@github.com:BaBa0525/issue-manager.git
```

Go to the project directory

```bash
  cd issue-manager
```

Install dependencies

```bash
  pnpm install
```

Set environment variables in `.env` file

```bash
  cp .env.example .env
```

and manually add the following environment variables in `.env`

`GITHUB_CLIENT_ID`

`GITHUB_CLIENT_SECRET`

Start the server

```bash
  pnpm dev
```

## Notice

To run this project, you will need to register GitHub OAuth app and specify the following fields correctly

Homepage URL

```
http://localhost:3000
```

Authorization callback URL

```
http://localhost:3000/api/auth/callback/github
```

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Copy Right

Loading gif: [Saugy from dtto friends](https://www.instagram.com/p/CpciDK3ATBa/)
