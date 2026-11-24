# WORKZEN — Phase 2: Code & Infrastructure Diagrams Catalog

**Project:** WORKZEN  
**Phase:** Phase 2: Project Setup, Configuration & Development Environment  
**Format:** GitHub Flavored Markdown / Mermaid Diagrams  

---

## Diagram 1: Unified Repository Structure

```mermaid
graph TD
    Root["workzen/ (Single Root Full-Stack Repository)"]
    
    subgraph Configs["Root Configuration & Tooling"]
        Pkg["package.json (Single Central Manifest)"]
        Lock["package-lock.json (Deterministic Lock)"]
        Env[".env (Local Port 5050/3070) & .env.example"]
        TSClient["tsconfig.json (Client & Shared Bundler)"]
        TSServer["tsconfig.server.json (Server NodeNext)"]
        Vite["vite.config.ts (Port 3070, Proxy to 5050)"]
        Docker["Dockerfile (Multi-Stage) & docker-compose.yml"]
        CI[".github/workflows/ci.yml (Full-Stack CI)"]
    end

    subgraph Src["src/ Source Architecture"]
        Shared["src/shared/ (Single Source of Truth)"]
        SharedTypes["types/ (DTOs & Entity Interfaces)"]
        SharedConst["constants/ (Roles, Statuses)"]
        SharedVal["validation/ (Zod Schemas)"]
        
        Client["src/client/ (React 18 + Vite + MUI + Bootstrap)"]
        ClientApi["api/ (Centralized WorkzenApiClient)"]
        ClientPages["pages/ (13 Views + DevSetupPrototype)"]
        ClientStore["store/ (Zustand Global State)"]
        
        Server["src/server/ (Node.js + Express + TypeScript)"]
        ServConfig["config/ (Zod Env, Mongoose Connection Lifecycle)"]
        ServMid["middleware/ (Security Headers, Rate Limiter, Error Handler)"]
        ServRoutes["routes/ (/api/v1/health, /api/v1/info)"]
    end

    subgraph Tests["tests/ Automated Testing Suite"]
        EnvTest["env.test.ts (Zod Validation & Port Standards)"]
        SchemaTest["schemas.test.ts (Auth & Task Validation)"]
        HealthTest["health.test.ts (DB Telemetry & Health)"]
    end

    Root --> Configs
    Root --> Src
    Root --> Tests
    Src --> Shared & Client & Server
    Shared --> SharedTypes & SharedConst & SharedVal
    Client --> ClientApi & ClientPages & ClientStore
    Server --> ServConfig & ServMid & ServRoutes
```

---

## Diagram 2: Frontend Startup & Build Flow

```mermaid
flowchart TD
    Start["npm run dev (Vite Dev Server)"] --> LoadConfig["vite.config.ts Loads Aliases (@shared, @client)"]
    LoadConfig --> BindPort["Binds to Port 3070"]
    BindPort --> MountHTML["index.html Loads Google Fonts & /src/client/main.tsx"]
    MountHTML --> MountReact["ReactDOM.createRoot() Renders App Component"]
    MountReact --> InitTheme["MUI ThemeProvider (Indigo/Slate) & Bootstrap CSS"]
    InitTheme --> InitClient["Initializes WorkzenApiClient with BaseURL /api/v1"]
    InitClient --> RenderPrototype["Renders Selected Prototype Page (Default: Executive Dashboard)"]

    subgraph BuildPipeline["npm run build:client (Production)"]
        Typecheck["tsc -p tsconfig.json --noEmit"]
        ViteBuild["vite build (Rollup Bundler)"]
        TreeShake["Tree-shaking, Minification & CSS Extraction"]
        DistOutput["Generates Production Bundle in dist/"]
        Typecheck --> ViteBuild --> TreeShake --> DistOutput
    end
```

---

## Diagram 3: Backend Startup Flow

```mermaid
sequenceDiagram
    autonumber
    participant NodeProcess as Node.js Process
    participant EnvModule as config/env.ts
    participant DBModule as config/database.ts
    participant ExpressApp as Express Application
    participant SocketGateway as socket/index.ts
    participant HTTPServer as HTTP Server (Port 5050)

    NodeProcess->>EnvModule: Loads & validates environment variables (Zod)
    alt Invalid Environment
        EnvModule-->>NodeProcess: Logs issue & throws error
    else Valid Environment
        EnvModule-->>NodeProcess: Returns validated ENV object
        NodeProcess->>ExpressApp: Registers Security Headers, CORS, Rate Limiter, Body Parser
        NodeProcess->>ExpressApp: Registers API Router (/api/v1) & Error Handler
        NodeProcess->>SocketGateway: Mounts Socket.IO on HTTP Server
        NodeProcess->>DBModule: Calls connectDatabase()
        DBModule->>DBModule: Establishes connection pool (max 50, min 5)
        NodeProcess->>HTTPServer: Starts listening on Port 5050
        NodeProcess->>NodeProcess: Registers process signal handlers (SIGTERM, SIGINT)
    end
```

---

