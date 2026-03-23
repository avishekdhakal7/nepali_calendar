# School Management System — Frontend Documentation

> This file is the **complete onboarding brain** for this frontend. Any AI reading this alone must understand the full frontend architecture, how it connects to the backend, and how to safely modify it.
>
> **Backend documentation:** `E:/school_app/project_prompt.md`
> **Last updated:** 2026-03-21 (updated for SchoolAdmin ownership model)

---

## 1. Project Overview

### What the System Does
A multi-tenant school management platform for Nepali education (Bikram Sambat dates, Nepali districts/ethnicity/religion fields). Multi-role system for School Owners, School Admins, Teachers, Staff, and Students.

### Target Users
- **Owner** — Manages multiple schools across the platform
- **School Admin** — Runs a single school (full CRUD on school data) — tied to the school's official email account (e.g. `admin@sunshine.edu.np`)
- **Teacher** — Marks attendance, views class data
- **Staff** — Non-teaching staff, read-only access
- **Student** — Read-only access to own data

### Framework & Tech Stack
- **Framework:** Next.js 16.1.7 + React 19.2.3
- **Routing:** Next.js App Router with route groups `(auth)`, `owner/`, `school-admin/`, `teacher/`, `staff/`, `student/`
- **State:** Zustand 5.0.12 with localStorage persistence
- **Forms:** React Hook Form 7.71 + Zod 4.3 + `@hookform/resolvers`
- **HTTP:** Axios 1.13 with interceptors for JWT
- **Styling:** Tailwind CSS v4 (dark theme default, oklch color system)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Nepali Dates:** nepali-date-converter
- **Auth Tokens:** JWT (access + refresh), stored in localStorage

---

## 2. Architecture Overview

```
E:/school_frontend/school_web/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Public auth routes (login)
│   │   ├── owner/            # Owner role pages
│   │   ├── school-head/      # School Head role pages
│   │   ├── teacher/          # Teacher role pages
│   │   ├── staff/            # Staff role pages
│   │   └── student/          # Student role pages
│   ├── components/
│   │   ├── layout/           # Role-specific layouts + sidebars
│   │   └── ui/               # shadcn UI primitives
│   ├── lib/
│   │   ├── api.ts            # Axios instance with interceptors
│   │   └── auth.ts           # Token decode, role detection
│   ├── store/
│   │   └── auth.ts           # Zustand auth store
│   └── types/                # TypeScript interfaces
├── proxy.ts                  # Next.js middleware (auth routing)
└── package.json
```

### How Frontend Connects to Backend

```
Frontend (Next.js) ──HTTP/REST──> Django REST API (127.0.0.1:8000/api)
                              <──JWT (Bearer)────  Tokens stored in localStorage
```

- **Base URL:** `process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'`
- **Auth header:** `Authorization: Bearer <access_token>` (set by axios interceptor)
- **Token refresh:** Axios interceptor auto-refreshes on 401, then redirects to `/login` on failure
- **Public routes (no auth):** `/login`, `/forgot-password`

---

## 3. API Layer

### `src/lib/api.ts` — Axios Instance

```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

Request interceptor:
  - Reads access_token from localStorage
  - Sets Authorization: Bearer <token>

Response interceptor (success):
  - Returns response as-is

Response interceptor (401 error):
  - Attempts POST /auth/token/refresh/ with refresh_token
  - If refresh succeeds: updates tokens, retries original request
  - If refresh fails: clears tokens from localStorage, redirects to /login
```

### `src/lib/auth.ts` — Auth Utilities

