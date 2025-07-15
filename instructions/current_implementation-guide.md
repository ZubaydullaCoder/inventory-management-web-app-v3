Step 1 — Intent Clarification & Request Evaluation

Your request is clear and actionable:
You want the product filter to support "fuzzy substring" matching, so that if a user types "pt", products like "product-1" are included in the results—even if the characters are not contiguous but appear in order. This is a more flexible, user-friendly search experience, especially for fast keyboard-driven workflows.

Step 2 — What Do We Implement?

Current Behavior:

Filtering is tolerant to spaces/dashes (e.g., "product 1" matches "product-1").
Filtering is still strict in that it only matches if the normalized filter string is a contiguous substring of the normalized product name.
Typing "pt" does not match "product-1".
Expected Behavior After Implementation:

Typing "pt" matches "product-1" (since both "p" and "t" appear in order in "product-1").
Typing "prd1" matches "product-1".
Typing "prct" matches "product-1".
Typing "pd" matches "product-1".
Typing "p1" matches "product-1".
Typing "pdt" matches "product-1".
Typing "pdt2" does not match "product-1" (since "2" is not present).
The filter is now a "fuzzy subsequence" match, not just a substring match.
Relevant Scenarios:

User types any sequence of characters; if those characters appear in order (not necessarily contiguous) in the normalized product name, the product is included.
Still tolerant to spaces/dashes.
Step 3 — How Do We Implement?

Analysis:

Filtering logic is in the backend, specifically in getProductsByShopId.
Currently, filtering uses normalizeForSearch and a simple .includes() check.
Need to replace .includes() with a "subsequence" or "fuzzy" matcher.
Reusable Code:

normalizeForSearch already exists in utils.js.
No fuzzy matching utility yet.
Approach Options:

Custom Subsequence Matcher:

Write a utility function (e.g., isSubsequence(needle, haystack)) that returns true if all characters in needle appear in order in haystack.
Use this in the JS filtering step in getProductsByShopId.
Fuzzy Matching Package:

Use a package like fuzzysort or fuse.js for advanced fuzzy matching.
For this use case, a simple subsequence matcher is likely sufficient and more performant.
Recommendation:

Implement a pure utility function isSubsequence in utils.js.
Use this function in the backend filtering step, replacing .includes().
Step 4 — Final Plan Summary

📁 Files to update:

utils.js: Add isSubsequence utility.
products.js: Use isSubsequence for product name filtering.
📦 Relevant npm packages:

No new packages required for a simple subsequence match.
💻 CLI commands:

None required.
🔄 Reused logic:

Continue using normalizeForSearch from utils.js.
