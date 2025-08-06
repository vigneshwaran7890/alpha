# Frontend – Alpha Assessment

This is the frontend for the Alpha Assessment project, built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.


## 🛠️ Tech Stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/) – Real-time enrichment progress
- [Axios](https://axios-http.com/) – API requests

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```sh
git clone <YOUR_GIT_URL>
cd frontend
npm install
```

### Development

Start the development server with hot reloading:

```sh
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080) (or as configured in `vite.config.ts`).

### Build

To build for production:

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## 📝 Editing the Code

You can edit the code using:

- Your preferred IDE (VS Code recommended)
- GitHub web editor or Codespaces

## 🌐 Deployment

You can deploy directly from Lovable or use your preferred static hosting provider (e.g., Vercel, Netlify).

## 📡 Real-time Enrichment

This frontend connects to the backend enrichment endpoint using **Socket.IO** for real-time progress updates when enriching a person.  
Make sure your backend is running and accessible at the configured API URL.

## 📝 License

MIT — free to use and modify.


