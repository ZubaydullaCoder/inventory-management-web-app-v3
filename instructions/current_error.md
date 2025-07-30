./src/app/api/categories/route.js
17:27 Error: 'request' is defined but never used. @typescript-eslint/no-unused-vars

./src/app/api/products/route.js
7:8 Error: 'prisma' is defined but never used. @typescript-eslint/no-unused-vars

./src/app/api/products/[id]/route.js
5:10 Error: 'productCreateSchema' is defined but never used. @typescript-eslint/no-unused-vars

./src/hooks/use-category-pagination.js
254:9 Warning: The 'goToPreviousPage' function makes the dependencies of useEffect Hook (at line 289) change on every render. To fix this, wrap the definition of 'goToPreviousPage' in its own useCallback() Hook. react-hooks/exhaustive-deps

./src/hooks/use-category-queries.js
41:9 Error: 'queryClient' is assigned a value but never used. @typescript-eslint/no-unused-vars

./src/hooks/use-product-creation-form.js
122:21 Error: 'product' is defined but never used. @typescript-eslint/no-unused-vars
133:5 Warning: React Hook useCallback has a missing dependency: 'initialValues'. Either include it or remove the dependency array. react-hooks/exhaustive-deps

./src/hooks/use-product-edit-form.js
147:6 Warning: React Hook useMemo has a missing dependency: 'watch'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
149:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
150:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
151:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
152:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
153:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
154:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
155:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps
156:5 Warning: React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. react-hooks/exhaustive-deps

./src/hooks/use-table-cursor-url-state.js
239:6 Warning: React Hook useEffect has missing dependencies: 'localFilters.categoryFilter' and 'localFilters.nameFilter'. Either include them or remove the dependency array. react-hooks/exhaustive-deps

./src/lib/data/categories-search.js
323:17 Error: 'priority' is assigned a value but never used. @typescript-eslint/no-unused-vars

./src/lib/data/products-search.js
401:17 Error: 'priority' is assigned a value but never used. @typescript-eslint/no-unused-vars

./src/lib/data/products.js
16:16 Error: 'orchestrateProductSearch' is defined but never used. @typescript-eslint/no-unused-vars  
43:10 Error: 'createSubsequencePattern' is defined but never used. @typescript-eslint/no-unused-vars

./src/lib/navigation-data.js
12:3 Error: 'Truck' is defined but never used. @typescript-eslint/no-unused-vars
13:3 Error: 'TrendingUp' is defined but never used. @typescript-eslint/no-unused-vars
