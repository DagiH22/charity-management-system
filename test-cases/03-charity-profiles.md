# Test Cases: Charity Profiles

## Test Case 3.1: Charity Profile Creation/Update
**Description:** Verify that an active Charity updates their public profile information.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Profile" page.
2. Update details (Organization Name, Description, Logo, Contact Information).
3. Click the "Save Profile" button.
**Expected Result:** The system saves the updated information to the database, displays a success message, and applies the changes to the charity's public profile page immediately.

## Test Case 3.2: Manage Social Media Links
**Description:** Verify that a Charity adds social media links to their profile.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the Profile settings.
2. Add valid URLs for Facebook, Twitter, and LinkedIn.
3. Click the "Save" button.
**Expected Result:** The system saves the social links. The social media icons appear on the public profile and route the user to the correct external URLs when clicked.

## Test Case 3.3: Manage Bank Account Information
**Description:** Verify that a Charity updates their bank account details for receiving donations.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Bank Details" section in the Profile.
2. Enter valid bank account information (Bank Name, Account Number, Account Holder Name, Routing Code).
3. Select one account and mark it as "Primary".
4. Click the "Save" button.
**Expected Result:** The system saves the bank details securely to the database. The primary bank account is designated for receiving all future incoming donations.

## Test Case 3.4: View Public Charity Profile
**Description:** Verify that a Donor views a Charity's public profile.
**Pre-conditions:** A Charity profile exists with active campaigns.
**Test Steps:**
1. Navigate to the "Charities" directory page.
2. Click on a specific Charity card.
**Expected Result:** The system displays the Charity's public profile, populating the page with their logo, description, social links, and a grid of their active campaigns.
