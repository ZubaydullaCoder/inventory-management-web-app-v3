# Keyset Pagination Implementation Guide

## Overview

This document outlines the implementation of cursor-based (keyset) pagination for the inventory management application. Keyset pagination provides better performance compared to offset-based pagination, especially for large datasets, as it doesn't suffer from the "deep pagination" performance penalty.

## Implementation Details

### 1. Core Functions

#### `getProductsByShopIdCursor(shopId, options)`

- **Location**: `src/lib/data/products.js`
- **Purpose**: Fetches products using cursor-based pagination
- **Parameters**:
  - `shopId`: Shop identifier
  - `options`: Object with pagination, sorting, and filtering options
    - `cursor`: Base64-encoded cursor for pagination position
    - `direction`: 'forward' | 'backward' (default: 'forward')
    - `limit`: Number of items per page (default: 10)
    - `sortBy`: Field to sort by (default: 'createdAt')
    - `sortOrder`: 'asc' | 'desc' (default: 'desc')
    - `nameFilter`: Filter by product name
    - `categoryFilter`: Filter by category ID
    - `enableFuzzySearch`: Enable PostgreSQL fuzzy search (default: true)

### 2. API Routes

#### `GET /api/products/cursor`

- **Location**: `src/app/api/products/cursor/route.js`
- **Purpose**: API endpoint for cursor-based product fetching
- **Query Parameters**: Same as the core function options
- **Response**: `CursorPaginatedProductsResult` object

### 3. React Hooks

#### `useGetProductsCursor(options)`

- **Location**: `src/hooks/use-product-queries.js`
- **Purpose**: TanStack Query hook for cursor pagination
- **Features**:
  - Automatic caching with 2-minute stale time
  - Keeps previous data during fetches for smooth UX
  - Granular cache invalidation

### 4. Type Definitions

#### `CursorPaginatedProductsResult`

```javascript
{
  products: Product[],
  nextCursor: string | null,
  prevCursor: string | null,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  totalProducts: number
}
```

## Technical Implementation

### Cursor Generation

Cursors are Base64-encoded JSON objects containing:

```javascript
{
  id: "product-id",
  value: "sort-field-value"
}
```

### Sorting Strategy

- **Primary Sort**: User-specified field (createdAt, name, sellingPrice, etc.)
- **Secondary Sort**: ID field for consistent ordering
- **Stable Sorting**: Ensures reproducible results even with identical primary values

### PostgreSQL Query Optimization

- Uses composite WHERE clauses with OR conditions for efficient cursor positioning
- Leverages existing database indexes for optimal performance
- Fetches `limit + 1` items to determine if more pages exist

### Fuzzy Search Integration

For fuzzy search queries:

- Fetches broader result set from PostgreSQL fuzzy search
- Applies cursor pagination to in-memory results
- Maintains performance while providing advanced search capabilities

## Performance Benefits

### vs. Offset-Based Pagination

| Aspect                | Offset Pagination                 | Keyset Pagination                |
| --------------------- | --------------------------------- | -------------------------------- |
| Deep page performance | O(n) - degrades with page depth   | O(log n) - consistent            |
| Database load         | Increases with offset size        | Constant                         |
| Consistency           | May show duplicates/missing items | Stable during concurrent changes |
| Complexity            | Simple                            | Moderate                         |

### Scalability

- **Small datasets (< 10K records)**: Minimal difference
- **Medium datasets (10K-100K records)**: Noticeable improvement
- **Large datasets (> 100K records)**: Significant performance gains

## Usage Examples

### Basic Forward Pagination

```javascript
const { data, isLoading, error } = useGetProductsCursor({
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Navigate to next page
const nextPageQuery = useGetProductsCursor({
  cursor: data?.nextCursor,
  direction: "forward",
  limit: 20,
});
```

### Backward Navigation

```javascript
const prevPageQuery = useGetProductsCursor({
  cursor: data?.prevCursor,
  direction: "backward",
  limit: 20,
});
```

### With Filtering

```javascript
const filteredQuery = useGetProductsCursor({
  nameFilter: "product",
  categoryFilter: "category-id",
  enableFuzzySearch: true,
  limit: 15,
});
```

## Migration Strategy

### Frontend Components

To migrate existing components from offset to cursor pagination:

1. Replace `page` parameter with `cursor` and `direction`
2. Update pagination controls to use `nextCursor`/`prevCursor`
3. Handle `hasNextPage`/`hasPrevPage` for button states
4. Implement infinite scroll pattern if desired

### Backward Compatibility

- Existing offset-based API remains functional
- Gradual migration path available
- Both pagination methods can coexist

## Best Practices

### Cursor Storage

- Store cursors in component state, not localStorage
- Don't expose cursor format to users
- Validate cursor format on API endpoints

### Error Handling

- Gracefully handle invalid cursors
- Provide fallback to first page on cursor errors
- Log cursor parsing errors for debugging

### Caching Strategy

- Use TanStack Query's built-in caching
- Invalidate caches on data mutations
- Consider cache warming for common queries

## Monitoring and Analytics

### Performance Metrics

- Track average query execution time
- Monitor cache hit rates
- Measure user engagement with deep pages

### Error Monitoring

- Invalid cursor format errors
- Pagination performance degradation
- User navigation patterns

## Future Enhancements

### Infinite Scroll

```javascript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["products-infinite"],
    queryFn: ({ pageParam }) =>
      getProductsCursorApi({
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
```

### Bidirectional Infinite Scroll

- Support both forward and backward infinite loading
- Implement virtual scrolling for large datasets
- Add jump-to-page functionality with cursor estimation

## Conclusion

Keyset pagination provides a scalable, performant solution for large product catalogs. The implementation maintains backward compatibility while offering significant performance improvements for users navigating deep into product lists. The cursor-based approach ensures consistent results even during concurrent data modifications, providing a superior user experience.