```typescript
decodeToken(token: string): AuthUser
  - Decodes JWT without verification (assumes valid)
  - Returns: { user_id, email, user_type, is_owner, school_id, school_name, membership_id, roles[], full_name, admission_number, all_memberships[] }

isTokenExpired(token: string): boolean
  - Checks exp claim against Date.now()

getUserRole(): string
  - Returns: 'owner' | 'admin' | 'teacher' | 'principal' | 'vice_principal' | 'staff' | 'student'
  - Priority: is_owner=true → 'owner'; is_admin=true → 'admin'; then roles[] check

getDashboardPath(role: string): string
  - Maps role to: /owner/dashboard, /school-admin/dashboard, /teacher/dashboard, /staff/dashboard, /student/dashboard
```

### `proxy.ts` — Middleware Routing

```typescript
// Cookie-based auth check (NOT localStorage token)
// This is a SEPARATE mechanism from the axios token interceptor

Public routes (no redirect): /login, /forgot-password

Authenticated request → has is_authenticated cookie → allow
Unauthenticated request → redirect to /login
Login page request → has is_authenticated cookie → redirect to /
```

**CRITICAL NOTE:** The proxy.ts cookie check and the axios token check are SEPARATE:
- Login sets `document.cookie = 'is_authenticated=true; path=/'` (client-side)
- Axios interceptor reads from localStorage and sets Bearer header
- If token expires and refresh fails, localStorage is cleared but cookie may remain → stale auth state

---

## 4. Types

### `src/types/auth.ts`
```typescript
interface SchoolMembership {
  id: number
  school_id: number
  school_name: string
  roles: string[]          // Multi-role per school (e.g. ['teacher', 'principal'])
  is_admin: boolean        // True if user is SchoolAdmin (official email account)
  is_active: boolean
  logo?: string
}

interface AuthUser {
  user_id: string
  email: string
  user_type: 'owner' | 'staff' | 'student'
  is_owner: boolean
  is_admin: boolean        // True if current membership is SchoolAdmin
  school_id?: number
  school_name?: string
  membership_id?: number
  roles?: string[]        // Roles for the currently selected school
  full_name?: string
  admission_number?: string
  all_memberships?: { id: number; school_id: number; school_name: string; is_admin: boolean }[]
}

interface LoginCheckResponse {
  user_id: number
  email: string
  password_set: boolean
  email_verified: boolean
  needs_onboard: boolean
  memberships: SchoolMembership[]
}
```

### `src/store/auth.ts` — Zustand Auth Store
```typescript
State: {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  memberships: SchoolMembership[]
  selectedMembership: SchoolMembership | null
}

Persisted to localStorage (accessToken, refreshToken, user)

setTokens(access: string, refresh: string): void
  - Saves to localStorage + store state

setMemberships(memberships: SchoolMembership[]): void
  - Stores user's school memberships

setSelectedMembership(membership: SchoolMembership): void
  - Stores currently selected school context

logout(): void
  - Clears tokens from localStorage + resets membership state
  - Also clears is_authenticated cookie (set by login page)
```

---

## 4a. Authentication Flow (Multi-School + Onboarding)

### Login Page (`src/app/(auth)/login/page.tsx`)

**4-step flow:**

1. **Email step** → POST `/auth/login-check/`
   - Response: `{ password_set, memberships[], needs_onboard }`
   - If `needs_onboard = true` → go to OnboardScreen
   - If `memberships.length > 1` → go to SchoolSelectScreen
   - Otherwise → go to LoginScreen (password or OTP)

2. **OnboardScreen** (first-time login, no password set)
   - Step 2a: Send OTP (purpose: "onboard") → POST `/auth/otp/send/`
   - Step 2b: Verify OTP → POST `/auth/otp/verify/` → receives `{ verified: true, temp_token }`
   - Step 2c: Set password → POST `/auth/onboard/` → receives JWT tokens
   - Redirects to dashboard

3. **SchoolSelectScreen** (multi-school users)
   - Shows list of schools with roles
   - On selection → POST `/auth/select-school/` → receives new JWT scoped to selected school
   - Redirects to dashboard

4. **LoginScreen**
   - Password login: POST `/auth/login/` → receives JWT tokens
   - OTP login: POST `/auth/otp/send/` → POST `/auth/otp/verify/`

