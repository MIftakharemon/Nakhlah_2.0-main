# Lesson Learning System - API Integration

## Overview

This document outlines the comprehensive refactoring of the lesson learning component to use real API data instead of dummy frontend data. The system now fetches lesson questions from the API endpoint and dynamically renders different question types in sequence.

## Architecture Changes

### 1. **Question State Management - QuestionContext.jsx**

- **Location**: `app/(dashboard)/lesson/QuestionContext.jsx`
- **Purpose**: Central state management for all question-related data
- **Features**:
  - Fetches questions from API endpoint
  - Manages current question index
  - Provides hooks for components to access question data
  - Tracks loading and error states

### 2. **Lesson Layout - layout.jsx**

- **Location**: `app/(dashboard)/lesson/layout.jsx`
- **Purpose**: Wraps all lesson routes with QuestionProvider
- **Ensures**: All lesson pages have access to question context

### 3. **Loading Page - loading/page.jsx**

- **Updated**: Fetches lesson data from API instead of showing static progress
- **Flow**:
  1.  Retrieves lesson ID from sessionStorage
  2.  Calls `QuestionContext.loadQuestions(lessonId)`
  3.  Shows loading animation with real progress
  4.  Navigates to `/lesson/question` after loading

### 4. **Question Router - question/page.jsx**

- **Location**: `app/(dashboard)/lesson/question/page.jsx`
- **Purpose**: Main question page that dynamically renders based on question type
- **Supports**:
  - learn
  - mcq (multiple choice)
  - true_false
  - fill_blank
  - word_making
  - pair_matching

## Question Type Components

### 1. **Learn Question - LearnQuestion.jsx**

- Displays learning content
- Shows English translation and Arabic text
- Plays audio pronunciation
- Displays associated image
- No answer required - user advances with "Next" button

### 2. **MCQ Question - MCQQuestion.jsx**

- Multiple choice questions
- Randomly shuffles answer options
- Highlights correct/incorrect selection
- Shows visual feedback (green for correct, red for incorrect)
- Uses `is_correct` property to determine correctness

### 3. **True/False Question - TrueFalseQuestion.jsx**

- Binary choice questions
- Two large buttons for selection
- Validates against `true_false_answer` property
- Color-coded feedback (green/red)

### 4. **Fill in the Blank - FillBlankQuestion.jsx**

- Completes sentences with missing words
- Randomly shuffles answer options
- Uses `is_correct` property for validation
- Displays question with "\***\*\_\*\***" placeholder

### 5. **Word Making - WordMakingQuestion.jsx**

- Users arrange letters to form correct words
- Letters must be arranged in `_order` sequence
- User drags letters from available to selected area
- Validates complete sequence order
- Shows "Check Answer" button after selection

### 6. **Pair Matching - PairMatchingQuestion.jsx**

- Matches left column items to right column items
- Left items shown in order (`_order` property)
- Right items randomly shuffled
- Pairs validated by matching IDs
- Shows visual feedback for completed matches

## Data Flow

```
LessonSelectionPopup (click)
    ↓
Store lesson ID in sessionStorage
    ↓
Navigate to /lesson/loading
    ↓
Loading Page:
  - Gets lesson ID from sessionStorage
  - Calls API: GET https://nakhlah-api.nakhlah.net/api/lessons/{lessonId}
  - Stores questions in QuestionContext
    ↓
Navigate to /lesson/question
    ↓
Question Page:
  - Gets current question from context
  - Renders appropriate component based on type
  - User answers question
  - Advances to next question or completes lesson
```

## API Integration

### API Endpoint

```
GET https://nakhlah-api.nakhlah.net/api/lessons/{lessonId}
```

### Authentication

- All lesson API requests must include Bearer authentication.

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Structure

