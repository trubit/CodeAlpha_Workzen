# WORKZEN — Phase 5 Authentication Architecture & Workflow Diagrams

This document contains the official architecture, sequence flows, token rotation models, and state machines for Phase 5 of **WORKZEN**.

---

## Diagram 1: Authentication System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Application Layer (React + Zustand)"]
        UI["Auth UI: Register, Login, Verify, Reset"]
        AUTH_STORE["Zustand Auth Store (token, user, status)"]
        API_CLIENT["Axios API Client (Bearer Token Interceptor)"]
    end

    subgraph Gateway["Express Security & Rate Limiting"]
        HELMET["Security Headers (Helmet)"]
        AUTH_LIMITER["Auth Rate Limiter (5 req / 15 min)"]
        AUTH_ROUTER["/api/v1/auth Route Handlers"]
    end

    subgraph ServiceLayer["Authentication Business Logic"]
        AUTH_SVC["Auth Service (Token Rotation, Session Invalidation)"]
        EMAIL_SVC["Mailer Service (Branded Verification & OTPs)"]
        TOKEN_SVC["JWT & Crypto Engine (Bcrypt 12, SHA256 Tokens)"]
    end

    subgraph Storage["MongoDB Multi-Tenant Database"]
        USER_COL["User Collection (select: false on hashes)"]
        SESSION_COL["Session Collection (TTL Index on expiresAt)"]
    end

    UI --> AUTH_STORE
    AUTH_STORE --> API_CLIENT
    API_CLIENT --> HELMET
    HELMET --> AUTH_LIMITER
    AUTH_LIMITER --> AUTH_ROUTER
    AUTH_ROUTER --> AUTH_SVC
    AUTH_SVC --> TOKEN_SVC
    AUTH_SVC --> EMAIL_SVC
    AUTH_SVC --> USER_COL
    AUTH_SVC --> SESSION_COL
```

---

## Diagram 2: User Registration & Email Verification Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Register / Verify UI
    participant Backend as Auth Controller & Service
    participant Mailer as Workzen Mailer
    participant DB as MongoDB (User Collection)

    User->>Frontend: Fills Name, Email, Password, Org
    Frontend->>Backend: POST /api/v1/auth/register
    Backend->>DB: Check if email exists
    alt Email exists
        Backend-->>Frontend: 409 Conflict ("Email already registered")
    else New Account
        Backend->>Backend: Bcrypt hash password (12 rounds)
        Backend->>Backend: Generate SHA-256 Verification Token + 6-Digit OTP
        Backend->>DB: Save User (status: 'pending', isEmailVerified: false)
        Backend->>Mailer: Send branded verification email
        Backend-->>Frontend: 201 Created (User DTO, no sensitive hashes)
        Frontend-->>User: Redirects to /verify-email screen
    end

    User->>Frontend: Enters 6-Digit OTP or clicks link
    Frontend->>Backend: POST /api/v1/auth/verify-email { email, otp/token }
    Backend->>DB: Verify token & expiry (15m window)
    Backend->>DB: Update User (status: 'active', isEmailVerified: true)
    Backend-->>Frontend: 200 OK ("Email verified successfully")
    Frontend-->>User: Renders Account Verification Success screen
```

---

## Diagram 3: Login & Rotating Refresh Token Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Login UI & Axios Client
    participant Backend as Auth Controller
    participant DB as MongoDB (Session Collection)

    User->>Frontend: Enters email and password
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>Backend: Bcrypt compare password
    alt Invalid Credentials
        Backend-->>Frontend: 401 Unauthorized ("Invalid credentials")
    else Valid Credentials
        Backend->>Backend: Issue Access Token (15m) + Refresh Token (7d)
        Backend->>DB: Create Session record (hash of refresh token)
        Backend-->>Frontend: Set-Cookie (HTTP-Only, Secure, SameSite=Lax: refreshToken)
        Backend-->>Frontend: 200 OK (accessToken, userProfile)
        Frontend->>Frontend: Store accessToken in memory / Zustand
    end

    Note over Frontend,Backend: Access Token expires after 15 minutes
    Frontend->>Backend: POST /api/v1/auth/refresh-token (with HTTP-only cookie)
    Backend->>DB: Lookup session by refreshTokenHash
    alt Token Reused or Revoked
        Backend->>DB: Security Alert: Invalidate ALL user sessions
        Backend-->>Frontend: 401 Unauthorized (Force Logout)
    else Token Valid
        Backend->>Backend: Generate NEW Refresh Token (Rotation)
        Backend->>DB: Update Session record with new refreshTokenHash
        Backend-->>Frontend: Set-Cookie: new refreshToken
        Backend-->>Frontend: 200 OK (new accessToken)
    end