### Multi-School / Multi-Role Architecture Notes

- A **User** can belong to **multiple schools** simultaneously (one `SchoolMembership` per school).
- Each `SchoolMembership` can have **multiple roles** stored as `roles: string[]` (e.g., `['teacher', 'principal']`).
- `SchoolMembership` has **no single `role` field** — roles are always an array via `StaffRole` entries.
- **School ownership** is via the `SchoolAdmin` model (separate from `StaffRole`). Each school has exactly one `SchoolAdmin` tied to the school's official email.
- **Admin accounts** (official email like `admin@sunshine.edu.np`) have a `SchoolMembership` but **no `Staff` record**. They are institutional accounts, never assigned as class_teacher or subject_teacher.
- `Staff` model is **employment details only** (no email/phone — those live on the `User` model).
- `StaffDetail` includes `email` and `phone` as **read-only fields** from the related `User`.
- Staff form creates/updates use **separate address components** (province, district, municipality, ward_no) — NOT a single `address` field.
- `ClassTeacherAssignment` and `SubjectTeacherAssignment` use `membership` FK (not `staff` FK) to reference the staff member.
- `target_staff` in Notice uses `Staff` FK directly.
- **`school_head` is NOT a role** — it was removed from `StaffRole.ROLE_CHOICES`. School ownership uses the `SchoolAdmin` table.
- **Principal/vice_principal are badges only** — no special permissions, no attendance date exemption.
- **Attendance date restriction**: SchoolAdmin → any date; ClassTeacher/SubjectTeacher → today only.

> **IMPORTANT — Backward Compatibility Principle:**
> New authentication features (e.g., email verification, OTP onboarding) must **never break existing users**.
> `needs_onboard` is based **only** on whether a password is set — never on `email_verified`.
> All existing users with passwords must be treated as verified. When adding new auth fields,
> always default to `True` for existing records or handle the old `False`/`null` state gracefully.

### Backend Auth Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login-check/` | POST | No | Check user status + schools + `needs_onboard` |
| `/auth/login/` | POST | No | Password login |
| `/auth/otp/send/` | POST | No | Send OTP (purposes: login, onboard, password_reset, phone_verify) |
| `/auth/otp/verify/` | POST | No | Verify OTP, returns JWT or temp_token |
| `/auth/onboard/` | POST | No | Set password after OTP verification (first-time users only) |
| `/auth/select-school/` | POST | Yes | Switch active school, re-issue scoped JWT |
| `/auth/memberships/` | GET | Yes | List all user's schools + roles |
| `/auth/profile/` | GET/PUT | Yes | User profile |
| `/auth/logout/` | POST | Yes | Blacklist refresh token |
| `/auth/change-password/` | POST | Yes | Change password |
| `/auth/reset-password/` | POST | No | Reset via OTP |

### JWT Claims (membership-aware)
```json
{
  "user_id": 3,
  "email": "sita@school.com",
  "user_type": "staff",
  "is_owner": false,
  "is_admin": false,
  "school_id": 1,
  "school_name": "Sunshine Academy",
  "membership_id": 2,
  "roles": ["principal", "teacher"],
  "full_name": "Sita Thapa",
  "all_memberships": [
    { "id": 2, "school_id": 1, "school_name": "Sunshine Academy", "is_admin": false }
  ]
}
```

### `src/types/leave.ts`
```typescript
// CRITICAL: Uses from_date_ad / to_date_ad (NOT from_date)
interface LeaveRequest {
  id: number
  student_name: string
  student_id: number
  from_date_ad: string   // Canonical field for display and calculations
  to_date_ad: string
  from_date_bs?: string
  to_date_bs?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  applied_on: string     // NOT applied_at
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  total_days: number     // Computed property - DO NOT send in POST
  section?: { id: number; class: string; section: string }
  parent_name?: string
  parent_phone?: string
}
```

