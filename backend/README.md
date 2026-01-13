Role-based Backend

Quick start:

1. Copy `.env.example` to `.env` and set DB credentials.
2. Install dependencies:

```bash
npm install
```

3. Run in dev:

```bash
npm run dev
```

API endpoints:
- POST /api/auth/login { email, password }
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/users (manager+)
- POST /api/users (admin+)
- PUT /api/users/:id (admin+)
- DELETE /api/users/:id (admin+)

Notes: This scaffold uses sessions (express-session + Sequelize store), bcrypt for password hashing and basic rate limiting + helmet.
