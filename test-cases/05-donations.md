# Test Cases: Donations & Transactions

## Test Case 5.1: Make a Donation
**Description:** Verify that a Donor can successfully make a donation to an active campaign.
**Pre-conditions:** User is logged in as a Donor. An active campaign exists.
**Test Steps:**
1. Navigate to an active campaign's detail page.
2. Click the "Donate" button.
3. Enter a valid donation amount in ETB.
4. Provide payment details (or use the mock payment gateway if applicable).
5. Confirm the donation.
**Expected Result:** The system processes the payment, updates the campaign's raised amount, and shows a "Donation Successful" confirmation to the user.

## Test Case 5.2: Donation History (Donor)
**Description:** Verify that a Donor can view their past donations.
**Pre-conditions:** User is logged in as a Donor and has made at least one donation.
**Test Steps:**
1. Navigate to the "Donation History" or "Contributions" section in the Donor dashboard.
**Expected Result:** The system displays a list of all past donations, including the Date, Campaign Name, Charity Name, and Amount donated.

## Test Case 5.3: Received Donations (Charity)
**Description:** Verify that a Charity can view the donations received across their campaigns.
**Pre-conditions:** User is logged in as a Charity. Their campaigns have received donations.
**Test Steps:**
1. Navigate to the "Donations" or "Dashboard" section.
**Expected Result:** The system displays a list of incoming donations, showing the Donor Name (unless anonymous), Campaign, Date, and Amount. The total raised amount should accurately reflect the sum of all donations.

## Test Case 5.4: Anonymous Donations
**Description:** Verify that a Donor can choose to make their donation anonymous.
**Pre-conditions:** User is logged in as a Donor making a donation.
**Test Steps:**
1. During the donation process, check the "Make this donation anonymous" checkbox.
2. Complete the donation.
**Expected Result:** The donation is processed successfully. When the Charity views their received donations or the public campaign page lists recent donors, this specific donation appears as "Anonymous" rather than displaying the Donor's actual name.

## Test Case 5.5: View All Platform Transactions (Admin)
**Description:** Verify that an Admin can view all donation transactions across the entire platform.
**Pre-conditions:** User is logged in as an Admin.
**Test Steps:**
1. Navigate to the "Transactions" or "Financial Overview" section in the Admin dashboard.
**Expected Result:** The system displays a comprehensive log of all platform donations, including timestamps, amounts, associated donors, and recipient charities.
