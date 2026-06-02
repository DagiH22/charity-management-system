# Test Cases: Authentication & Authorization

## Test Case 1.1: User Registration (Donor)
**Description:** Verify that a user can successfully register as a Donor.
**Pre-conditions:** User is on the registration page.
**Test Steps:**
1. Navigate to the Registration page.
2. Enter valid details (Name, Email, Password, Confirm Password).
3. Select "Donor" as the role.
4. Click "Register".
**Expected Result:** System creates the account, shows a success message, and redirects to the Login or Dashboard page.

## Test Case 1.2: User Registration (Charity)
**Description:** Verify that a user can successfully register as a Charity.
**Pre-conditions:** User is on the registration page.
**Test Steps:**
1. Navigate to the Registration page.
2. Enter valid details (Organization Name, Email, Password, etc.).
3. Select "Charity" as the role.
4. Click "Register".
**Expected Result:** System creates the account, sets the status to pending (if approval is required), and redirects the user with a relevant success message.

## Test Case 1.3: User Login (Valid Credentials)
**Description:** Verify that a user can log in with valid credentials.
**Pre-conditions:** User has a registered account.
**Test Steps:**
1. Navigate to the Login page.
2. Enter a valid registered email and password.
3. Click "Login".
**Expected Result:** System authenticates the user, generates a session token, and redirects to the appropriate dashboard based on their role (Admin, Charity, or Donor).

## Test Case 1.4: User Login (Invalid Credentials)
**Description:** Verify that login fails with incorrect credentials.
**Pre-conditions:** None.
**Test Steps:**
1. Navigate to the Login page.
2. Enter an incorrect email or password.
3. Click "Login".
**Expected Result:** System denies access and displays an error message ("Invalid email or password").

## Test Case 1.5: User Logout
**Description:** Verify that a user can securely log out.
**Pre-conditions:** User is logged into the system.
**Test Steps:**
1. Click the "Logout" button in the navigation or profile menu.
**Expected Result:** System clears the session/token and redirects the user to the Login or Home page. User should not be able to access protected routes using the browser's "Back" button.

## Test Case 1.6: Protected Route Access (Unauthorized)
**Description:** Verify that unauthenticated users cannot access protected routes.
**Pre-conditions:** User is not logged in.
**Test Steps:**
1. Attempt to navigate directly to a protected URL (e.g., `/admin/dashboard`, `/donor/donations`).
**Expected Result:** System redirects the user to the Login page and may display an "Access Denied" message.
