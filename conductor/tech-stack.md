# Technology Stack: studio+233

## Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Canvas Rendering:** React Konva, React Flow (@xyflow/react)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion, GSAP
- **State Management:** Jotai
- **API Client:** tRPC

## Backend & API
- **API Framework:** tRPC (Server)
- **Database ORM:** Prisma
- **Authentication:** Better Auth
- **Background Jobs:** Inngest
- **Knowledge Processing (RAG):** LlamaIndex via `@studio233/rag`
- **AI Orchestration:** Vercel AI SDK with Content-Addressable Storage (CAS) and Resilient Fetch Pipeline

## AI Models & Providers
- **Agent Intelligence:** Google Gemini (Gemini 2.5/3 Pro/Flash)
- **Media Generation:** fal.ai (Flux models, Video models)

## Infrastructure & Storage
- **Database:** PostgreSQL
- **Asset Storage:** Vercel Blob
- **Caching & Rate Limiting:** Vercel KV

## Tooling
- **Language:** TypeScript
- **Package Manager:** Bun
- **Runtime Standards:** Web Standard APIs (crypto.subtle, Streams) for cross-runtime (Bun/Node.js) stability
- **Linting & Formatting:** Biome
- **Monorepo Management:** Turborepo
