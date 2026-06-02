# Test Cases: Charity Profiles

## Test Case 3.1: Charity Profile Creation/Update
**Description:** Verify that a registered Charity can update their public profile information.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Profile" or "Settings" page.
2. Update details such as Organization Name, Description, Logo, and Contact Information.
3. Click "Save" or "Update Profile".
**Expected Result:** The system saves the updated information to the database and displays a success message. The updated information is visible on the charity's public profile page.

## Test Case 3.2: Manage Social Media Links
**Description:** Verify that a Charity can add or update their social media links.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the Profile settings.
2. Add valid URLs for Facebook, Twitter, LinkedIn, etc.
3. Click "Save".
**Expected Result:** Social links are saved successfully. When viewing the public profile, the social media icons/links should be clickable and navigate to the correct external URLs.

## Test Case 3.3: Manage Bank Account Information
**Description:** Verify that a Charity can add and update their bank account details for receiving donations.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Bank Details" or "Financial Info" section in the Profile.
2. Enter valid bank account information (Bank Name, Account Number, Account Holder Name, Routing/Branch Code).
3. Set one account as "Primary".
4. Click "Save".
**Expected Result:** The system securely saves the bank details. The data maps correctly to the database (and is parsed correctly via API as per recent fixes).

## Test Case 3.4: View Public Charity Profile
**Description:** Verify that any user (Donor or Guest) can view a Charity's public profile.
**Pre-conditions:** A Charity profile exists with active campaigns.
**Test Steps:**
1. Navigate to the Charities directory.
2. Click on a specific Charity.
**Expected Result:** The system displays the Charity's public profile, including their logo, description, social links, and a list of their active campaigns.
