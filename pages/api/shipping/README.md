# Shipping API Integration

This directory contains the API endpoint for handling shipping operations using SecureShip.

## Environment Setup

Make sure to set the following environment variable in your `.env` file:

```
SECURESHIP_API_KEY=your_secureship_api_key
```

Note: The SecureShip API uses an `x-api-key` header for authentication.

## Available Endpoints

### Get Shipping Quotes

**Endpoint:** `/api/shipping/quotes`
**Method:** POST
**Description:** Get shipping quotes based on items, from address, and to address IDs.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "6780881e25206fd76031d472",
      "quantity": 2
    },
    {
      "productId": "6780881e25206fd76031d46f",
      "quantity": 1
    }
  ],
  "fromAddressId": "66393cd607209fc22e4a3837",
  "toAddressId": "666165c94e8d9106cca81ed5",
  "orderValue": 75.0 // Optional, for insurance purposes
}
```

### Test SecureShip API Directly

**Endpoint:** `/api/shipping/test-api`
**Method:** POST
**Description:** Test the SecureShip API directly using the exact format from working Postman examples.

This endpoint bypasses our box-finding logic and lets you test the API connection directly.

**Request Body (Optional):**
You can send your own payload or leave the body empty to use the default test payload that matches the Postman example.

**Response:**

```json
{
  "success": true,
  "rawApiResponse": [...], // Raw response from SecureShip API
  "formattedQuotes": [...]  // Formatted quotes for easier use
}
```

### Create Default Shipping Boxes

**Endpoint:** `/api/shipping/create-default-boxes`
**Method:** POST
**Description:** Create default shipping boxes for testing or initial setup.

**Usage:**

- `/api/shipping/create-default-boxes?force=true` - Create default boxes (if none exist)
- `/api/shipping/create-default-boxes?force=true&reset=true` - Delete all existing boxes and create new defaults

This will create standard shipping box sizes (small, medium, large, extra large) with appropriate dimensions and weight limits.

## Response Format

Successful responses from the quote endpoint will have the following format:

```json
{
  "success": true,
  "quotes": [
    {
      "id": "Canadapost-CanadapostExpedited",
      "carrier": "Canadapost",
      "service": "Expedited Parcel",
      "price": 10.08,
      "estimatedDelivery": "Mon Apr 14 2025 by End of Day",
      "tags": ["Cheapest"]
    }
    // Additional quotes...
  ],
  "package": {
    "weight": 2.5,
    "dimensions": {
      "length": 10,
      "width": 8,
      "height": 6,
      "units": "Inches"
    }
  }
}
```

## Error Handling

Error responses will have the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error message" // Optional, for debugging
}
```

## Integration Notes

1. Make sure all products have proper weight and dimensions in the database
2. Create shipping boxes in different sizes through the admin interface or use the create-default-boxes endpoint
3. The system will automatically select the smallest box that can fit all items
4. Shipping rates are calculated based on package dimensions, weight, and addresses

## Setup Guide

1. Set your SecureShip API key in `.env`
2. Make sure your products have weight and dimensions set
3. Create shipping boxes using the `create-default-boxes` endpoint
4. Test the API connection with the `test-api` endpoint
5. Test the shipping quotes endpoint with valid address IDs

## Debugging

The API includes detailed console logs to help with debugging:

- Package selection and optimization logs
- Address formatting
- API requests and responses
- Error details

### Common Errors

1. **401 Unauthorized**: Check that your SecureShip API key is correctly set in the environment variables
2. **400 Bad Request**: Check the payload format or address validation errors in the logs
3. **No suitable shipping box found**: Create shipping boxes or check product dimensions
