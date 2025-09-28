# Plot API Tests Documentation

This document provides detailed information about the Postman test collection created to test the plot API endpoints in the NextGenArchitect application.

## Overview

The test suite verifies the functionality of the plot API endpoints, including:

1. Creating plots (POST /api/plots)
2. Retrieving plots (GET /api/plots, GET /api/plots/:id)
3. Updating plots (PUT /api/plots/:id)
4. Deleting plots (DELETE /api/plots/:id)

## Prerequisites

Before running the tests, ensure you have:

1. The NextGenArchitect backend server running on `http://localhost:5000`
2. A society admin account created with credentials:
   - Email: `abcf@example.com`
   - Password: `abcf@example.com`
3. Postman application installed

## How to Import the Collection

1. Open Postman
2. Click on "Import" button in the upper left corner
3. Select "File" and choose the `plot_api_tests.json` file
4. The collection will be imported with all requests and tests

## Environment Setup

Create a new environment in Postman with the following variables:

1. `access_token` - This will be set automatically after successful login
2. `plot_id` - This will be set automatically when a plot is created
3. `random_plot_number` - This will be generated automatically during testing
4. `updated_price` - This will be set during the update test
5. `updated_description` - This will be set during the update test

## Test Structure

### Authentication

Before testing the plot APIs, the authentication test ensures you can log in and get a valid access token.

- **Society Login**: Logs in with society admin credentials and stores the access token.

### Create Plot Tests

Tests the ability to create new plots:

- **Create Plot - Valid Data**: Creates a new plot with valid data, including description and amenities.
- **Create Plot - Missing Required Fields**: Verifies that the API rejects requests with missing required fields.
- **Create Plot - Duplicate Plot Number**: Ensures that duplicate plot numbers are not allowed.
- **Create Plot - Unauthorized**: Verifies that unauthorized users cannot create plots.

### Retrieve Plot Tests

Tests the ability to retrieve plots:

- **Get All Plots**: Retrieves all plots for the current society.
- **Get Single Plot**: Retrieves a specific plot by its ID.
- **Get Plot - Invalid ID**: Verifies that the API handles invalid IDs correctly.

### Update Plot Tests

Tests the ability to update existing plots:

- **Update Plot - Valid Data**: Updates a plot with new information, including description and amenities.
- **Verify Plot Update**: Confirms that the update was successful by retrieving the updated plot.
- **Update Plot - Invalid ID**: Verifies that the API handles invalid IDs correctly.
- **Update Plot - Unauthorized**: Ensures that unauthorized users cannot update plots.

### Delete Plot Tests

Tests the ability to delete plots:

- **Delete Plot**: Deletes a specific plot by its ID.
- **Verify Plot Deletion**: Confirms that the plot was successfully deleted.
- **Delete Plot - Invalid ID**: Verifies that the API handles invalid IDs correctly.
- **Delete Plot - Unauthorized**: Ensures that unauthorized users cannot delete plots.

## Running the Tests

1. Select the imported collection
2. Click on the "Run" button
3. In the Collection Runner, select your environment
4. Click "Start Run" to execute all tests in order

## Important Notes

1. The tests are designed to run in sequence, with each test potentially depending on data from previous tests.
2. Some tests may fail if the server is not running or if the database doesn't have the expected initial data.
3. Before each test run, ensure the database is in a clean state or modify the tests to work with your existing data.
4. You may need to update image file paths in the "Create Plot" tests to point to valid image files on your system.

## Troubleshooting

- **Authentication Failures**: Ensure the society admin account exists and has the correct credentials.
- **404 Errors**: Verify that the server is running and accessible at the expected URL.
- **Validation Errors**: If the plot schema has been modified, you may need to update the test data to match the new requirements.
- **Image Upload Issues**: Ensure that the image file paths are correct and that the files exist.

## Special Notes for Testing Description and Amenities

The collection includes specific tests for the description and amenities arrays that were recently fixed:

1. When creating a plot, the tests include proper formatting for description and amenities arrays.
2. When updating a plot, the tests verify that description and amenities are correctly saved and retrieved.
3. The tests include the empty array markers required by Flask (`description[]` and `amenities[]`).

This ensures that the fixes for the description and amenities arrays are properly tested.
