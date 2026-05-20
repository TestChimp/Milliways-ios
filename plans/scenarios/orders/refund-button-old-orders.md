---
type: scenario
id: TS-118
title: refund button disabled for old orders
story: US-107
created_date: 2026-05-19
priority: high
---

## Prerequisites
- User has an account on the platform and is logged in.
- User has made a purchase with an order that is older than the defined refund time frame (e.g., 30 days).
- User has navigated to the "Order History" section in their account settings.
- The system must have an available order that meets the criteria for being an "old order."

## Test Steps
- Step 1: Log in to the user account.
- Step 2: Navigate to the "Order History" section in the user account.
- Step 3: Locate an order that is older than the defined refund time frame (e.g., more than 30 days old).
- Step 4: Click on the order details to view further information.
- Step 5: Observe the presence of the "Request Refund" button on the order details page.

## Expected Behaviour
- The "Request Refund" button should be present on the order details page.
- The "Request Refund" button should be disabled and not clickable for orders that are considered old (e.g., older than 30 days).
- Hovering over the disabled "Request Refund" button should display a tooltip or message indicating the reason it is disabled, such as "Refund requests are only available for orders within 30 days of delivery."

