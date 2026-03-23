# AI Flow Visualizer Frontend

A React-based visual interface for AI prompt-response workflows using React Flow. Features a sidebar for chat history, input/output nodes, and streaming AI responses.

## ✨ Features

- 🎨 Drag-and-drop React Flow nodes (Input → AI Response)
- 📱 Sidebar with chat history (MongoDB-backed)
- ⚡ Real-time streaming AI responses via OpenRouter
- 💾 Save/load conversations with search/filter
- 🎯 TanStack Query for data fetching/mutations
- 📱 Tailwind CSS + modern UI components

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS 4, Lucide React icons
- **State/Data**: TanStack React Query, React Flow (@xyflow/react)
- **UI**: React Hot Toast notifications
- **HTTP**: Axios

## 🚀 Quick Start (Development)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## 🔨 Build for Production

```bash
# TypeScript check + build
npm run build

```

**Output**: `dist/` folder for deployment.

### Environment Variables

Update API endpoints in code:

```typescript
// Replace localhost URLs with production backend
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.com';
```

## 🧪 Testing Workflow

1. Type prompt in **Input Node**
2. Click **"Run Flow"** → Streams AI response
3. Click **"Save to DB"** → Stores in MongoDB
4. View/manage in **Sidebar History**

## 🔒 Security Notes

- Replace `localhost:5003` with production backend URL
- Add CORS headers on backend for frontend domain
- Use HTTPS-only in production
- Consider API key protection for OpenRouter
