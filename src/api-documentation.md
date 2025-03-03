
# Guess The Image Prompt API Documentation

This document outlines all the API endpoints used by the Guess The Image Prompt application and describes their request/response formats.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses token-based authentication. After successful login or registration, the server returns a JWT token, which should be included in subsequent requests in the Authorization header.

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "string",  // Desired username
  "password": "string"   // Password hash (not the plain password)
}
```

**Response:**
```json
{
  "id": "string",                // User ID
  "username": "string",          // Username
  "casualScore": number,         // Initial score in casual mode (0)
  "dailyScore": number,          // Initial score in daily challenge mode (0)
  "token": "string",             // Authentication JWT token
  "progressLevels": [            // Initial progress mode levels state
    {
      "level": number,           // Level number
      "completed": number,       // Number of completed images in level (0)
      "total": number,           // Total images in level (10)
      "guesses": number,         // Number of guesses used (0)
      "unlocked": boolean        // Whether level is unlocked (true for level 1)
    }
  ]
}
```

#### Login User

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "string",  // User's username
  "password": "string"   // Password hash (not the plain password)
}
```

**Response:**
```json
{
  "id": "string",                // User ID
  "username": "string",          // Username
  "casualScore": number,         // Score in casual mode
  "dailyScore": number,          // Score in daily challenge mode
  "token": "string",             // Authentication JWT token
  "progressLevels": [            // Progress mode levels state
    {
      "level": number,           // Level number
      "completed": number,       // Number of completed images
      "total": number,           // Total images in level
      "guesses": number,         // Number of guesses used
      "unlocked": boolean        // Whether level is unlocked
    }
  ]
}
```

### Game Images

#### Fetch Random Image (Casual Mode)

**Endpoint:** `GET /images/random`

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Response:**
```json
{
  "id": "string",          // Unique identifier for the image
  "imageUrl": "string",    // URL to the image
  "promptLength": number   // Length of the prompt in words
}
```

#### Fetch Daily Challenge Image

**Endpoint:** `GET /images/daily`

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Response:**
```json
{
  "id": "string",              // Unique identifier for the image
  "imageUrl": "string",        // URL to the image
  "promptLength": number,      // Length of the prompt in words
  "hasSubmittedToday": boolean // Whether user has submitted today (requires auth)
}
```

#### Fetch Progress Mode Image

**Endpoint:** `GET /images/progress/{level}`

**Path Parameters:**
- `level`: The level number to fetch an image for

**Headers:**
- `Authorization: Bearer <token>` (optional, but recommended)

**Response:**
```json
{
  "id": "string",                // Unique identifier for the image
  "imageUrl": "string",          // URL to the image
  "promptLength": number,        // Length of the prompt in words
  "level": number,               // Current level
  "imageNumber": number,         // Image number in level
  "totalImagesInLevel": number   // Total images in level
}
```

### Guesses

#### Submit a Guess

**Endpoint:** `POST /guess`

**Headers:**
- `Authorization: Bearer <token>` (optional for casual mode, required for daily and progress)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "imageId": "string",  // ID of the image being guessed
  "guess": "string",    // The user's guess text
  "mode": "string",     // Game mode (casual, daily, or progress)
  "level": number       // Level number (only for progress mode)
}
```

**Response:**
```json
{
  "originalPrompt": "string",  // The actual prompt used to generate the image
  "similarity": number,        // Percentage of similarity (0-100)
  "score": number,             // Points awarded for the guess
  "exactMatches": [            // Array of words that exactly match the prompt
    "string"
  ],
  "similarMatches": [          // Array of words that are similar but not exact matches
    "string"
  ],
  "success": boolean           // Only for progress mode - true if score >= 80%
}
```

### Progress Mode

#### Fetch Progress Levels

**Endpoint:** `GET /progress/levels`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
[
  {
    "level": number,      // Level number
    "completed": number,  // Number of completed images in level
    "total": number,      // Total number of images in level
    "guesses": number,    // Number of guesses used
    "unlocked": boolean   // Whether level is unlocked
  }
]
```

#### Complete a Level

**Endpoint:** `POST /progress/complete`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "level": number,   // Completed level
  "guesses": number  // Total guesses used
}
```

**Response:**
```json
{
  "success": boolean,   // Whether update was successful
  "nextLevel": number,  // Next level number
  "unlocked": boolean   // Whether next level was unlocked
}
```

### Leaderboard

#### Fetch Leaderboard

**Endpoint:** `GET /leaderboard/{mode}`

**Path Parameters:**
- `mode`: Game mode (casual, daily, or progress)

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Response for Casual and Daily Modes:**
```json
[
  {
    "rank": number,        // Position in leaderboard
    "username": "string",  // User's username
    "score": number        // User's score in the specified mode
  }
]
```

**Response for Progress Mode:**
```json
[
  {
    "rank": number,         // Position in leaderboard
    "username": "string",   // User's username
    "score": number,        // Total score (not used in UI)
    "avgGuesses": number    // Average guesses per level
  }
]
```

## Error Responses

All endpoints return a standard error structure in case of errors:

```json
{
  "error": true,
  "message": "string",  // Human-readable error message
  "code": number        // HTTP status code
}
```

Common error codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing or invalid authentication)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server-side error)
