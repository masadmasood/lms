# Library Management System - Frontend

Frontend application for Library Management System built with React and Vite.

## 🚀 Features

- Modern React 19 with Vite
- Fast development with Hot Module Replacement (HMR)
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- ESLint for code quality

## 📦 Tech Stack

- **React** ^19.2.0 - UI library
- **React Router DOM** ^7.1.3 - Client-side routing
- **Axios** ^1.7.9 - HTTP client for API calls
- **Tailwind CSS** ^4.1.18 - Utility-first CSS framework
- **Vite** ^7.2.4 - Build tool and dev server

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build for Production
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally.

### Lint Code
```bash
npm run lint
```
Run ESLint to check code quality.

## 📁 Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── routes/      # Route configuration
│   ├── services/    # API services
│   ├── App.jsx      # Main App component
│   ├── main.jsx     # Entry point
│   └── index.css  # Global styles
├── index.html       # HTML template
└── vite.config.js   # Vite configuration
```

## 🔗 API Integration

The frontend communicates with the backend API server running on `http://localhost:5000`.

Make sure the backend server is running before starting the frontend.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses Tailwind CSS for styling. Tailwind directives are imported in `src/index.css`.

## 📄 License

ISC