### `src/types/student.ts`
```typescript
interface Guardian {
  id: number
  full_name: string
  relation: string
  phone: string
  email?: string
  occupation?: string
  citizenship_no?: string  // Field exists but may not always be populated
  is_primary: boolean
}

interface PreviousSchool {
  id: number
  school_name: string
  address?: string
  last_class?: string
  leaving_date?: string   // Year string (e.g. "2023"), formatted as YYYY-01-01 when sending
  tc_number?: string
  reason_for_leaving?: string
}
```

### `src/types/attendance.ts`
```typescript
interface AttendanceSummary {
  date: string
  total_sections: number
  submitted: number
  pending: number       // NOT "total_sections - submitted" - it's a separate API field
  total_present: number
  total_absent: number
  percentage: number
}

interface SectionAttendance {
  id: number
  section: string
  class: string
  academic_year: string
  total_students: number
  present: number
  absent: number
  percentage: number
  submitted: boolean
  submitted_at?: string
  marked_by?: string
}
```

---

## 5. Role-Based Access

| Role | Dashboard | Can Create Schools | Can Manage Staff | Can Manage Students | Can Mark Attendance |
|------|-----------|-------------------|-----------------|--------------------|--------------------|
| owner | /owner/dashboard | Yes | Yes (all schools) | Yes (all schools) | No |
| admin | /school-admin/dashboard | No | Yes (own school) | Yes (own school) | Any date |
| teacher | /teacher/dashboard | No | No | No | Today only |
| staff | /staff/dashboard | No | No | No | No |
| student | /student/dashboard | No | No | No | No (view own) |

---

## 6. Pages & API Endpoints

### Owner Pages (`/owner/`)

| Page | HTTP Methods | Endpoints Used |
|------|-------------|----------------|
| dashboard | GET | `/schools/?limit=5`, `/notices/?limit=5` |
| schools | GET | `/schools/` |
| schools/new | POST | `/schools/` |
| schools/[id] | GET, DELETE | `/schools/${id}/` |
| schools/[id]/edit | GET, PATCH | `/schools/${id}/` |
| staff | GET | `/staff/` |
| students | GET | `/students/` |
| notices | GET | `/notices/` |
| reports | — | None (placeholder) |
| settings | — | None (read-only) |

### School Head Pages (`/school-head/`)

| Page | HTTP Methods | Endpoints Used |
|------|-------------|----------------|
| dashboard | GET | `/schools/${schoolId}/dashboard/`, `/staff/`, `/students/`, `/notices/`, `/daily-attendance/summary/`, `/holidays/`, `/leave-requests/?status=pending` |
| staff | GET (paginated) | `/staff/` |
| staff/new | POST | `/staff/check-user/`, `/staff/add-existing-user/`, `/staff/`, `/staff/${id}/roles/` |
| staff/[id] | GET, PATCH, DELETE | `/staff/${id}/`, `/staff/${id}/roles/`, `/staff/${id}/membership/`, `/class-teachers/`, `/subject-teachers/` |
| students | GET (paginated) | `/students/` |
| students/new | POST | `/students/` |
| students/[id] | GET, PATCH | `/students/${id}/`, `/students/${id}/guardians/`, `/students/${id}/previous-school/` |
| students/enroll | GET, POST | `/academic-years/`, `/classes/`, `/sections/`, `/students/`, `/enrollments/`, `/enrollments/` |
| promotions | GET, POST | `/academic-years/`, `/classes/`, `/sections/`, `/enrollments/`, `/students/${id}/`, `/promotions/bulk-promote/` |
| classes | CRUD | `/academic-years/`, `/classes/`, `/sections/`, `/subjects/` (+ nested endpoints) |
| attendance | GET | `/academic-years/`, `/daily-attendance/summary/`, `/daily-attendance/` |
| notices | GET, PATCH | `/notices/` |
| notices/new | POST | `/notices/` |
| notices/[id] | GET, PATCH, DELETE | `/notices/${id}/` |
| holidays | GET, DELETE | `/holidays/` |
| holidays/new | POST | `/holidays/` |
| leaves | GET | `/leave-requests/` |
| leaves/[id] | GET, POST | `/leave-requests/${id}/`, `/leave-requests/${id}/approve/`, `/leave-requests/${id}/reject/` |
| subject-assignments | GET, POST, DELETE | `/academic-years/`, `/classes/`, `/sections/`, `/subjects/`, `/staff/`, `/subject-teachers/`, `/class-teachers/` |
| reports | — | None (placeholder) |
| settings | — | None (read-only) |

