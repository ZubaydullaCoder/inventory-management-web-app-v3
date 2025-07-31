D:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-7\node_modules\@prisma\client\runtime\library.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: TypeError [ERR_INVALID_ARG_TYPE]: The "payload" argument must be of type object. Received null
Error fetching products with cursor pagination: Error [PrismaClientKnownRequestError]:
Invalid `prisma.product.findMany()` invocation:

Server has closed the connection.
at async getProductsByShopIdCursor (d:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-7\src\lib\data\products.js:364:53)
at async ProductsPage (d:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-7\src\app\(dashboard)\inventory\products\page.jsx:50:19)
362 | direction === "backward" ? reverseOrder(orderBy) : orderBy;
363 |

> 364 | const [products, filteredCount, totalProducts] = await Promise.all([

      |                                                     ^

365 | prisma.product.findMany({
366 | where: whereClause,
367 | orderBy: actualDirection, {
code: 'P1017',
meta: [Object],
clientVersion: '6.11.1'
}
Failed to fetch products: Error: Failed to fetch products
at getProductsByShopIdCursor (d:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-7\src\lib\data\products.js:432:10)
at async ProductsPage (d:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-7\src\app\(dashboard)\inventory\products\page.jsx:50:19)
430 | } catch (error) {
431 | console.error("Error fetching products with cursor pagination:", error);

> 432 | throw new Error("Failed to fetch products");

      |          ^

433 | }
434 | }
435 |
