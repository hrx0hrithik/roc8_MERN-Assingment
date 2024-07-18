# Roc8 Moonshot Assigment

### E-Commerce

## Learning

- trpc
- prisma

## Work done
### Prisma
- Creating schema for User
  - Storing user data like email, password and name
- Creating schema for Categories
   - Storing 100 categories from fakerjs.dev
   - Use prisma/seed.ts to run once for seeding 100 values to categories in DB.
- Creating schema for UserCategory
   - As embedding many-to-many relations are not supported on Postgres.

### trpc
- Creating routes for users as users.ts
  - creating 2 public procedure for Login and Signup

### Using bcrypt and JWT
- Using bcrypt and jsonwebtoken for security purpose 