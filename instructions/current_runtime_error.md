Console Error

[["products","session-creations"]]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function

src\components\features\products\creation\product-creation-cockpit.jsx (19:50) @ ProductCreationCockpit

17 | // State is now held locally in this client component.
18 | // Use TanStack Query to fetch session products

> 19 | const { data: sessionProducts = [] } = useQuery({

     |                                                  ^

20 | queryKey: queryKeys.products.sessionCreations(),
21 | initialData: [],
22 | });
Call Stack
7

Show 5 ignore-listed frame(s)
ProductCreationCockpit
src\components\features\products\creation\product-creation-cockpit.jsx (19:50)
ProductCockpitPage
src\app\(dashboard)\inventory\products\new\page.jsx (24:7)
