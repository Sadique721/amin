# Security Audit & Vulnerability Remediation Plan

This document outlines the security vulnerabilities identified during the security audit of the Sanab codebase and provides a step-by-step plan to implement robust fixes for each of them.

---

## 1. Identified Vulnerabilities & Proposed Fixes

### 1.1 Broken Object Level Authorization (BOLA/IDOR) in Order Retrieval

*   **Vulnerability**: The `getOrderById` endpoint (`GET /api/public/orders/:id`) retrieves order details using the provided order ID without verifying if the authenticated user is the owner of that order or an administrator.
*   **Impact**: Any authenticated user can view the details, shipping address, items, and payment info of any other user's order by guessing or obtaining the order's MongoDB ID.
*   **Proposed Fix**:
    Modify the order controller/service to check if the authenticated user's ID matches the owner of the order, or if the user is an admin.

### 1.2 Broken Object Level Authorization (BOLA/IDOR) in Payment Verification

*   **Vulnerability**: The payment verification endpoints (`POST /api/public/orders/verify/cod` and `POST /api/public/orders/verify/razorpay`) process order fulfillment without checking if the user requesting the verification is the owner of the order.
*   **Impact**: A malicious authenticated user can mark any pending COD order as "processing" or bypass/fudge mock payment validations for any order.
*   **Proposed Fix**:
    Require the authenticated user's ID as a parameter to the service methods and enforce that the order belongs to the requesting user before performing the verification.

### 1.3 Admin Session User ID Check Bug (Undefined User in Orders)

*   **Bug / Vulnerability**: In `order.controller.ts`, the user's ID is read as `(req as any).user.sub`. However, the authentication middleware (`auth.middleware.ts`) populates `req.user` with `{ id, role }`.
*   **Impact**: The `userId` variable is evaluated as `undefined` for order creation and order listing. In MongoDB, this saves the order with `user: null` or `user: undefined`. Consequently, querying for user orders with a value of `undefined` leaks orders associated with a null/undefined user to other users.
*   **Proposed Fix**:
    Replace `(req as any).user.sub` with `(req as AuthenticatedRequest).user!.id` in `order.controller.ts`.

### 1.4 Path Traversal in Uploaded File Deletion (Local Storage)

*   **Vulnerability**: In `backend/src/shared/cloudinary/index.ts`, when using local storage, the local asset delete routine converts the `publicId` directly into a filename by removing the `local-` prefix:
    ```typescript
    const fileName = publicId.replace('local-', '');
    const filePath = path.join(process.cwd(), 'storage/uploads', fileName);
    ```
*   **Impact**: An admin can pass a payload like `local-../../package.json` to the delete asset endpoint, causing the server to delete sensitive configuration or source code files outside of the `storage/uploads` directory.
*   **Proposed Fix**:
    Sanitize the file name using `path.basename(fileName)` and validate that the resolved path stays within the `storage/uploads` directory before performing `fs.unlinkSync`.

### 1.5 Weak Password Hashing in Admin Seeding

*   **Vulnerability**: In `backend/src/database/seed.ts`, the local `hashPassword` function hashes the environment-based admin passwords using SHA-256 without a salt:
    ```typescript
    function hashPassword(password: string): string {
      return crypto.createHash('sha256').update(password).digest('hex');
    }
    ```
    However, the authentication service compares passwords using `bcrypt.compare`.
*   **Impact**: The seeded admin cannot log in because the stored SHA-256 hash is incompatible with `bcrypt.compare`. Furthermore, storing unsalted SHA-256 hashes is a weak security practice.
*   **Proposed Fix**:
    Replace the local `hashPassword` function with the shared bcrypt hashing helper imported from `@/shared/auth/password`.

### 1.6 JWT Timing Attack Vulnerability

*   **Vulnerability**: In `backend/src/shared/auth/jwt.ts`, the signature check in `verifyToken` uses a standard string comparison:
    ```typescript
    if (encodedSignature !== expectedSignature) {
    ```
*   **Impact**: Attackers can potentially measure response times to guess the signature character-by-character (timing attack).
*   **Proposed Fix**:
    Convert the signatures to buffers and compare them using `crypto.timingSafeEqual`.

### 1.7 Lack of Rate Limiting on Authentication/OTP Endpoints

*   **Vulnerability**: The rate limiter is currently a no-op placeholder.
*   **Impact**: Attackers can brute-force the 6-digit OTP codes or flood the system with OTP SMS/Email requests (DDoS / financial draining).
*   **Proposed Fix**:
    Implement the `rateLimitMiddleware` in `backend/src/middlewares/rate-limit.middleware.ts` using the `express-rate-limit` library (already present in `package.json`). Apply a strict limit (e.g. 5 requests per 15 minutes) on the OTP send and verify routes, and a general limit on other API endpoints.

