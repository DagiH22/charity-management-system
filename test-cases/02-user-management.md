# Test Cases: User & Admin Management

## Test Case 2.1: Admin Views All Users
**Description:** Verify that an Admin can view a list of all users.
**Pre-conditions:** User is logged in as an Admin.
**Test Steps:**
1. Navigate to the Admin Dashboard.
2. Click on the "User Management" section.
**Expected Result:** System displays a table or list of all registered users (Donors, Charities, Admins), including basic details like Name, Email, Role, and Status.

## Test Case 2.2: Admin Approves Charity Registration
**Description:** Verify that an Admin can approve a pending charity account.
**Pre-conditions:** A Charity has registered and is in a "Pending" status. Admin is logged in.
**Test Steps:**
1. Navigate to "User Management" or "Pending Approvals" in the Admin dashboard.
2. Locate the pending Charity account.
3. Review the charity details.
4. Click the "Approve" button.
**Expected Result:** The charity's status changes to "Approved" or "Active". The charity receives an email/notification (if implemented), and the charity can now access their dashboard.

## Test Case 2.3: Admin Rejects/Suspends Charity Account
**Description:** Verify that an Admin can reject or suspend a charity account.
**Pre-conditions:** User is logged in as an Admin.
**Test Steps:**
1. Navigate to the Admin User Management dashboard.
2. Locate an active or pending Charity account.
3. Click "Suspend" or "Reject".
**Expected Result:** The charity account status is updated to "Suspended" or "Rejected". The charity can no longer log in or access platform features.

## Test Case 2.4: Role-Based Access Control (RBAC) Verification
**Description:** Verify that a standard Donor cannot access Admin pages.
**Pre-conditions:** User is logged in as a Donor.
**Test Steps:**
1. Log in as a Donor.
2. Manually enter the URL for the Admin User Management page (e.g., `/admin/users`).
**Expected Result:** The system denies access and redirects the user to the Donor dashboard or an "Unauthorized Access" error page.
