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
- **Identity Management:** Dedicated `@studio233/brand` package for context resolution
- **Background Jobs:** Inngest
- **Knowledge Processing (RAG):** LlamaIndex via `@studio233/rag`
- **AI Orchestration:** Vercel AI SDK with Resilient Design-Render Pipeline (Architecture of Intent: `renderHtml` vs `htmlToCanvas`) and Content-Addressable Storage (CAS)

## AI Models & Providers
- **Agent Intelligence:** Google Gemini (Gemini 3 Pro/Flash)
- **Media Generation:** fal.ai (Flux models, Video models)

## Infrastructure & Storage
- **Database:** PostgreSQL
- **Asset Storage:** Vercel Blob
- **Caching & Rate Limiting:** Vercel KV

## Tooling
- **Language:** TypeScript
- **Package Manager:** Bun
- **Testing:** Bun Native Testing Framework (`bun:test`)
- **Runtime Standards:** Web Standard APIs (crypto.subtle, Streams) for cross-runtime (Bun/Node.js) stability
- **Linting & Formatting:** Biome
- **Monorepo Management:** Turborepo
- **Runtime Environment:** Bun
