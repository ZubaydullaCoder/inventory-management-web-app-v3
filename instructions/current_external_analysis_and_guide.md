Thank you for the detailed report and the clear visual example. I have analyzed the behavior you've described and reviewed the relevant search implementation in the codebase.

You are correct. The current search mechanism is behaving too broadly for specific, multi-word queries. This is a classic challenge in designing a search system that is both "fuzzy" (typo-tolerant) and "precise" (understands user intent).

### Root Cause Analysis

The issue stems from the current multi-strategy parallel search implementation in `src/lib/data/products-search.js`. Here's a breakdown of why it's happening:

1.  **Parallel Strategies:** The system simultaneously runs multiple search methods (Exact Match, Prefix, Substring, Trigram for typos, etc.) against the _entire search phrase_ "otverka qizil marka a50".
2.  **Broad Matching:** Strategies like Trigram (fuzzy) or Substring matching find products that have a high similarity to just a _part_ of the query (e.g., "otverka").
3.  **Result Aggregation:** The system then aggregates all results from all successful strategies. Because other products are a partial match, they are included in the final list alongside the single perfect match.

Essentially, the current logic treats the search query as one long string to find matches for, rather than a collection of distinct terms that should _all_ be present in the result.

### Proposed Solution: Two-Stage Search Refinement

To fix this while preserving the valuable typo tolerance, I will implement a more intelligent, two-stage search process. This enhancement will be applied within the existing `fuzzySearchProducts` function.

#### Stage 1: Broad Candidate Selection (Current Behavior)

We will keep the existing multi-strategy search as the first stage. Its strength is in its speed and ability to catch typos, making it excellent for gathering a broad set of potential candidates. This ensures that a query like "otverka qizl" (with a typo) will still pull in the correct product.

#### Stage 2: Precision Filtering (New Logic)

After Stage 1 provides a list of potential results, I will introduce a second, more precise filtering stage that will execute in-memory on that small result set. This stage will:

1.  **Tokenize the Query:** The user's search query ("otverka qizil marka a50") will be broken down into individual tokens: `['otverka', 'qizil', 'marka', 'a50']`.
2.  **Verify Token Presence:** For each product returned from Stage 1, the logic will now check if that product's name or SKU contains **all** of the search tokens.
3.  **Filter the Results:** Any product that does not satisfy this "all tokens must be present" condition will be removed from the final result set.

### How This Solves the Issue

- **Improves Precision:** This new logic ensures that for a multi-word query, only results that are relevant to every single word are shown, which is exactly the behavior you expect.
- **Preserves Typo Tolerance:** Because the initial candidate selection is still fuzzy, this approach will gracefully handle typos within the query. For example, a search for "otverka qizl marka a50" would still find the correct product in Stage 1, and since that product contains all the _intended_ tokens, it would pass the Stage 2 filter.
- **Maintains Performance:** This two-stage process remains highly performant. The initial, database-intensive query is broad and fast. The second, more complex filtering logic is performed on a very small, in-memory list of candidates, making it virtually instantaneous.

By implementing this refinement, we will achieve a search that is intelligently adaptive: it provides broad, typo-tolerant results for simple queries and highly precise, relevant results for specific, multi-word queries.
