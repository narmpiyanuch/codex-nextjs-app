# Booking Demo Feature Documentation

เอกสารนี้อธิบาย feature ที่ทำไปแล้วในโปรเจกต์ booking demo และเป็น guideline สำหรับ agent ในอนาคตเวลาเพิ่ม feature ใหม่ เพื่อให้วางแผน generate code ได้สอดคล้องกับ architecture, UI style, data model, และ test coverage ปัจจุบัน

## Project Snapshot

โปรเจกต์นี้เป็น Next.js App Router app สำหรับ booking meeting room หลังจาก user login/register แล้วจะเข้าสู่ dashboard ที่มี booking list, calendar, room discovery, schedule page, modal สำหรับจัดการ booking และ Playwright E2E tests

### Tech Stack

| Area | Current Choice |
| --- | --- |
| Framework | Next.js `16.2.5` App Router |
| React | React `19.2.4` |
| Auth | Auth.js / NextAuth beta with Credentials provider |
| Database | Prisma + SQLite |
| Styling | Tailwind CSS v4 + CSS variables in `src/app/globals.css` |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright |

### Important Next.js Note

โปรเจกต์นี้มี `AGENTS.md` ระบุว่า Next.js version นี้มี breaking changes และควรอ่าน docs ใน `node_modules/next/dist/docs/` ก่อนแก้ code ที่เกี่ยวกับ Next APIs

ก่อนแก้ page, routing, server actions, Link, redirects, หรือ App Router behavior ให้เช็ค docs ที่เกี่ยวข้องก่อนเสมอ

### Design References

ใช้ Figma file นี้เป็น primary UI pattern reference ก่อนเพิ่มหรือแก้ dashboard feature:

- Booking demo Figma: https://www.figma.com/design/yQhO9k3J3ncwzyqT8KqaS2/booking-demo?node-id=0-1&t=UYTtPLvH4SyZUeRj-1

เวลา agent เพิ่ม feature ใหม่ ควรเทียบกับ Figma reference นี้ก่อนตัดสินใจเรื่อง layout, spacing, card treatment, color tone, modal behavior, icon style, และ dashboard visual hierarchy

ถ้าต้อง inspect design ผ่าน Figma MCP ให้ใช้ node `0:1` เป็นจุดเริ่มต้น แล้วค่อยเจาะ node ย่อยตาม feature ที่เกี่ยวข้อง

## Implemented Features

## 1. Authentication Flow

### User Story

User สามารถ register account ใหม่, login ด้วย email/password, เข้า dashboard ที่ protected และ logout ได้

### Current Behavior

- Register page อยู่ที่ `/register`
- Login page อยู่ที่ `/login`
- Protected dashboard routes อยู่ใต้ `/dashboard`
- ถ้ายังไม่ login แล้วเข้า `/dashboard` จะถูก redirect ไป login
- ถ้า login แล้วเข้า `/login` หรือ `/register` จะถูก redirect ไป dashboard
- Register สำเร็จแล้ว auto sign in เข้า `/dashboard`
- Logout เรียก server action แล้วกลับไป `/login`

### Main Files

| File | Responsibility |
| --- | --- |
| `src/auth.ts` | NextAuth config, Credentials provider, authorized callback |
| `src/lib/auth.ts` | User lookup and create user logic |
| `src/lib/password.ts` | Password hash/verify |
| `src/lib/validations/auth.ts` | Zod schemas for login/register |
| `src/app/register/actions.ts` | Register server action |
| `src/app/login/actions.ts` | Login server action |
| `src/components/auth/register-form.tsx` | Register client form |
| `src/components/auth/login-form.tsx` | Login client form |
| `middleware.ts` | Auth middleware export |

### Data Model

Auth ใช้ Prisma models มาตรฐานของ Auth.js:

- `User`
- `Account`
- `Session`
- `VerificationToken`

`User` มี field `password` สำหรับ Credentials login และ relation `bookings`

### Tests

