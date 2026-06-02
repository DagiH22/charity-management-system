# Test Cases: Campaigns

## Test Case 4.1: Create New Campaign
**Description:** Verify that a Charity can create a new fundraising campaign.
**Pre-conditions:** User is logged in as a Charity.
**Test Steps:**
1. Navigate to the "Campaigns" dashboard.
2. Click "Create New Campaign".
3. Fill out the campaign form (Title, Description, Goal Amount in ETB, Deadline, Cover Image).
4. Click "Submit" or "Publish".
**Expected Result:** The system creates the campaign, saves it to the database, and it appears in the charity's active campaign list.

## Test Case 4.2: Edit Campaign Details
**Description:** Verify that a Charity can edit an existing active campaign.
**Pre-conditions:** User is logged in as a Charity and has an active campaign.
**Test Steps:**
1. Navigate to the "Campaigns" dashboard.
2. Select an active campaign and click "Edit".
3. Update the description or goal amount.
4. Click "Save Changes".
**Expected Result:** The system updates the campaign details and the changes are immediately reflected on the public campaign page.

## Test Case 4.3: Campaign Explorer/Search
**Description:** Verify that a Donor can browse and search for campaigns.
**Pre-conditions:** There are active campaigns in the system.
**Test Steps:**
1. Navigate to the "Campaign Explorer" or "Discover" page.
2. Use the search bar to enter a keyword related to a campaign.
3. Apply filters (e.g., category, near deadline).
**Expected Result:** The system filters and displays the campaigns that match the search criteria and applied filters.

## Test Case 4.4: View Campaign Details
**Description:** Verify that a Donor can view the detailed page of a specific campaign.
**Pre-conditions:** The campaign is active.
**Test Steps:**
1. Click on a campaign card from the Explorer or a Charity's profile.
**Expected Result:** The system displays the campaign detail page, showing the title, description, progress bar (amount raised vs. goal), deadline, and a "Donate" button.

## Test Case 4.5: Campaign Expiration Logic
**Description:** Verify that a campaign automatically stops accepting donations once the deadline is reached.
**Pre-conditions:** A campaign's deadline is set in the past.
**Test Steps:**
1. Attempt to view the expired campaign.
**Expected Result:** The campaign is marked as "Completed" or "Expired", and the "Donate" button is disabled or removed.