## Diagram 4: MongoDB Connection Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Disconnected : App Bootstraps
    Disconnected --> Connecting : connectDatabase() invoked
    Connecting --> Connected : Connection established (readyState: 1)
    Connecting --> Disconnected : Initial connection timeout / failure
    
    Connected --> Disconnected : Network drop / server restart
    Disconnected --> Reconnecting : Auto-reconnect triggered
    Reconnecting --> Connected : Reconnection established
    
    Connected --> Disconnecting : Graceful shutdown (SIGTERM)
    Disconnecting --> Disconnected : disconnectDatabase() completes
    Disconnected --> [*] : Process terminates cleanly
```

---

## Diagram 5: Environment Variable Loading & Validation

```mermaid
flowchart TD
    RawEnv["Host Environment / .env File"] --> Dotenv["dotenv.config() Populates process.env"]
    Dotenv --> ZodSchema["envSchema (Strict Zod Validation)"]
    
    ZodSchema --> Check{Validation Passed?}
    
    Check -- Yes --> SanitizedENV["Export Typed ENV Object"]
    SanitizedENV --> AppConsumers["Injected into Database, Express, JWT, CORS"]
    
    Check -- No --> ParseErrors["Format Error Details (Fields, Messages)"]
    ParseErrors --> LogSafe["Print Clean Console Error (No Secret Leakage)"]
    LogSafe --> ProdCheck{NODE_ENV == 'production'?}
    ProdCheck -- Yes --> FatalHalt["Throw Fatal Error & Halt Startup"]
    ProdCheck -- No --> FallbackDefaults["Supply Safe Local Development Fallbacks"]
    FallbackDefaults --> SanitizedENV
```

---

## Diagram 6: Application Request Lifecycle

```mermaid
flowchart LR
    ClientReq["Incoming HTTP Request"] --> SecurityHeaders["Security Headers Middleware (CSP, HSTS, NoSniff)"]
    SecurityHeaders --> CorsGuard["CORS Whitelist Guard (Port 3070 Allowed)"]
    CorsGuard --> RateLimit["Sliding-Window Rate Limiter (Max 100 req/15m)"]
    RateLimit --> BodyLimit["JSON Parser (10MB Strict Limit)"]
    BodyLimit --> Logger["HTTP Request Logger (Method, URL, Duration)"]
    Logger --> Router["API Router (/api/v1)"]
    
    Router --> RouteHandler["Route Handler (e.g. /health)"]
    RouteHandler --> ResponseEnvelope["Standardized ResponseEnvelope JSON"]
    
    Router -.->|Error Thrown| GlobalErrorHandler["Centralized errorHandler (Zod / 500 Formatting)"]
    GlobalErrorHandler --> ResponseEnvelope
```

---

## Diagram 7: Development & CI Pipeline

```mermaid
flowchart TD
    DevWork["Local Full-Stack Development"] --> PreCommit["Local Verification"]
    PreCommit --> Typecheck["npm run typecheck (tsc)"]
    PreCommit --> UnitTests["npm test (Native Node Test Runner)"]
    PreCommit --> ClientBuild["npm run build:client (Vite)"]
    PreCommit --> ServerBuild["npm run build:server (TypeScript)"]
    
    PreCommit --> GitPush["Git Push / PR to main/develop"]
    
    subgraph GitHubActions["GitHub Actions CI Workflow (.github/workflows/ci.yml)"]
        Runner["Ubuntu Runner (Node 20.x, 22.x)"]
        Runner --> CIInstall["npm ci (Deterministic Lockfile)"]
        CIInstall --> CITypecheck["npm run typecheck"]
        CITypecheck --> CITest["npm test"]
        CITest --> CIBuild["npm run build:client && npm run build:server"]
        CIBuild --> CIAudit["npm audit (Security Vulnerability Scan)"]
    end
    
    GitPush --> GitHubActions
```

---

## Diagram 8: Docker Production Build & Runtime Architecture

```mermaid
flowchart TB
    subgraph MultiStageDocker["Multi-Stage Production Dockerfile"]
        subgraph Stage1["Stage 1: deps (node:20-alpine)"]
            CopyPkg["Copy package*.json"]
            NpmCI["npm ci (Complete Dependency Graph)"]
            CopyPkg --> NpmCI
        end

        subgraph Stage2["Stage 2: builder (node:20-alpine)"]
            CopySrc["Copy Full Source Code"]
            RunBuild["npm run build (Vite & Server Compilation)"]
            CopySrc --> RunBuild
        end

        subgraph Stage3["Stage 3: runner (Minimal Alpine Image)"]
            NonRoot["USER node (Security Hardening)"]
            CopyArtifacts["Copy dist/ and Production node_modules"]
            Healthcheck["HEALTHCHECK: wget http://localhost:5050/api/v1/health"]
            CMD["CMD: node dist/server/server/index.js"]
            NonRoot --> CopyArtifacts --> Healthcheck --> CMD
        end

        Stage1 --> Stage2 --> Stage3
    end

    subgraph Compose["docker-compose.yml Orchestration"]
        AppService["Service: workzen-app (Ports 5050, 3070)"]
        MongoService["Service: mongo (Port 27017 with mongosh ping healthcheck)"]
        MongoService -.->|condition: service_healthy| AppService
    end
```

