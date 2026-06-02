# Test Cases: Donations & Transactions

## Test Case 5.1: Make a Donation
**Description:** Verify that a Donor makes a donation to an active campaign.
**Pre-conditions:** User is logged in as a Donor. An active campaign exists.
**Test Steps:**
1. Navigate to an active campaign's detail page.
2. Click the "Donate" button.
3. Enter a valid donation amount in ETB.
4. Provide payment details through the integrated payment gateway.
5. Click "Confirm Donation".
**Expected Result:** The system processes the payment, increments the campaign's total raised amount by the donated value, and displays a "Donation Successful" receipt to the user.

## Test Case 5.2: Donation History (Donor)
**Description:** Verify that a Donor views their past donations.
**Pre-conditions:** User is logged in as a Donor and has made at least one successful donation.
**Test Steps:**
1. Navigate to the "Donation History" section in the Donor dashboard.
**Expected Result:** The system displays a table of all past donations. Each record shows the exact Date, Campaign Name, Charity Name, and Amount donated.

## Test Case 5.3: Received Donations (Charity)
**Description:** Verify that a Charity views all donations received across their campaigns.
**Pre-conditions:** User is logged in as a Charity. Their campaigns have received successful donations.
**Test Steps:**
1. Navigate to the "Donations" section in the Charity dashboard.
**Expected Result:** The system displays a list of incoming donations, showing the Donor Name, Campaign Title, Date, and Amount. The total raised amount matches the sum of all individual donations.

## Test Case 5.4: Anonymous Donations
**Description:** Verify that a Donor makes an anonymous donation.
**Pre-conditions:** User is logged in as a Donor making a donation.
**Test Steps:**
1. Check the "Make this donation anonymous" checkbox during the checkout process.
2. Complete the donation through the payment gateway.
**Expected Result:** The system processes the donation successfully. The Donor's name is recorded as "Anonymous" on the public campaign page and in the Charity's received donations dashboard.

## Test Case 5.5: View All Platform Transactions (Admin)
**Description:** Verify that an Admin views all donation transactions across the platform.
**Pre-conditions:** User is logged in as an Admin. Donations exist in the system.
**Test Steps:**
1. Navigate to the "Transactions" tab in the Admin dashboard.
**Expected Result:** The system displays a global transaction log containing every platform donation. Each entry includes the exact timestamp, donation amount in ETB, Donor ID, and recipient Charity ID.
