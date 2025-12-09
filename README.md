# studio+233

**The AI-Native Creative Operating System for High-Volume Production**

studio+233 is an experimental creative platform that combines an infinite canvas with AI-powered workflows and batch processing capabilities. Built for creators who need to scale from one-off concepts to industrial-grade production pipelines.

## What you can do today

### 🎨 **Infinite Canvas**
- **React Konva-powered canvas** with smooth pan/zoom, multi-select, and real-time collaboration
- **Persistent workspace** - Auto-saves to IndexedDB with undo/redo history
- **AI-powered image generation** - Text-to-image, background removal, object isolation
- **Streaming updates** - Watch AI generate assets in real-time on the canvas

### 🤖 **AI Workflows** 
- **Vision tools** - Background removal, object isolation, image upscaling, palette extraction
- **Text-to-image generation** with Flux models and custom LoRA support
- **Video generation** - Text-to-video, video stitching, GIF creation
- **Research agents** - Web search, site extraction, moodboard creation

### ⚡ **Batch Processing** (Alpha)
- **Upload multiple assets** for batch processing
- **Queue management** with Inngest-powered job execution
- **Real-time status tracking** and progress monitoring
- **Usage-based billing** with rate limiting for free users

### 🔧 **Workflow Designer** (Experimental)
- **Visual workflow builder** using React Flow
- **Node-based AI tool composition** 
- **Save and execute custom workflows**
- **Real-time collaboration** on workflow design

## Application Structure

### Core Pages
- **Landing** (`/`) - Interactive landing page with manifesto and navigation
- **Dashboard** (`/dashboard`) - Project management and workspace overview
- **Canvas** (`/canvas`) - Main infinite canvas interface for creative work
- **Studio+** (`/studio+`) - Batch processing pipeline interface
- **Workflow Designer** (`/studio-experiments/[id]`) - Visual workflow builder

### Authentication & Onboarding
- **Login** (`/login`) - Authentication with Better Auth
- **Onboarding** (`/onboarding`) - User setup and workspace creation

## Technical Architecture

### Frontend Stack
- **Next.js 16** with App Router and React 19
- **React Konva** for high-performance 2D canvas rendering
- **tRPC** for type-safe API communication
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **IndexedDB** for client-side persistence

### AI & Workflows
- **Vercel AI SDK** for model routing, streaming, and tool execution
- **Google Gemini** models (Gemini 3 Pro, Gemini 2.5 Pro/Flash) for agent intelligence
- **Custom agent system** with specialized agents:
  - **Studio Orchestrator** - Main routing and coordination agent
  - **Vision Forge** - Image processing and generation
  - **Motion Director** - Video creation and editing
  - **Insight Researcher** - Web search and analysis
  - **Batch Ops** - Batch processing coordination
- **fal.ai** for image/video generation models

### Backend Services
- **Prisma** with PostgreSQL for data persistence
- **Inngest** for background job processing
- **Better Auth** for authentication
- **Vercel Blob** for file storage
- **Rate limiting** with KV store

### Key Features Implemented
- ✅ Infinite canvas with real-time collaboration
- ✅ AI image generation with streaming updates
- ✅ Background removal and object isolation
- ✅ Batch processing pipeline (alpha)
- ✅ Visual workflow designer (experimental)
- ✅ User authentication and workspace management
- ✅ Usage tracking and rate limiting

## Development

### Prerequisites
- Node.js 20+
- Bun 1.3.0+
- PostgreSQL database
- Google Gemini API key
- fal.ai API key

### Setup
1. Clone the repository
2. Install dependencies: `bun install`
3. Set up environment variables in `.env.local`:
   ```
   # Required
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   FAL_KEY=your_fal_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL=your_postgres_connection_string

   # Optional
   KV_REST_API_URL=
   KV_REST_API_TOKEN=
   ```
4. Run database migrations: `bun run db:push`
5. Start development server: `bun run dev`

### Project Structure
- `apps/web` - Main Next.js application
- `packages/ai` - AI agents and workflow definitions
- `packages/canvas` - Canvas types and utilities
- `packages/db` - Database schema and client
- `packages/auth` - Authentication utilities
- `packages/ui` - Shared UI components

## Current Status

This is an **experimental platform** under active development. Features are being built iteratively with a focus on:

1. **Canvas stability** - Improving performance and user experience
2. **AI workflow reliability** - Enhancing agent responses and tool execution
3. **Batch processing** - Scaling from prototype to production-ready pipeline
4. **Workflow designer** - Making visual workflow creation more intuitive

## License

MIT
