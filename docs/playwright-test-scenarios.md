# Playwright Test Scenarios

เอกสารนี้สรุป scenario และ test case สำหรับ Playwright E2E tests ของ booking demo project

## Test Scope

Playwright tests ตอนนี้ครอบคลุม flow หลักหลังจาก user เข้าใช้งานระบบ:

- Authentication smoke flow
- Booking creation flow
- Booking information modal จาก list
- Booking edit flow
- Booking cancel flow
- Booking information modal จาก calendar
- Calendar month navigation ที่ต้องคงตำแหน่งไว้ที่ calendar section

## Test Files

| File | Purpose |
| --- | --- |
| `e2e/auth-dashboard.spec.ts` | ทดสอบ auth smoke flow: register, open dashboard, logout |
| `e2e/booking-flow.spec.ts` | ทดสอบ booking flow หลัก: create, view, edit, cancel, calendar |
| `e2e/helpers/auth.ts` | Helper สำหรับสร้าง test user และ register เข้า dashboard |

## Test Environment

Playwright config อยู่ที่ `playwright.config.ts`

ค่าหลักที่ใช้:

- Browser: Chromium
- Base URL: `http://127.0.0.1:3001`
- Test directory: `e2e/`
- Test database: `prisma/playwright.db`
- Web server command:

```bash
touch prisma/playwright.db && npx prisma db push --skip-generate && npm run dev -- --hostname 127.0.0.1 --port 3001
```

เหตุผลที่ใช้ database แยก:

- ไม่กระทบข้อมูลใน `prisma/dev.db`
- ทำให้ E2E tests สร้าง user และ booking ได้อิสระ
- ลดความเสี่ยงที่ test จะเปลี่ยนข้อมูลระหว่าง development

## Commands

### Run All E2E Tests

```bash
npm run test:e2e
```

หรือ

```bash
npx playwright test
```

### Run Booking Flow Only

```bash
npx playwright test e2e/booking-flow.spec.ts
```

### Run With Browser Visible

```bash
npx playwright test e2e/booking-flow.spec.ts --headed
```

### Run Slowly To Watch The Browser

```bash
npx playwright test e2e/booking-flow.spec.ts --headed --slow-mo=800
```

ถ้าต้องการให้ช้ากว่านี้:

```bash
npx playwright test e2e/booking-flow.spec.ts --headed --slow-mo=1500
```

### Run With Playwright Inspector

เหมาะสำหรับดูทีละ step หรือ debug selector:

```bash
npx playwright test e2e/booking-flow.spec.ts --debug
```

### Run Only One Test Case

Create, view, edit, cancel booking:

```bash
npx playwright test e2e/booking-flow.spec.ts -g "creates, views, edits, and cancels"
```

Calendar modal and anchor behavior:

```bash
npx playwright test e2e/booking-flow.spec.ts -g "opens booking information from the calendar"
```

Auth smoke flow:

```bash
npx playwright test e2e/auth-dashboard.spec.ts
```

## Scenario 1: Auth Smoke Flow

### Objective

ตรวจว่า user สามารถ register เข้า dashboard และ logout กลับไปหน้า login ได้

### Test File

`e2e/auth-dashboard.spec.ts`

### Preconditions

- Next.js dev server พร้อมใช้งานผ่าน Playwright web server
- Test database ถูก sync จาก Prisma schema แล้ว

### Test Steps

1. เปิดหน้า `/register`
2. กรอก Name
3. กรอก Email แบบ unique
4. กรอก Password
5. กด `Create your account`
6. ตรวจว่า redirect ไป `/dashboard`
7. ตรวจว่า link `Reserve` แสดงอยู่
8. ตรวจว่าเห็นข้อความ `Sign in as Playwright User`
9. ตรวจว่าเห็น heading `Upcoming Bookings`
10. กด `Log out`
11. ตรวจว่า redirect ไป `/login`
12. ตรวจว่าเห็น heading `Access your dashboard`

### Expected Result

- User register สำเร็จ
- Dashboard โหลดสำเร็จ
- Session แสดงชื่อ user ถูกต้อง
- Logout สำเร็จและกลับไปหน้า login

## Scenario 2: Create Booking With Invitees

### Objective

ตรวจว่า user สามารถสร้าง booking ใหม่และเลือก invitees หลายคนผ่าน multi-select dropdown ได้

### Test File

`e2e/booking-flow.spec.ts`

### Preconditions

- User register และอยู่ที่ dashboard แล้ว
- มี room options จาก Prisma seed/demo data

### Test Steps

1. กด `Book a Room`
2. ตรวจว่า modal `Create Booking` เปิดขึ้น
3. กรอก Meeting Title แบบ unique
4. เลือก room `The Glass Pavilion`
5. เลือก date/time ที่เป็น future และ unique สำหรับแต่ละ run
6. เปิด invitees dropdown ด้วยปุ่ม `Choose`
7. เลือก `Aria Patel`
8. เลือก `Sara Nguyen`
9. ตรวจว่าแสดง `4 invitees selected`
10. ตรวจว่า chips ของ `Aria Patel` และ `Sara Nguyen` แสดงอยู่
11. กด `Create Booking`
12. ตรวจว่าเห็นข้อความ `Booking created successfully.`
13. ตรวจว่า booking title ใหม่แสดงใน list

### Expected Result

- Booking ถูกสร้างสำเร็จ
- Invitees ที่เลือกถูกเก็บใน form state
- Booking ใหม่แสดงใน upcoming bookings list

