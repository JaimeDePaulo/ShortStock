# Security Specification - StockMaster ERP

## Data Invariants
1. A Movement must reference a valid Product.
2. A Movement of type 'OUT' cannot exceed the currentStock of the Product (enforced in application logic, but rules should ideally validate integrity).
3. Product prices must be positive.
4. User roles can only be ADMIN or OPERATOR.
5. Users cannot change their own roles.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a user with `role: "ADMIN"` as an unauthenticated user.
2. Updating another user's role.
3. Creating a product with a negative `sellingPrice`.
4. Creating a movement without a `productId`.
5. Creating a movement with a non-existent `type`.
6. Deleting a product as an OPERATOR.
7. Updating a product's price as an OPERATOR.
8. Injecting a 1MB string into a product `code`.
9. Creating a movement with an `id` containing special characters like `../`.
10. Reading all user profiles as an OPERATOR.
11. Modifying a `Movement` date after creation.
12. Listing all `movements` without being authenticated.

## Firestore Rules Plan
- Reusable helpers: `isSignedIn()`, `isValidId()`, `isAdmin()`, `isOwner()`.
- `users/{userId}`: `read` (isOwner(userId) || isAdmin()), `write` (isAdmin() or logic for initial profile creation).
- `products/{productId}`: `read` (isSignedIn()), `write` (isAdmin()).
- `movements/{movementId}`: `read` (isSignedIn()), `create` (isSignedIn()), `update/delete` (isAdmin()).
- `categories`, `suppliers`, `customers`, `invoices`: same as products or movements.
