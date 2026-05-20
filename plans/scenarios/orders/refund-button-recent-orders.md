---
type: scenario
id: TS-117
title: refund button visibility for recent orders
story: US-107
created_date: 2026-05-19
priority: high
---

## Prerequisites
- The user must have an active account in the application.
- The user must have at least one recent order in their order history that is eligible for refund.
- The user must be logged into the application.
- The application must be in the "Browsing" state on the Menu screen when accessed.

## Test Steps
- Step 1: Access the application and log in with valid credentials.
- Step 2: Navigate to the "Orders" section in the user account profile.
- Step 3: Select any recent order from the order history list that is eligible for a refund (e.g., Order ID: 12345).
- Step 4: Verify that the order details page is displayed with full details of the selected order.
- Step 5: Check the visibility of the "Request Refund" button on the order details page.
- Step 6: Click the "Request Refund" button if it is visible.
- Step 7: Confirm the refund request by following the prompts displayed in the pop-up (if applicable).

## Expected Behaviour
- The user should successfully log in to the application.
- The user should be able to navigate to the "Orders" section without any issues.
- The selected recent order details should display correctly.
- The "Request Refund" button should be visible on the order details page for eligible orders.
- Clicking the "Request Refund" button should prompt a confirmation pop-up, indicating the refund request is being processed. If the order is not eligible, the button should not be visible.