## Scenario 3: View Booking Information From List

### Objective

ตรวจว่า user สามารถกด `View` จาก booking list แล้วเห็น booking information modal ได้

### Test File

`e2e/booking-flow.spec.ts`

### Test Steps

1. ใช้ booking ที่สร้างจาก Scenario 2
2. หา row ที่มี booking title นั้น
3. กดปุ่ม `View`
4. ตรวจว่า booking information modal เปิดขึ้น
5. ตรวจว่า modal แสดง room, date, และ time ถูกต้อง

### Expected Result

- Modal เปิดขึ้นจาก list action
- ข้อมูล title, room, date, time ตรงกับ booking ที่สร้างไว้

## Scenario 4: Edit Booking

### Objective

ตรวจว่า user สามารถแก้ไข booking จาก information modal ได้

### Test File

`e2e/booking-flow.spec.ts`

### Test Steps

1. เปิด booking information modal จาก booking list
2. กด `Edit Booking`
3. ตรวจว่า modal `Edit Booking` เปิดขึ้น
4. แก้ Meeting Title
5. แก้ Start Time
6. แก้ End Time
7. กด `Save Changes`
8. ตรวจว่าเห็นข้อความ `Booking updated successfully.`
9. ตรวจว่า booking title ใหม่แสดงใน list

### Expected Result

- Booking update สำเร็จ
- List แสดงข้อมูลใหม่หลังแก้ไข

## Scenario 5: Cancel Booking

### Objective

ตรวจว่า user สามารถ cancel future booking พร้อม confirm modal ได้

### Test File

`e2e/booking-flow.spec.ts`

### Test Steps

1. ใช้ booking ที่แก้ไขจาก Scenario 4
2. หา row ที่มี edited booking title
3. กด `Cancel`
4. ตรวจว่า confirm modal `Cancel this booking?` เปิดขึ้น
5. ตรวจว่า modal แสดง booking title ถูกต้อง
6. กด `Confirm Cancel`
7. ตรวจว่าเห็นข้อความ `Booking cancelled successfully.`
8. ตรวจว่า row ของ booking นั้นไม่อยู่ใน list แล้ว

### Expected Result

- Cancel confirmation modal แสดงถูกต้อง
- Booking ถูก cancel สำเร็จ
- Booking ที่ cancel ไม่แสดงใน active list แล้ว

## Scenario 6: View Booking Information From Calendar

### Objective

ตรวจว่า user สามารถเปิด booking information modal จาก calendar event ได้

### Test File

`e2e/booking-flow.spec.ts`

### Test Steps

1. Register user และเปิด dashboard
2. กด view switcher เป็น `Calendar`
3. Scroll ไปที่ `#schedule`
4. กด event `Product Roadmap` ใน calendar
5. ตรวจว่า booking information modal เปิดขึ้น
6. ตรวจว่า modal แสดงข้อมูล `Sky Lounge - May 12, 2026 - 10:00 AM - 11:30 AM`
7. กด `Close`

### Expected Result

- Calendar event เปิด modal ได้
- Modal แสดงข้อมูล booking ถูกต้อง

## Scenario 7: Calendar Next Month Anchor

### Objective

ตรวจว่าเมื่อกดเปลี่ยนเดือนใน calendar แล้ว browser ยังคงอยู่ที่ calendar section ไม่เด้งขึ้นบนสุด

### Test File

`e2e/booking-flow.spec.ts`

### Test Steps

1. อยู่ที่ dashboard และ scroll ไปที่ `#schedule`
2. กด link `Next month`
3. ตรวจว่า URL มี `month=2026-06#schedule`
4. ตรวจว่า element `#schedule` ยังอยู่ใน viewport

### Expected Result

- URL มี hash `#schedule`
- Calendar section ยังอยู่ใน viewport หลังเปลี่ยนเดือน

## Notes For Future Test Cases

Test cases ที่ควรเพิ่มต่อในอนาคต:

1. Login ด้วย account ที่สร้างไว้แล้ว
2. Validation error ตอน register ด้วย email ซ้ำ
3. Validation error ตอน login password ผิด
4. Create booking conflict แล้วต้องเห็น error `This room is already booked during that time.`
5. Invitees multi-select: remove invitee chip
6. Rooms page filters/search
7. Schedule page calendar navigation
8. Mobile viewport smoke test
9. Accessibility smoke test เช่น focus order และ modal close behavior
10. Visual regression screenshot baseline ถ้าต้องการล็อกหน้าตา UI

## Current Known Warnings

ระหว่างรัน Playwright อาจเห็น warning นี้จาก Next.js:

```text
Detected `scroll-behavior: smooth` on the `<html>` element.
```

ตอนนี้ warning นี้ไม่ทำให้ test fail และไม่ได้กระทบ scenario ที่ตรวจอยู่

## Maintenance Guidelines

- ใช้ role-based selectors เช่น `getByRole`, `getByLabel`, `getByText` เป็นหลัก
- ถ้า UI มีข้อความซ้ำ ให้ใช้ `filter({ hasText })` หรือ `exact: true`
- ใช้ test data แบบ unique เพื่อให้รันซ้ำได้
- หลีกเลี่ยง hard-coded database IDs
- ถ้า test ต้องสร้าง booking ให้เลือก future date เพื่อให้ edit/cancel ได้
- ถ้า selector เริ่มเปราะ ควรเพิ่ม accessible label หรือ test id ใน component แทนการใช้ CSS selector ลึก ๆ