| Test Type | File |
| --- | --- |
| Unit | `src/lib/auth.test.ts` |
| Unit | `src/lib/password.test.ts` |
| Unit | `src/lib/validations/auth.test.ts` |
| E2E | `e2e/auth-dashboard.spec.ts` |

## 2. Main Dashboard

### User Story

หลัง login/register user เข้าหน้า main dashboard เพื่อดู booking list, calendar, room highlight, recent activity และสร้าง booking ใหม่ได้

### Current Behavior

- Main dashboard route: `/dashboard`
- ใช้ server page โหลด session และ `getDashboardData`
- ส่ง `dashboardData`, `userName`, `userEmail` เข้า client component `BookingDashboard`
- Top navigation แสดง:
  - Reserve logo
  - Find a Room
  - My Bookings
  - Schedule
  - Create Booking
  - `Sign in as [Name]`
  - Logout icon
- Dashboard มี view switcher ระหว่าง List และ Calendar
- มี CTA `Book a Room`

### Main Files

| File | Responsibility |
| --- | --- |
| `src/app/dashboard/page.tsx` | Server page, auth guard, loads dashboard data |
| `src/components/dashboard/booking-dashboard.tsx` | Main dashboard client UI and booking interactions |
| `src/components/dashboard/booking-top-navigation.tsx` | Shared top navigation |
| `src/components/dashboard/icons.tsx` | Inline SVG icon set |
| `src/lib/dashboard-data.ts` | Client-safe data types and mock collaborator options |
| `src/lib/booking.ts` | Server-side booking/dashboard data layer |

### UI Decisions

- Design follows Figma-inspired booking dashboard style
- Rounded cards, soft borders, high-contrast red/green accents
- CSS variables live in `src/app/globals.css`
- Icons are internal inline SVG components, not currently Google icon package
- Bell and help icons were removed from top navigation and replaced by `Sign in as [Name]`

## 3. Booking List

### User Story

User สามารถดู upcoming bookings ใน table, กด view เพื่อดูรายละเอียด และกด cancel ได้ถ้า booking ยังไม่ถึงวันที่จอง

### Current Behavior

- Table แสดง Room Name, Date, Time, Booking Title, Actions
- `View` เปิด booking information modal
- `Cancel` แสดงเฉพาะ booking ที่ยัง cancel ได้
- Booking ที่ cancel แล้วจะไม่แสดงใน active list เพราะ query ตอนนี้กรอง `status: "CONFIRMED"`

### Main Component

`UpcomingBookingsTable` ใน `src/components/dashboard/booking-dashboard.tsx`

### Important Rules

- Cancel ได้เฉพาะ booking ที่ `status === "CONFIRMED"` และ `dateISO > todayISO`
- `todayISO` ปัจจุบัน fixed ที่ `2026-05-07` ใน `src/lib/booking.ts` สำหรับ prototype/demo behavior

## 4. Booking Calendar

### User Story

User สามารถดู booking events ใน calendar, กด event เพื่อเปิด booking information modal และเปลี่ยนเดือนโดยไม่เด้งขึ้นบนสุดของหน้า

### Current Behavior

- Calendar อยู่ใน section id `#schedule`
- Calendar events แสดงจาก booking ที่อยู่ใน selected month
- กด event ใน calendar เปิด booking information modal
- Prev/Next month links มี `#schedule` ต่อท้าย เช่น `/dashboard?month=2026-06#schedule`
- Schedule page ก็ใช้ anchor behavior เดียวกัน

### Main Component

`BookingCalendar` ใน `src/components/dashboard/booking-dashboard.tsx`

### Main Logic

Calendar data ถูกสร้างจาก `getDashboardData(userId, month)` ใน `src/lib/booking.ts`

Relevant functions:

- `buildCalendarDays(monthDate)`
- `formatCalendarEvent(booking)`
- `shiftMonth(date, amount)`
- `getMonthDate(bookings, month)`

### Tests

E2E test ตรวจว่า:

- Calendar event `Product Roadmap` เปิด modal ได้
- กด next month แล้ว URL มี `#schedule`
- `#schedule` ยังอยู่ใน viewport

