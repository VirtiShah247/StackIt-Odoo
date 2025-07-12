# MERN Stack App with Tailwind CSS and shadcn/ui

A full-stack MERN application with modern UI components and styling.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Development**: Concurrently for running both servers

## Quick Start

1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Create environment files:
   ```bash
   # Create server/.env
   cp server/.env.example server/.env
   
   # Create client/.env
   cp client/.env.example client/.env
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the React development server
- `npm run server` - Start only the Express server
- `npm run build` - Build the React app for production
- `npm run start` - Start the production server

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── controllers/      # Route controllers
│   └── package.json
└── package.json          # Root package.json
```

## Features

- 🚀 Fast development with Vite
- 🎨 Beautiful UI with shadcn/ui components
- 💨 Utility-first CSS with Tailwind
- 🔗 RESTful API with Express
- 🗄️ MongoDB database integration
- 🔄 Hot reload for both frontend and backend
- 📱 Responsive design
- 🎯 TypeScript support (optional)

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-app
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
```

## Usage

1. The React app runs on `http://localhost:5173`
2. The Express server runs on `http://localhost:5000`
3. API endpoints are available at `http://localhost:5000/api`

## Adding shadcn/ui Components

```bash
cd client
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