```json
[
  {
    "id": "question_id",
    "question_type": "learn|mcq|true_false|fill_blank|word_making|pair_matching",
    "question_title": "Question text",
    "learn_answer": { "English": "العربية" },
    "true_false_answer": true|false,
    "questionMedia": [
      {
        "mediaType": "image|audio",
        "media": {
          "url": "/api/questionnaires-media/file/filename.webp",
          "alt": "description",
          "filename": "filename.webp",
          "mimeType": "image/webp|audio/mpeg"
        },
        "mediaUrl": "https://external-cdn.com/path/filename.webp"
      }
    ],
    "answers": [
      {
        "id": "answer_id",
        "title": "Answer text",
        "is_correct": true|false|null,
        "_order": 1,
        "order_number": "1",
        "left_title": "Left side",
        "right_title": "Right side"
      }
    ]
  }
]
```

## Media Handling

### URL Construction

- API can return full external URLs in `mediaUrl` or relative URLs in `media.url`.
- If `mediaUrl` is present, it is used directly.
- If only `media.url` is present, full URLs are constructed as: `https://nakhlah-api.nakhlah.net/api/questionnaires-media/file/filename.ext`
- Utility function: `getMediaUrl(url)` in `utils/mediaUtils.js` handles both cases (absolute and relative).

### Supported Media Types

- **Images**: webp, jpg, png (displayed in question context)
- **Audio**: mp3 (played with Volume2 button)

## Session Storage

The system uses sessionStorage to pass data between routes:

```javascript
sessionStorage.setItem("selectedLessonId", lessonId); // Current lesson ID
sessionStorage.setItem("selectedNodeId", nodeId); // Current node (pathway)
```

## Answer Validation

### MCQ & Fill Blank

- Uses `answer.is_correct` property
- `true` = correct answer
- `false` or `null` = incorrect answer

### True/False

- Compares user selection with `question.true_false_answer`

### Word Making

- Checks if letters are arranged in correct `_order` sequence
- All letters must be in correct order

### Pair Matching

- Matches pairs by comparing IDs
- Pairs with same `id` are considered correct matches

## Navigation

### After Question Completion

- If LAST question: Navigate to `/lesson/completed`
- If NOT last: Show "Next Question" button → advance to next question

### Exit Lesson

- User can click X to exit
- Confirmation dialog with options to continue or return to dashboard
- Returns to `/dashboard` if user confirms exit

## Files Created/Modified

### Created

```
app/(dashboard)/lesson/
  ├── QuestionContext.jsx              (Context for state management)
  ├── layout.jsx                       (QuestionProvider wrapper)
  ├── utils/
  │   └── mediaUtils.js               (Media URL utilities)
  └── question/
      ├── page.jsx                     (Main question router)
      ├── LearnQuestion.jsx
      ├── MCQQuestion.jsx
      ├── FillBlankQuestion.jsx
      ├── WordMakingQuestion.jsx
      ├── TrueFalseQuestion.jsx
      └── PairMatchingQuestion.jsx
```

### Modified

```
app/(dashboard)/
  ├── lesson/loading/page.jsx          (API integration)
  └── components/
      ├── LessonSelectionPopup.jsx     (Pass lesson ID)
      └── Circle.jsx                   (Pass lesson ID to popup)
```

## Usage Example

### Starting a Lesson

1. User clicks on a pathway node in dashboard
2. LessonSelectionPopup appears
3. User selects a lesson
4. Lesson ID stored in sessionStorage
5. Navigate to `/lesson/loading`

### During Lesson

1. Loading page fetches questions from API
2. Questions rendered one by one
3. User answers each question
4. Feedback provided immediately
5. Advance to next question or completion

## Error Handling

- **Failed API fetch**: Shows error message in loading page
- **Missing lesson ID**: Redirects to dashboard
- **Missing questions**: Shows placeholder and redirects
- **Media load failure**: Images fallback to hidden state, audio errors logged

## Performance Optimizations

- Questions fetched once during loading
- Stored in context for quick access
- Smooth animations between questions
- Minimal re-renders using React hooks
- Media URLs constructed only when needed

## Future Enhancements

1. **Answer Tracking**: Store user answers for progress tracking
2. **Lesson Persistence**: Save progress and allow resuming
3. **Performance Metrics**: Track time spent and accuracy
4. **Adaptive Learning**: Adjust difficulty based on performance
5. **Offline Support**: Cache questions locally
6. **Accessibility**: Add keyboard navigation and screen reader support