## 5. Booking Information Modal

### User Story

User สามารถดูรายละเอียด booking จากทั้ง list และ calendar ใน modal ที่ style เข้ากับ dashboard

### Current Behavior

- เปิดจากปุ่ม `View` ใน list
- เปิดจาก event ใน calendar
- แสดง title, room, date, time, status/note
- ถ้า booking ยังแก้/cancel ได้ จะแสดงปุ่ม:
  - `Edit Booking`
  - `Cancel Booking`
- มีปุ่ม `Close`

### Main Component

`BookingInformationModal` ใน `src/components/dashboard/booking-dashboard.tsx`

### Current Limitation

Modal ยังไม่ได้แสดง invitees จริงจาก Prisma แบบละเอียด แม้ข้อมูล invitees ถูกบันทึกแล้ว ใน note มีระบุว่าสามารถต่อยอดให้แสดง organizer, invitees, equipment, change history ได้

## 6. Create And Edit Booking Modal

### User Story

User สามารถสร้างหรือแก้ไข booking โดยเลือก room, date/time และ invitees หลายคนผ่าน multi-select dropdown

### Current Behavior

- Create เปิดจาก `Book a Room` หรือ `Create Booking`
- Edit เปิดจาก booking information modal
- ใช้ modal เดียวกันโดยแยก mode เป็น `create` หรือ `edit`
- Fields:
  - Meeting Title
  - Select Room
  - Date
  - Start Time
  - End Time
  - Invitees multi-select
- Invitees dropdown ใช้ mock collaborator list จาก `src/lib/dashboard-data.ts`
- Default invitees คือ `Maya Chen`, `Noah Kim`
- สามารถเลือกเพิ่มหรือลบ chip ได้

### Main Component

`CreateBookingModal` ใน `src/components/dashboard/booking-dashboard.tsx`

### Main Client State

`BookingDraft` ใน `BookingDashboard`:

```ts
type BookingDraft = {
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestNames: string[];
};
```

### Validation

Server-side validation ใช้ `bookingInputSchema` ใน `src/lib/validations/booking.ts`

Rules สำคัญ:

- title ต้องมีค่า
- roomId ต้องมีค่า
- date ต้องไม่เป็นอดีต เมื่อเทียบกับ `todayISO`
- endTime ต้องหลัง startTime
- invitees เป็น array ของชื่อ

### Conflict Behavior

- Client มี `hasDraftConflict` เพื่อเตือน potential conflict ใน modal
- Server มี conflict check จริงใน `createBooking` และ `updateBooking`
- ถ้ามี conflict server return message: `This room is already booked during that time.`

## 7. Cancel Booking Flow

### User Story

User สามารถ cancel booking ที่ยังไม่ถึงวันที่จอง และต้อง confirm ก่อน cancel

### Current Behavior

- กด `Cancel` ใน list หรือ `Cancel Booking` ใน information modal
- เปิด `CancelBookingModal`
- Modal แสดง booking title, room, date/time
- กด `Confirm Cancel` แล้ว server action เปลี่ยน status เป็น `CANCELLED`
- UI refresh แล้ว booking หายจาก active list/calendar

### Main Files

| File | Responsibility |
| --- | --- |
| `src/components/dashboard/booking-dashboard.tsx` | Cancel modal and client interaction |
| `src/app/dashboard/actions.ts` | `cancelBookingAction` server action |
| `src/lib/booking.ts` | `cancelBooking` data logic |

## 8. Rooms Page

### User Story

User สามารถ browse rooms, filter/search room และดู availability summary ได้

### Current Behavior

- Route: `/dashboard/rooms`
- Protected by auth
- Uses shared `BookingTopNavigation`
- Loads rooms from `getDashboardData`
- Supports query filters:
  - `availability`
  - `capacity`
  - `q`
- Has filter chips and search form

### Main File

`src/app/dashboard/rooms/page.tsx`

### Current Limitation

ยังไม่มี Playwright tests สำหรับ rooms page filters/search