### 1.8 Multer File Type Restrictions on Uploads

*   **Vulnerability**: The file upload endpoint in `backend/src/modules/upload/routes/upload.routes.ts` does not restrict the mime-type of uploaded files.
*   **Impact**: Even though restricted to admin access, an attacker who obtains admin credentials could upload malicious files (e.g. `.html` with XSS payloads or executable scripts).
*   **Proposed Fix**:
    Add a `fileFilter` to the Multer configuration to allow only common image mime-types (`image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/gif`).

### 1.9 Permissive CORS Configuration

*   **Vulnerability**: CORS is configured in `app.ts` as `app.use(cors())`, allowing all origins (`*`) by default.
*   **Impact**: Unrestricted cross-origin access.
*   **Proposed Fix**:
    Update `app.ts` to read allowed origins from the environment configuration (`ALLOWED_ORIGINS`) and default to localhost/restricted domains in non-development environments.

---

## 2. Proposed Changes by File

### 2.1 [MODIFY] [app.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/app.ts)
*   Configure CORS with an origin list from `env.ALLOWED_ORIGINS` (or default to `'*'`).
*   Apply the general rate limiter (e.g., 100 requests per 15 minutes) as global middleware.

### 2.2 [MODIFY] [env.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/config/env.ts)
*   Add an optional `ALLOWED_ORIGINS` field to the Zod schema configuration.

### 2.3 [MODIFY] [rate-limit.middleware.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/middlewares/rate-limit.middleware.ts)
*   Implement `rateLimitMiddleware` using `express-rate-limit`.

### 2.4 [MODIFY] [jwt.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/shared/auth/jwt.ts)
*   Implement `crypto.timingSafeEqual` in `verifyToken` for comparing the calculated signature with the incoming token signature.

### 2.5 [MODIFY] [cloudinary/index.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/shared/cloudinary/index.ts)
*   Sanitize the filename in `deleteAsset` using `path.basename` and verify that the target path does not escape the `storage/uploads` directory.

### 2.6 [MODIFY] [seed.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/database/seed.ts)
*   Import and use the bcrypt-based `hashPassword` function from `@/shared/auth/password` instead of the local SHA-256 version.

### 2.7 [MODIFY] [auth.routes.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/modules/auth/routes/auth.routes.ts)
*   Apply the strict rate limiter (`rateLimitMiddleware(5, 15 * 60 * 1000)`) to `/otp/send` and `/otp/verify` endpoints.

### 2.8 [MODIFY] [upload.routes.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/modules/upload/routes/upload.routes.ts)
*   Add a `fileFilter` function to the Multer options to validate the file MIME types (only allowing common images).

### 2.9 [MODIFY] [order.controller.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/modules/orders/controllers/order.controller.ts)
*   Change `(req as any).user.sub` to `(req as AuthenticatedRequest).user!.id` in `createOrder` and `listUserOrders`.
*   Ensure that `getOrderById` verifies the requesting user's identity against the order's owner (or allows if they are an admin).
*   Add similar ownership checks in `verifyCodPayment` and `verifyRazorpayPayment`.

### 2.10 [MODIFY] [order.service.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/modules/orders/services/order.service.ts)
*   Update `verifyCodPayment` and `verifyRazorpayPayment` method signatures to accept the requesting `userId` and `userRole`. Enforce that the user is either the owner of the order or an admin.
*   Enforce that in production (`env.NODE_ENV === 'production'`), `verifyRazorpayPayment` throws an error if `env.RAZORPAY_KEY_SECRET` is missing (instead of falling back to mock mode).

### 2.11 [MODIFY] [product.repository.ts](file:///d:/New%20folder/Node%20and%20Next/New%20folder/sanab/backend/src/modules/products/repositories/product.repository.ts)
*   Sanitize the `category` search parameter before constructing the regular expression, preventing RegEx Injection (ReDoS).

---

## 3. Verification Plan

### Automated Tests
*   Run the existing Jest test suite:
    `npm run test`
*   Verify that no typescript compilation errors occur:
    `npm run build`

### Manual Verification
*   **Security Tests**:
    1.  Create an order with User A, and attempt to fetch the order details using User B's token. Verify the response is a `403 Forbidden` or `404 Not Found`.
    2.  Try to delete an asset using a path traversal payload such as `local-../../package.json`. Ensure the request fails and the file is not deleted.
    3.  Verify that OTP requests get rate-limited after 5 requests within the window.
    4.  Verify that trying to upload a non-image file (e.g. `.txt`, `.html`) to the upload endpoint is rejected.
    5.  Check that the newly seeded default admin account (using bcrypt) can log in successfully.
