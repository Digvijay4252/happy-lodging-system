# Happy Lodging System (Full Stack Hotel Management)

Full stack Hotel Management Web App using:
- Frontend: Angular (standalone architecture)
- Backend: Node.js + Express.js
- Database: MySQL + Sequelize ORM
- Auth: JWT + bcrypt
- Styling: Bootstrap
- AI Integration: OpenAI API (chatbot, recommendations, sentiment, revenue prediction helpers)
- Food Module: Daily meal menu + meal orders (Admin/Staff/Customer)

## Project Explanation

Happy Lodging System is a role-based hotel operations platform that handles the complete hotel workflow from room discovery to post-stay services.

### What this project solves
- Centralizes booking, check-in/check-out, room status management, tickets/issues, and customer feedback.
- Separates access by role so each user sees only relevant actions.
- Adds AI assistant support for hotel FAQs, booking guidance, and recommendation helpers.
- Adds a food booking workflow where hotel staff/admin manage menus and customers place meal orders tied to valid bookings.

### How the system works (high-level)
1. User authenticates via JWT (admin/staff/customer).
2. Customer searches rooms, books, pays (simulation), tracks bookings, and can raise issues/feedback.
3. Staff handles check-in/check-out, room status updates, and service tickets.
4. Admin monitors dashboard metrics, manages rooms/bookings/staff/customers, and reviews reports.
5. Food module runs daily menus (Breakfast/Lunch/Dinner), supports auto carry-forward from previous day, and allows customer meal ordering only within active booking dates.
6. AI endpoints support chatbot and analysis features integrated in the UI.

### Architecture summary
- Frontend: Angular standalone feature modules with route guards and reusable services/components.
- Backend: Express REST APIs with Sequelize models/controllers/routes and middleware for auth/RBAC/error handling.
- Database: MySQL schema aligned with Sequelize model definitions.
- Security: bcrypt password hashing + JWT auth + role middleware.

## Project Structure

```txt
happy-lodging-system/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seeders/
      services/
      utils/
      validators/
    schema.sql
    package.json
  frontend/
    src/
      app/
        core/
        features/
        shared/
      environments/
      index.html
      main.ts
      styles.css
    angular.json
    package.json
```

## Backend Setup

1. Go to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` from `.env.example` and set DB + JWT + OpenAI keys.

4. Ensure MySQL database exists:
```sql
CREATE DATABASE IF NOT EXISTS happy_lodging;
```

5. Run server:
```bash
npm run dev
```

### Auto Table Creation (Sequelize)
Tables auto-create from model definitions on server start:
- `backend/src/server.js` runs:
```js
await db.sequelize.sync({ alter: false });
```

This follows your required model pattern:
```js
module.exports = (sequelize, DataTypes) => {
  const table = sequelize.define('table_name', { ... }, { ... });
  return table;
};
```

### Optional SQL Creation File
- Use `backend/schema.sql` for manual SQL table creation (if needed).

### Seed Dummy Data
```bash
npm run seed
```

Default seeded admin:
- email: `admin@hotel.com`
- password: `Admin@123`

## Frontend Setup

1. Go to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start Angular app:
```bash
npm start
```

4. API base URL is in:
- `frontend/src/environments/environment.ts`

## Roles and Access

- Admin
  - Dashboard metrics
  - Manage rooms, bookings, customers, staff
  - Reports
- Staff
  - Check-in / check-out
  - Room status updates
  - Service ticket handling
- Customer
  - Register/login
  - Room search
  - Booking + cancel before check-in
  - Payment simulation
  - Booking history

## API Endpoints

### Auth
- `POST /api/auth/register` (customer self-register)
- `POST /api/auth/login`
- `POST /api/auth/staff/register` (admin only)

### Rooms
- `GET /api/rooms` (filters: type, minPrice, maxPrice, checkIn, checkOut)
- `GET /api/rooms/:id`
- `POST /api/rooms` (admin)
- `PUT /api/rooms/:id` (admin)
- `DELETE /api/rooms/:id` (admin)
- `POST /api/rooms/:id/images` (admin)

### Customer Bookings
- `POST /api/bookings` (customer)
- `GET /api/bookings/me` (customer)
- `PATCH /api/bookings/:id/cancel` (customer)
- `POST /api/bookings/:id/pay` (customer payment simulation)
- `POST /api/bookings/feedback` (customer)

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/status`
- `GET /api/admin/customers`
- `PATCH /api/admin/customers/:id/toggle-block`
- `GET /api/admin/staff`
- `POST /api/admin/staff`
- `PUT /api/admin/staff/:id`
- `DELETE /api/admin/staff/:id`
- `GET /api/admin/reports`

### Staff
- `PATCH /api/staff/bookings/:id/check-in`
- `PATCH /api/staff/bookings/:id/check-out`
- `PATCH /api/staff/rooms/:id/status`
- `GET /api/staff/tickets`
- `POST /api/staff/tickets`
- `PATCH /api/staff/tickets/:id`

### AI
- `GET /api/ai/recommendations?budget=5000`
- `POST /api/ai/chatbot`
- `GET /api/ai/revenue-prediction`
- `POST /api/ai/sentiment`

### Food Module

#### Admin/Staff
- `GET /api/food/items`
- `POST /api/food/items`
- `PUT /api/food/items/:id`
- `DELETE /api/food/items/:id`
- `GET /api/food/menus?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&meal_slot=Breakfast`
- `POST /api/food/menus/upsert`
- `POST /api/food/menus/carry-forward`
- `GET /api/food/orders`
- `PATCH /api/food/orders/:id/status`

#### Customer
- `GET /api/food/menu?menu_date=YYYY-MM-DD&meal_slot=Breakfast`
- `POST /api/food/orders`
- `GET /api/food/orders/me`
- `PATCH /api/food/orders/:id/cancel`

Sample create/update daily menu:
```json
{
  "menu_date": "2026-03-10",
  "meal_slot": "Breakfast",
  "food_item_ids": [1, 2, 3]
}
```

Sample customer meal order:
```json
{
  "booking_id": 12,
  "order_date": "2026-03-10",
  "meal_slot": "Breakfast",
  "serving_type": "RoomDelivery",
  "notes": "Less spicy",
  "items": [
    { "food_item_id": 1, "qty": 2 },
    { "food_item_id": 3, "qty": 1 }
  ]
}
```

## Database Tables

Implemented tables:
- `users`
- `rooms`
- `room_images`
- `bookings`
- `payments`
- `service_requests`
- `feedbacks`
- `food_items`
- `daily_meal_menus`
- `daily_meal_menu_items`
- `meal_orders`
- `meal_order_items`

All table schemas are in:
- Sequelize models under `backend/src/models`
- SQL file `backend/schema.sql`

## Food Module UI Routes

- Admin: `/admin/food`
- Staff: `/staff/food`
- Customer: `/customer/meals`

## Seed Data (Food Module)

`npm run seed` now also creates:
- sample food items
- today's breakfast/lunch/dinner menus
- sample customer + booking + meal order

## Notes for Production Hardening

- Add request rate limiting
- Add audit logs and centralized logging
- Add DTO-level validation for all endpoints
- Move file upload to cloud storage (S3/GCS)
- Add real payment gateway integration
- Add PDF generation service for reports
- Add unit/integration tests + CI/CD