```

---

## Diagram 4: Password Recovery & Session Revocation Workflow

```mermaid
flowchart TD
    Start([User clicks 'Forgot Password']) --> InputEmail[Enters Work Email]
    InputEmail --> API_Forgot[POST /api/v1/auth/forgot-password]
    API_Forgot --> GenericResponse["Return 200 OK Generic Response<br>('If account exists, instructions sent')"]
    API_Forgot --> CheckDB{User exists?}
    CheckDB -->|No| Stop([Silently ignore to prevent user enumeration])
    CheckDB -->|Yes| GenerateResetToken[Generate secure reset token & 6-digit OTP]
    GenerateResetToken --> SaveUser[Save hashed token with 15m expiration]
    SaveUser --> SendResetEmail[Dispatch branded password reset email]
    SendResetEmail --> UserOpensLink[User opens reset link or inputs OTP]
    UserOpensLink --> InputNewPass[Enters & confirms new secure password]
    InputNewPass --> API_Reset[POST /api/v1/auth/reset-password]
    API_Reset --> ValidateToken{Token valid & unexpired?}
    ValidateToken -->|No| ErrorExpired[Return 400 Bad Request]
    ValidateToken -->|Yes| HashNewPass[Bcrypt hash new password]
    HashNewPass --> UpdateUser[Update passwordHash & clear reset tokens]
    UpdateUser --> RevokeSessions["Revoke ALL active user sessions<br>(Prevents token hijack)"]
    RevokeSessions --> SuccessResponse[Return 200 OK & Redirect to Login]
```

---

## Diagram 5: OTP Verification & Anti-Brute-Force State Machine

```mermaid
stateDiagram-v2
    [*] --> OTP_Issued: User requests high-risk action
    
    OTP_Issued --> Validating: User submits 6-digit code
    
    Validating --> Verified: Code matches & unexpired
    Verified --> [*]: Action confirmed, OTP cleared
    
    Validating --> FailedAttempt: Incorrect code
    FailedAttempt --> Validating: Attempts < 3
    FailedAttempt --> Locked: Attempts >= 3
    
    Locked --> OTP_Invalidated: OTP immediately destroyed
    OTP_Invalidated --> ResendCooldown: 60-second cooldown required
    ResendCooldown --> OTP_Issued: Resend permitted after 60s
```

---

## Diagram 6: Protected Route & Auth Middleware Pipeline

```mermaid
flowchart LR
    Req[Incoming API Request] --> CheckHeader{Authorization header<br>starts with 'Bearer '?}
    CheckHeader -->|No| RejectNoToken[401 UNAUTHORIZED: Token missing]
    CheckHeader -->|Yes| VerifySig{Verify JWT signature<br>with JWT_ACCESS_SECRET}
    VerifySig -->|Invalid or Expired| RejectExpired[401 TOKEN_EXPIRED: Re-auth required]
    VerifySig -->|Valid| AttachUser[Attach req.user = decoded payload]
    AttachUser --> NextMiddleware[Call next controller handler]
```

---

## Diagram 7: Prototype-to-Implementation Visual Comparison Pipeline

```mermaid
flowchart LR
    P1["1. Author 18 Phase 5 Prototypes<br>(docs/design/phase-5/prototypes/)"] --> P2["2. Build Real React Pages & Server Routes<br>(src/client/pages/auth/ & src/server/routes/auth.ts)"]
    P2 --> P3["3. Capture Implemented Screenshots<br>(docs/design/phase-5/screenshots/)"]
    P3 --> P4["4. Compare Pixel Spacing, Hierarchy & Alerts<br>(Desktop, Tablet & Mobile Matrix)"]
    P4 --> P5["5. Automated Tests & Build Verification<br>(Vitest 12+ tests, Typecheck, Bundle)"]
    P5 --> P6["6. Phase 5 Sign-off & Phase 6 Readiness"]
```

