Runtime Error

Error: Cannot read properties of undefined (reading 'id')

src\components\features\categories\category-item.jsx (30:54) @ CategoryItem

28 | const { mutate: deleteCategory } = useDeleteCategory();
29 |

> 30 | const isSelected = selectedCategoryId === category.id;

     |                                                      ^

31 |
32 | const handleSelect = () => {
33 | if (isSelectable && onSelect) {
Call Stack
7

CategoryItem
src\components\features\categories\category-item.jsx (30:54)
SelectedCategoryBar
src\components\features\categories\selected-category-bar.jsx (43:7)
CategoryList
src\components\features\categories\category-list.jsx (202:7)
CategorySection
src\components\features\categories\category-section.jsx (69:7)
ProductCreationForm
src\components\features\products\creation\product-creation-form.jsx (119:11)
ProductCreationCockpit
src\components\features\products\creation\product-creation-cockpit.jsx (37:11)
ProductCockpitPage
src\app\(dashboard)\inventory\products\new\page.jsx (24:7)
