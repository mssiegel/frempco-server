# Frempco - Backend code

Frempco lets teachers pair up classmates for text-based improvised chats. Students build up real-world friendships through collaboration and storytelling. The word "Frempco" stands for "Friendships + Empowerment = Community," the equation that powers what we do.

## Hosting

- Dev site: [dev.frempco.com](https://dev.frempco.com/)
- Live site: [frempco.com](https://www.frempco.com/)
- Frontend hosted on Vercel
- Backend hosted on Heroku

## Tech stack (backend)

- Node / Express
- TypeScript
- SocketIO

## Setup instructions

1. `npm install`
2. `npm run dev`
3. Download the [frontend repo](https://github.com/mssiegel/frempco-client) and run it separately

## Git workflow

- Our production branch is `main`, and our development branch is `dev`
- All development branches come from `dev`
- Pull requests are merged into `dev`
- Every so often, we merge `dev` into `main`
