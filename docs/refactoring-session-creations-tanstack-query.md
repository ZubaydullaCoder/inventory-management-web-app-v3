# Product Creation Session Refactoring - TanStack Query Single Source of Truth

## Overview
This document describes the refactoring of the product creation workflow to use TanStack Query as the single source of truth for managing session products, eliminating local state management in favor of a unified cache-based approach.

## Changes Made

### 1. Query Keys Enhancement
- Added `sessionCreations()` to the products query keys in `src/lib/queryKeys.js`
- This provides a dedicated cache key for session-specific product creations

### 2. ProductCreationCockpit Refactoring
- **Removed**: Local `useState` for managing session products
- **Added**: `useQuery` hook to read session products from TanStack Query cache
- **Configuration**:
  - `queryFn: () => []` - Returns empty array as this is local-only cache
  - `staleTime: Infinity` - Never refetch as this is session-based
  - `gcTime: 0` - Clear on unmount to ensure fresh session on page refresh
  - `refetchOnMount: false` - Prevent refetching
  - `refetchOnWindowFocus: false` - Prevent refetching on focus

### 3. useCreateProduct Hook Enhancement
- **onMutate**: 
  - Adds new product to session creations cache with pending status
  - Includes optimisticId for tracking
- **onError**:
  - Updates session creation status to "error"
  - Auto-removes failed items after 5 seconds
- **onSuccess**:
  - Updates session creation with real data and "success" status

### 4. useUpdateProduct Hook Enhancement
- Added session creations cache update logic
- Updates products in session creations when edited from the list

### 5. Component Simplification
- **ProductCreationForm**: Removed callback props (onOptimisticAdd, onSuccess, onError)
- **useProductCreationForm**: Simplified to work without callbacks
- **ProductSessionCreationList**: Removed onEditSuccess callback

## Benefits

1. **Single Source of Truth**: All product data now managed through TanStack Query cache
2. **Simplified Components**: Removed complex callback prop drilling
3. **Consistent State Management**: Unified approach for all server and local state
4. **Session Persistence**: Products disappear on page refresh as required
5. **Better Error Handling**: Automatic cleanup of failed items
6. **Improved Performance**: Leverages TanStack Query's optimized caching

## Architecture Pattern

The refactored solution follows these principles:
- TanStack Query cache serves as the single source of truth
- Session creations are stored in a dedicated cache entry
- Mutations update both the main product lists and session creations
- Components are purely declarative, reading from cache via hooks
- Session data is cleared on page refresh by setting `gcTime: 0`