## 9. Schedule Page

### User Story

User สามารถดู calendar ในหน้า schedule แบบเต็มกว่า dashboard และเปลี่ยนเดือนได้โดยคงตำแหน่ง calendar section

### Current Behavior

- Route: `/dashboard/schedule`
- Protected by auth
- Uses shared `BookingTopNavigation`
- Loads dashboard data with optional `month`
- Prev/Next month links use `#schedule`

### Main File

`src/app/dashboard/schedule/page.tsx`

### Current Limitation

Schedule page ยังไม่ได้เปิด booking modal จาก calendar events แบบ dashboard calendar

## 10. Prisma Booking Data Layer

### Data Models

Booking-related models in `prisma/schema.prisma`:

```prisma
model Room {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      String
  capacity  Int
  floor     String
  amenities String
  image     String
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Booking {
  id        String    @id @default(cuid())
  title     String
  status    String    @default("CONFIRMED")
  startAt   DateTime
  endAt     DateTime
  roomId    String
  userId    String
  room      Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  invitees  Invitee[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Invitee {
  id        String   @id @default(cuid())
  name      String
  email     String?
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

### Main Data Functions

`src/lib/booking.ts` exports:

- `getDashboardData(userId, month?)`
- `createBooking(input)`
- `updateBooking(input)`
- `cancelBooking(input)`
- `canCancelBooking(booking, todayISO)`

### Demo Seed Behavior

- `ensureRooms()` upserts demo rooms
- `ensureDemoBookings(userId)` creates demo bookings per user only if user has zero bookings
- Demo bookings include:
  - Product Roadmap
  - Q4 Strategy Review
  - Design Sprint

### Important Implementation Detail

`src/lib/prisma.ts` has guard logic to avoid reusing an old hot-reloaded Prisma client that does not include new delegates such as `room`, `booking`, `invitee`

## Server Actions

Dashboard server actions live in `src/app/dashboard/actions.ts`

| Action | Purpose |
| --- | --- |
| `createBookingAction` | Validate auth, create booking, revalidate dashboard routes |
| `updateBookingAction` | Validate auth, update booking, revalidate dashboard routes |
| `cancelBookingAction` | Validate auth, cancel booking, revalidate dashboard routes |
| `logoutAction` | Sign out and redirect to login |

When adding feature that mutates dashboard data, keep this pattern:

1. Validate session with `auth()`
2. Call data-layer function in `src/lib/*`
3. Return `{ error }` on failure
4. `revalidatePath` affected pages
5. Return success message or data

## Styling And UI Guidelines

### Visual Language

Current booking UI uses:

- White cards with subtle borders
- Large rounded corners
- Red brand accent for primary booking actions
- Green accent for positive states
- Soft pink/rose alert backgrounds
- Dark cards for recent activity or informational blocks
- Background orbs and room hero imagery via CSS classes

### CSS Location

Global booking styles live in:

`src/app/globals.css`

Common class patterns:

- `booking-shell`
- `booking-canvas`
- `booking-primary-button`
- `booking-pill-button`
- `booking-icon-button`
- `booking-calendar-arrow`
- `booking-input`
- `booking-danger-button`
- `booking-room-thumb-*`
- `booking-room-hero-*`

### Future UI Rule

If adding a new dashboard feature, preserve the established Figma-inspired style instead of introducing a separate visual system

## Testing Strategy

### Unit Tests

Current unit tests use Vitest

Run:

```bash
npm run test:run
```

Current focus:

- Auth validation
- Auth create user logic
- Password hash/verify
- Booking validation

### E2E Tests

Current E2E tests use Playwright

Run:

```bash
npm run test:e2e
```

Detailed E2E scenarios are documented in:

`docs/playwright-test-scenarios.md`

### Build And Lint

Before finishing feature work, run:

```bash
npm run lint
npm run test:run
npm run test:e2e
npm run build
```

Known lint warning:

- There is an existing unrelated warning in `tmp/slides/web-details-deck/build/build_deck.mjs` about unused `WHITE`

## Agent Implementation Plan For Future Features

When adding a new feature, future agents should follow this sequence

### 1. Understand The Feature

Write down:

- User story
- Entry point route/page/component
- Data needed
- Mutations needed
- Success state
- Error state
- Permissions/auth requirements

### 2. Locate Existing Pattern

Use nearest existing implementation as template:

| New Feature Type | Start From |
| --- | --- |
| Dashboard UI card | `BookingDashboard`, `SmartBookingCard`, `RecentActivityCard` |
| Table action | `UpcomingBookingsTable` |
| Modal | `CreateBookingModal`, `BookingInformationModal`, `CancelBookingModal` |
| Server mutation | `src/app/dashboard/actions.ts` + `src/lib/booking.ts` |
| Data type | `src/lib/dashboard-data.ts` |
| Prisma model change | `prisma/schema.prisma` + `npm run db:push` |
| E2E flow | `e2e/booking-flow.spec.ts` |

### 3. Update Data Model If Needed

If feature needs persisted data:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push`
3. Update Prisma data functions in `src/lib/*`
4. Update client-safe types in `src/lib/dashboard-data.ts`
5. Add or update validation schema in `src/lib/validations/*`

### 4. Add Server Action If Mutating Data

Follow existing dashboard actions pattern:

```ts
const session = await auth();

if (!session.user?.id) {
  return { error: "You must be signed in." };
}

const result = await someDataFunction({ userId: session.user.id, ...input });

if (!result.ok) {
  return { error: result.message };
}

revalidatePath("/dashboard");
```

### 5. Implement UI

Use existing dashboard styles and components:

- Prefer accessible buttons, links, labels
- Keep modal `role="dialog"` and `aria-modal="true"`
- Use `BookingTopNavigation` for dashboard sub-pages
- Reuse `Icon` component when possible
- Keep UI responsive with Tailwind classes used elsewhere

### 6. Add Tests

Minimum expected coverage for a new feature:

- Unit test for validation or pure data logic
- Playwright test for user-facing flow if feature changes browser behavior
- Add scenario description to `docs/playwright-test-scenarios.md` if E2E test added

### 7. Update Documentation

When feature is complete, update this document with:

- User story
- Current behavior
- Main files
- Data model changes
- Test coverage
- Known limitations
- Suggested next improvements

## Feature Documentation Template

Use this template when adding a new section to this document

```md
## Feature Name

### User Story

As a [user type], I want to [action] so that [benefit].

### Current Behavior

- Behavior 1
- Behavior 2
- Behavior 3

### Main Files

| File | Responsibility |
| --- | --- |
| `path/to/file.tsx` | What it does |

### Data Model

- Model or fields used
- Important relationships

### Server Actions / API

- Action name or route
- Input
- Output
- Error behavior

### UI Notes

- Visual style
- Accessibility notes
- Responsive behavior

### Tests

- Unit test file
- E2E test file
- Manual test command

### Known Limitations

- Limitation 1
- Limitation 2

### Future Improvements

- Improvement 1
- Improvement 2
```

## Recommended Next Features

Potential features that fit current architecture:

1. Show invitees in booking information modal
2. Add organizer metadata and booking owner display
3. Add room equipment details in modal
4. Add change history for booking edits/cancellations
5. Add schedule page event click modal
6. Add rooms page E2E filter/search tests
7. Add conflict suggestion flow when room is unavailable
8. Add recurring booking support
9. Add email/calendar invite mock flow
10. Add role-based access for admin room management

## Quick Reference

### Useful Commands

```bash
npm run dev
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm run db:push
```

### Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Main booking dashboard |
| `/dashboard/rooms` | Room discovery |
| `/dashboard/schedule` | Schedule calendar |

### Important Docs

| File | Purpose |
| --- | --- |
| `docs/feature-documentation.md` | Feature overview and future agent implementation guide |
| `docs/playwright-test-scenarios.md` | E2E scenario and test case documentation |
| `AGENTS.md` | Repo-specific agent instructions |
