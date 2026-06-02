# Test Cases: Authentication & Authorization

## Test Case 1.1: User Registration (Donor)
**Description:** Verify that a user registers as a Donor successfully.
**Pre-conditions:** User is on the registration page.
**Test Steps:**
1. Navigate to the Registration page.
2. Enter valid details (Name, Email, Password, Confirm Password).
3. Select "Donor" as the role.
4. Click "Register".
**Expected Result:** The system creates the account, displays a success message, and redirects the user to the Login page.

## Test Case 1.2: User Registration (Charity)
**Description:** Verify that a user registers as a Charity successfully.
**Pre-conditions:** User is on the registration page.
**Test Steps:**
1. Navigate to the Registration page.
2. Enter valid details (Organization Name, Email, Password).
3. Select "Charity" as the role.
4. Click "Register".
**Expected Result:** The system creates the account, sets the account status to "Pending" for Admin approval, and redirects the user to a waiting page with a confirmation message.

## Test Case 1.3: User Login (Valid Credentials)
**Description:** Verify that a user logs in with valid credentials.
**Pre-conditions:** User has an active, registered account.
**Test Steps:**
1. Navigate to the Login page.
2. Enter a registered email and correct password.
3. Click "Login".
**Expected Result:** The system authenticates the user, generates a session token, and redirects the user to their role-specific dashboard.

## Test Case 1.4: User Login (Invalid Credentials)
**Description:** Verify that login fails with incorrect credentials.
**Pre-conditions:** None.
**Test Steps:**
1. Navigate to the Login page.
2. Enter an incorrect email or password.
3. Click "Login".
**Expected Result:** The system denies access and displays the error message "Invalid email or password".

## Test Case 1.5: User Logout
**Description:** Verify that a user logs out securely.
**Pre-conditions:** User is logged into the system.
**Test Steps:**
1. Click the "Logout" button in the navigation menu.
**Expected Result:** The system clears the session token and redirects the user to the Login page. The user cannot access protected routes using the browser's "Back" button.

## Test Case 1.6: Protected Route Access (Unauthorized)
**Description:** Verify that unauthenticated users cannot access protected routes.
**Pre-conditions:** User is not logged in.
**Test Steps:**
1. Enter the URL for a protected route (e.g., `/admin/dashboard`) in the browser.
**Expected Result:** The system redirects the user to the Login page and displays an "Access Denied" message.
