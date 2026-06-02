# Test Cases: User & Admin Management

## Test Case 2.1: Admin Views All Users
**Description:** Verify that an Admin views the complete list of registered users.
**Pre-conditions:** User is logged in as an Admin.
**Test Steps:**
1. Navigate to the Admin Dashboard.
2. Click on the "User Management" tab.
**Expected Result:** The system displays a table containing all registered users (Donors, Charities, Admins), showing their Name, Email, Role, and current Status.

## Test Case 2.2: Admin Approves Charity Registration
**Description:** Verify that an Admin approves a pending charity account.
**Pre-conditions:** A Charity account exists in the "Pending" status. Admin is logged in.
**Test Steps:**
1. Navigate to "User Management" in the Admin dashboard.
2. Locate the pending Charity account.
3. Click the "Approve" button.
**Expected Result:** The system changes the charity's status to "Active". The charity is granted access to log into the platform and access their dashboard.

## Test Case 2.3: Admin Rejects Charity Account
**Description:** Verify that an Admin rejects a pending charity account.
**Pre-conditions:** A Charity account exists in the "Pending" status. Admin is logged in.
**Test Steps:**
1. Navigate to the Admin User Management dashboard.
2. Locate the pending Charity account.
3. Click the "Reject" button.
**Expected Result:** The system updates the charity account status to "Rejected". The charity is denied access to log into the platform.

## Test Case 2.4: Admin Suspends Active User
**Description:** Verify that an Admin suspends an active user account.
**Pre-conditions:** An active Donor or Charity account exists. Admin is logged in.
**Test Steps:**
1. Navigate to the Admin User Management dashboard.
2. Locate an active user account.
3. Click the "Suspend" button.
**Expected Result:** The system updates the user account status to "Suspended". The user is immediately denied access to log into the platform.

## Test Case 2.5: Role-Based Access Control (RBAC) Verification
**Description:** Verify that a standard Donor cannot access Admin pages.
**Pre-conditions:** User is logged in as a Donor.
**Test Steps:**
1. Enter the URL for the Admin User Management page (`/admin/users`) in the browser.
**Expected Result:** The system denies access and redirects the user to the Donor dashboard, displaying an "Unauthorized Access" error message.
