---
type: scenario
id: TS-119
title: successful refund request feedback message
story: US-107
created_date: 2026-05-19
priority: medium
---

## Prerequisites
- The user must be logged into their account.
- The user must have at least one order eligible for a refund in their order history.
- The application should be in the "Menu" screen state with the user browsing their past orders.

## Test Steps
- Navigate to the "Menu" screen.
- Click on the "Orders" section to view the past orders.
- Select an order that is eligible for a refund.
- Click on the "Request Refund" button for the selected order.
- In the refund request form, enter the following:
 - Reason for refund: "Item arrived damaged"
 - Additional comments: "The item was broken upon arrival."
- Click on the "Submit" button to send the refund request.
- Wait for the system to process the request and display the feedback message.

## Expected Behaviour
- After submitting the refund request, a confirmation message should appear stating: "Your refund request has been successfully submitted. You will be notified once it has been processed."
- The user should be redirected back to the orders section with the status of the order updated to reflect the pending refund request.
- The refund request should be logged in the user's account history for future reference.

