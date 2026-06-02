# Test Cases: Campaigns

## Test Case 4.1: Create New Campaign
**Description:** Verify that a Charity creates a new fundraising campaign.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Campaigns" dashboard.
2. Click the "Create New Campaign" button.
3. Fill out the campaign form (Title, Description, Goal Amount in ETB, Deadline, Cover Image).
4. Click the "Publish" button.
**Expected Result:** The system saves the campaign to the database, sets its status to "Active", and displays it in the charity's active campaign list and the public campaign explorer.

## Test Case 4.2: Edit Campaign Details
**Description:** Verify that a Charity edits an active campaign.
**Pre-conditions:** User is logged in as a Charity and has an active campaign.
**Test Steps:**
1. Navigate to the "Campaigns" dashboard.
2. Select an active campaign and click the "Edit" button.
3. Update the description and goal amount.
4. Click the "Save Changes" button.
**Expected Result:** The system updates the campaign details in the database. The changes are immediately reflected on the public campaign page.

## Test Case 4.3: Campaign Explorer/Search
**Description:** Verify that a Donor searches and filters campaigns.
**Pre-conditions:** Active campaigns exist in the database.
**Test Steps:**
1. Navigate to the "Campaign Explorer" page.
2. Enter a specific campaign title in the search bar.
3. Select a specific category filter from the dropdown.
**Expected Result:** The system filters the visible campaigns and displays only the campaigns that match both the search keyword and the selected category.

## Test Case 4.4: View Campaign Details
**Description:** Verify that a Donor views the detailed page of a campaign.
**Pre-conditions:** A campaign is active.
**Test Steps:**
1. Click on a campaign card from the Explorer.
**Expected Result:** The system displays the campaign detail page, presenting the title, description, progress bar (amount raised vs. goal), deadline, and the "Donate" button.

## Test Case 4.5: Campaign Expiration Logic
**Description:** Verify that a campaign stops accepting donations once the deadline passes.
**Pre-conditions:** A campaign's deadline is set to a past date.
**Test Steps:**
1. Navigate to the detail page of the expired campaign.
**Expected Result:** The system marks the campaign as "Expired". The "Donate" button is removed from the UI, preventing any new donations.