### Teacher Pages (`/teacher/`)

| Page | HTTP Methods | Endpoints Used |
|------|-------------|----------------|
| dashboard | GET | `/my-classes/`, `/notices/?limit=5`, `/leave-requests/?status=pending&limit=5` |
| classes | GET | `/my-classes/`, `/my-subjects/` |
| attendance | GET, POST | `/my-classes/`, `/sections/${id}/students/`, `/daily-attendance/bulk-mark/` |
| students | GET | `/my-students/` |
| notices | GET | `/notices/` |
| leaves | GET, PATCH | `/leave-requests/`, `/leave-requests/${id}/` (status update) |
| reports | — | None (placeholder) |
| settings | — | None |

### Staff Pages (`/staff/`)

| Page | HTTP Methods | Endpoints Used |
|------|-------------|----------------|
| dashboard | GET | `/notices/?limit=5`, `/leave-requests/?status=pending&limit=5` |
| notices | GET | `/notices/` |
| leaves | GET, POST | `/leave-requests/my/`, `/leave-requests/` |
| settings | — | None |

### Student Pages (`/student/`)

| Page | HTTP Methods | Endpoints Used |
|------|-------------|----------------|
| dashboard | GET | `/my-attendance/?limit=30`, `/notices/?limit=5` |
| attendance | GET | `/daily-attendance/my/` |
| notices | GET | `/notices/` |
| leaves | GET, POST | `/leave-requests/my/`, `/leave-requests/my/` |
| subjects | GET | `/my-subjects/` |
| profile | — | None (reads from auth store only) |
| reports | — | None (placeholder) |
| settings | — | None |

---

## 7. Critical Field Naming Rules

### Leave Requests — USE `from_date_ad` / `to_date_ad`

The backend `LeaveRequest` model has:
- `from_date_ad` — DateField (canonical, use for ALL API calls)
- `to_date_ad` — DateField (canonical)
- `from_date_bs` — CharField (optional, Nepali date)
- `to_date_bs` — CharField (optional, Nepali date)
- `applied_on` — DateTimeField (NOT `applied_at`)
- `total_days` — Computed `@property` (DO NOT send in POST body)

**CORRECT:**
```typescript
await api.post('/leave-requests/', {
  from_date_ad: '2026-03-15',
  to_date_ad: '2026-03-20',
  reason: 'Family function',
})
```

**WRONG (will fail):**
```typescript
// Using from_date instead of from_date_ad
await api.post('/leave-requests/', {
  from_date: '2026-03-15',  // ❌ Wrong field name
  to_date: '2026-03-20',    // ❌ Wrong field name
  reason: '...',
})
```

### Attendance Bulk Mark

```typescript
await api.post('/daily-attendance/bulk-mark/', {
  section: sectionId,           // Section ID (number)
  date_ad: '2026-03-19',       // ISO date string
  records: [
    { enrollment_id: 1, status: 'present' },   // enrollment_id, NOT student_id
    { enrollment_id: 2, status: 'absent' },
    { enrollment_id: 3, status: 'leave' },
  ],
})
```

Valid status values: `'present'`, `'absent'`, `'leave'`, `'holiday'`

### Guardian Form Fields

```typescript
// All fields used in guardian form:
full_name, relation, phone, email, occupation, citizenship_no, is_primary
```

