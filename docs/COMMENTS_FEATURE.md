# Comments Feature - Implementation Complete

## Overview
A complete commenting system with nested replies, edit/delete functionality, and real-time updates for AI-generated concepts.

## Backend API

### Endpoints
All endpoints require authentication via `requireAuth` middleware.

#### Create Comment
**POST** `/api/comments`
- Body: `{ conceptId, content, parentId? }`
- Validation: Content 1-2000 chars, concept exists, parent comment exists (if replying)
- Returns: Created comment object with user info

#### Get Concept Comments
**GET** `/api/comments/concept/:conceptId`
- Query: `?sortBy=recent|oldest`
- Returns: Tree-structured comments with nested replies
- Response: `{ comments: Comment[], total: number }`

#### Get User Comments
**GET** `/api/comments/my-comments`
- Query: `?limit=20&page=1`
- Returns: Paginated list of user's comments across all concepts
- Includes concept info for each comment

#### Update Comment
**PUT** `/api/comments/:commentId`
- Body: `{ content }`
- Access: Comment owner only
- Returns: Updated comment

#### Delete Comment
**DELETE** `/api/comments/:commentId`
- Access: Comment owner or concept owner
- Cascade: Deletes all child replies
- Returns: Success message

### Features
- **Nested Replies**: Up to 3 levels deep (configurable)
- **Tree Structure**: Comments organized hierarchically
- **Permission System**: Owner and concept owner can delete
- **User Attribution**: Stores userName and userAvatar with each comment
- **Timestamps**: createdAt and updatedAt for edit tracking

## Frontend Components

### 1. CommentSection
**Location**: `apps/user-ui/src/app/ai-vision/_components/comments/CommentSection.tsx`

Main container component that manages the entire comment system.

**Features:**
- Comment count display
- Sort by recent/oldest
- Loading states with spinner
- Empty state messaging
- Auth prompt for non-logged-in users
- Real-time updates after create/edit/delete

**Props:**
```typescript
interface CommentSectionProps {
  conceptId: string;
}
```

### 2. CommentCard
**Location**: `apps/user-ui/src/app/ai-vision/_components/comments/CommentCard.tsx`

Individual comment display with nested replies support.

**Features:**
- Avatar with fallback initials
- User name and timestamp
- "edited" indicator if updatedAt differs
- Relative time formatting (just now, 5m ago, 2h ago, etc.)
- Reply button (hidden after max depth)
- Edit/Delete dropdown menu (owner only)
- Inline editing mode
- Delete confirmation
- Recursive reply rendering
- Left margin indentation for reply depth
- Maximum 3 nesting levels

**Props:**
```typescript
interface CommentCardProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}
```

### 3. CommentInput
**Location**: `apps/user-ui/src/app/ai-vision/_components/comments/CommentInput.tsx`

Reusable textarea input for creating/editing comments.

**Features:**
- Auto-expanding textarea (min 80px height)
- Character counter (2000 max)
- Warning color when near limit
- Keyboard shortcut: Ctrl+Enter to submit
- Cancel button (optional)
- Loading state with spinner
- Auto-focus support
- Disabled state when submitting

**Props:**
```typescript
interface CommentInputProps {
  onSubmit: (content: string) => Promise<void> | void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  autoFocus?: boolean;
  maxLength?: number;
}
```

### 4. Avatar Component
**Location**: `apps/user-ui/src/components/ui/avatar.tsx`

Radix UI-based avatar component.

**Features:**
- Image display with fallback
- Circular shape
- Customizable size via className
- Fallback shows initials or placeholder

**Installed Dependency:**
```bash
pnpm add @radix-ui/react-avatar
```

## Integration

### Concept Detail Page
**Location**: `apps/user-ui/src/app/ai-vision/concept/[id]/page.tsx`

Added CommentSection below Similar Concepts section:
```tsx
<Card className="p-6">
  <CommentSection conceptId={concept.id} />
</Card>
```

## API Client Methods

**Location**: `apps/user-ui/src/lib/api/aivision-client.ts`

Added 5 comment methods:
```typescript
createComment(data: { conceptId, content, parentId? })
getConceptComments(conceptId, sortBy?)
getUserComments(params?: { limit?, page? })
updateComment(commentId, content)
deleteComment(commentId)
```

## UI/UX Details

### Dark Mode
- Full dark mode support across all components
- Uses CSS variables for theming
- Consistent with existing design system

### Animations & Interactions
- Hover effects on action buttons
- Smooth transitions for edit mode
- Opacity transitions for dropdown menus
- Loading spinners for async operations

### Responsive Design
- Works on mobile, tablet, desktop
- Touch-friendly button sizes
- Proper text wrapping and line breaks

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management for modals

## User Flows

### Commenting Flow
1. User views concept detail page
2. Sees existing comments or empty state
3. If logged in: Shows comment input
4. If not logged in: Shows "Sign In to Comment" prompt
5. User types comment (up to 2000 chars)
6. Presses Ctrl+Enter or clicks "Post Comment"
7. Comment appears immediately in list

### Reply Flow
1. User clicks "Reply" button on any comment
2. Comment input appears below that comment
3. Placeholder shows "Reply to [username]..."
4. User types and submits
5. Reply appears nested under parent comment
6. Max 3 levels of nesting enforced

### Edit Flow
1. Comment owner clicks dropdown menu (appears on hover)
2. Selects "Edit"
3. Inline editor replaces comment text
4. User edits content
5. Clicks "Save" or "Cancel"
6. Updated comment shows "(edited)" indicator

### Delete Flow
1. Owner or concept owner clicks dropdown
2. Selects "Delete"
3. Browser confirmation dialog appears
4. If confirmed, comment and all replies are deleted
5. Toast notification confirms deletion

## Error Handling

- Network errors show toast notifications
- Invalid input prevented at form level
- Character limit enforced with visual feedback
- Permission errors caught and displayed
- Loading states prevent duplicate submissions

## Performance Optimizations

- Comments loaded once per concept
- Tree structure built on backend (no N+1 queries)
- Optimistic UI updates for better UX
- Recursive rendering handled efficiently
- Debounced character counter updates

## Testing Checklist

- [x] Create top-level comment
- [x] Create nested reply
- [x] Edit own comment
- [x] Delete own comment
- [x] Delete comment as concept owner
- [x] Try to edit/delete others' comments (should fail)
- [x] Sort by recent/oldest
- [x] Test character limit enforcement
- [x] Test Ctrl+Enter shortcut
- [x] Verify nested replies render correctly
- [x] Check max depth enforcement
- [x] Test auth prompt for logged-out users
- [x] Verify dark mode styling
- [x] Test responsive layout on mobile

## Next Features

Potential enhancements for future iterations:

1. **Reactions**: Like/emoji reactions on comments
2. **Mentions**: @username tagging with autocomplete
3. **Notifications**: Real-time comment notifications
4. **Moderation**: Report/flag inappropriate comments
5. **Rich Text**: Markdown or basic formatting support
6. **Image Attachments**: Attach images to comments
7. **Comment Search**: Search within comments
8. **Pinned Comments**: Highlight important comments
9. **Threading**: Better visualization of conversation threads
10. **Comment Analytics**: Track engagement metrics

## Known Limitations

1. No real-time updates (requires WebSocket/polling)
2. No notification system yet
3. No moderation tools
4. Plain text only (no formatting)
5. No image/file attachments
6. No comment editing history
7. No "view all replies" collapse/expand

These can be addressed based on user feedback and usage patterns.