### Previous School `leaving_date`

The `leaving_date` is sent as a year string (e.g., `"2023"`), formatted as `YYYY-01-01` when posting:
```typescript
leaving_date: data.leaving_date ? `${data.leaving_date}-01-01` : null
```

### Class Teacher Assignment POST

Uses `membership` FK (not `staff`):
```typescript
await api.post('/class-teachers/', {
  membership: staffId,
  section: sectionId,
})
```

### Subject Teacher Assignment POST

Requires `academic_year` and `membership` (not `staff`):
```typescript
await api.post('/subject-teachers/', {
  membership: staffId,       // FK to Staff model via membership
  subject: subjectId,
  section: sectionId,
  academic_year: academicYearId,  // Required for proper filtering
})
```

---

## 8. Common Patterns

### Forms (React Hook Form + Zod)
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

function MyForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  })
  // ...
}
```

### Role-based Redirect After Login
```typescript
const role = getUserRole(decodeToken(accessToken))
const dashboardPath = getDashboardPath(role)
router.push(dashboardPath)
```

### School-Scoped API Calls
```typescript
// Most school-head pages use:
const schoolId = user?.school_id || 1  // ⚠️ Falls back to 1 if undefined

// Then in API calls:
api.get('/staff/', { params: { school: schoolId } })
```

### Paginated List Response Handling
```typescript
// API returns: { results: [...], count: N, total_pages: M }
const data = response.data.results || response.data
setItems(data)
```

### Date Display Formatting
```typescript
// Backend returns ISO strings: "2026-03-19"
// Display as:
new Date(dateStr).toLocaleDateString()  // "3/19/2026" or locale-appropriate
```

---

## 9. Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Axios instance, interceptors, base URL |
| `src/lib/auth.ts` | JWT decode, role detection, dashboard routing |
| `src/store/auth.ts` | Zustand store, token persistence |
| `src/proxy.ts` | Next.js middleware, cookie-based auth routing |
| `src/types/leave.ts` | `LeaveRequest` type — CRITICAL for correct field names |
| `src/app/(auth)/login/page.tsx` | Login flow, sets auth cookie |
| `src/components/layout/*-layout.tsx` | Role-specific layout wrappers |
| `src/components/layout/*-sidebar.tsx` | Role-specific sidebar navigation |

---

## 10. Environment & Setup

### Required Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000/api` | Backend base URL |

### Running the Frontend

```bash
cd E:/school_frontend/school_web
npm run dev     # Development server on localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

### Running the Backend (for development)

```bash
cd E:/school_app
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python manage.py runserver  # Runs on 127.0.0.1:8000
```

---

## 11. Known Issues & Pitfalls

### Auth Cookie / localStorage Mismatch (CRITICAL)
The proxy.ts middleware checks `is_authenticated` cookie, but axios uses localStorage token. If refresh fails, localStorage is cleared but cookie may remain. Workaround: `logout()` in store clears both.

### `schoolId` Fallback to Hardcoded `1`
Many school-head pages use `user?.school_id || 1`. If the JWT doesn't contain `school_id`, requests hit school ID 1. Always ensure the JWT contains `school_id` for non-owner users.

### Dynamic Tailwind Classes Don't Work
```typescript
// This DOES NOT work in Tailwind:
className={`bg-${color}-500`}

// Must use full static classes:
className="bg-red-500"  // Works
```

### Reports Pages Are All Placeholders
`/owner/reports`, `/school-head/reports`, `/teacher/reports`, `/student/reports` all show "Coming Soon" — no real implementation.

### Settings Pages Don't Save
All settings pages (`/school-head/settings`, `/teacher/settings`, etc.) display read-only data. Save buttons have no handlers.

### `student/profile` Reads From Store Only
The student profile page does not call any API — it only reads from the auth Zustand store. Full profile data requires API fetch.

### No Error Boundaries
Any API failure shows a browser `alert()` or silently fails. No toast notifications or error UI components.

### OTP Has No Resend Timer
The OTP login tab shows "Use a different email" but no resend countdown timer.

### `enrollment_id` vs `student_id` in Attendance
Teacher attendance bulk-mark sends `{ enrollment_id: s.id }` where `s.id` is the enrollment record ID, NOT the student user ID. The API expects `enrollment_id`.

---

## 12. Backend API Contract Summary

See `E:/school_app/project_prompt.md` for the complete API reference. Key points for frontend:

### Leave Endpoints
- **Student/Staff own leaves:** `/leave-requests/my/` (GET, POST)
- **School Head/Teacher all leaves:** `/leave-requests/` (GET)
- **Approve/Reject:** `POST /leave-requests/${id}/approve/` or `/reject/` (NOT PATCH)
- **Teacher approves:** `PATCH /leave-requests/${id}/` with `{ status }` body

### Attendance Endpoints
- **Mark:** `POST /daily-attendance/bulk-mark/`
- **Student view:** `GET /daily-attendance/my/`
- **Summary:** `GET /daily-attendance/summary/?date=&academic_year=`
- **Section students:** `GET /sections/${id}/students/`

### Promotion Endpoints
- **Bulk promote:** `POST /promotions/bulk-promote/`
- **Body:** `{ from_section, to_section, decisions: [{enrollment_id, status, roll_number}] }`

---

## 13. Design System

### Color Themes (per role)
| Role | Primary Color | Sidebar Theme |
|------|--------------|---------------|
| owner | Purple `#a855f7` | Purple gradient |
| admin | Blue `#3b82f6` | Blue gradient |
| teacher | Green `#22c55e` | Green gradient |
| staff | Cyan `#06b6d4` | Cyan gradient |
| student | Amber `#f59e0b` | Amber gradient |

### Component Library
- UI primitives: `src/components/ui/` (Button variants via CVA)
- Layouts: `src/components/layout/*-layout.tsx`
- Sidebars: `src/components/layout/*-sidebar.tsx`

### Typography
- Font: Geist (Next.js default)
- Dark theme: `bg-[#0a0a0f]` body, zinc-900/60 cards
- All text: white/zinc scale

---

## 22. Build, Lint, and Test Commands

### Running the Application
```bash
cd E:/school_frontend/school_web
npm run dev
```

### TypeScript
```bash
# Typecheck (no emit)
npx tsc --noEmit

# Run single test file
npx jest --testPathPattern=<pattern>
# or
npm test -- --testPathPattern=<pattern>
```

### ESLint
```bash
# Lint src directory
npx eslint src/

# Fix auto-fixable issues
npx eslint src/ --fix
```

### Build
```bash
# Production build
npm run build

# Start production server
npm start
```

---

## 23. Code Style Guidelines

### TypeScript/React
- **Imports:** Use absolute paths via `@/` alias (e.g., `import Button from '@/components/ui/Button'`)
- **Formatting:** ESLint + Prettier configured. Run `npx eslint src/` before commits.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components, `SCREAMING_SNAKE_CASE` for constants
- **Types:** Define interfaces in `src/types/`. Avoid `any`. Use optional chaining (`?.`) and nullish coalescing (`??`) for safety.
- **State:** Use Zustand for global state (`src/store/`), React `useState` for local UI state
- **API:** Use the centralized `api` instance from `@/lib/api` with JWT interceptors

### Component Patterns
- Use functional components with TypeScript
- Prefer composition over inheritance
- Keep components small and focused
- Use proper prop typing with interfaces

### Security
- Never log sensitive data (passwords, tokens)
- Use environment variables for API keys
- Validate user input on both client and server

---

*Document version: 1.3 — Updated 2026-03-21 (SchoolAdmin ownership model: school_head removed, SchoolAdmin table replaces StaffRole.school_head, is_admin in JWT/tokens/types, admin role in frontend)*
