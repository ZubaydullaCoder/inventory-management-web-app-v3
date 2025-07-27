"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import ProductSessionCreationItem from "./product-session-creation-item";
import ProductEditModal from "../edit/product-edit-modal";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useDeleteProduct } from "@/hooks/use-product-queries";
import { toast } from "sonner";

/**
 * Displays a list of products passed via props, with status indicators.
 * This is a pure presentational component.
 *
 * @param {{ products: Array<{data: object, status: string, optimisticId: string}> }} props
 * @returns {JSX.Element}
 */
export default function ProductSessionCreationList({ products = [] }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Hook for deleting products
  const { mutateAsync: deleteProductAsync, isPending: isDeleting } = useDeleteProduct();

  /**
   * Handles the edit action for a product.
   * @param {object} product
   */
  const handleEditProduct = (product) => {
    // Only allow editing of successfully saved products
    const productItem = products.find((p) => p.data.id === product.id);
    if (productItem?.status === "success") {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }
  };

  /**
   * Handles closing the edit modal.
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  /**
   * Handles successful product update.
   * @param {object} updatedProduct
   */
  const handleEditSuccess = (updatedProduct) => {
    // Updates are now handled directly in the mutation hooks
    // via TanStack Query cache updates
  };
  
  /**
   * Handles the delete action for a product.
   * @param {object} product
   */
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };
  
  /**
   * Handles the confirmed deletion of a product.
   */
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    
    const deletePromise = deleteProductAsync(productToDelete.id);
    
    // Close dialog immediately for better UX
    setProductToDelete(null);
    
    toast.promise(deletePromise, {
      loading: "Deleting product...",
      success: "Product deleted successfully!",
      error: (err) => {
        console.error("Delete error:", err);
        return err?.message || "Failed to delete product";
      },
    });
  };
  
  /**
   * Handles closing the delete confirmation dialog.
   */
  const handleCloseDeleteDialog = () => {
    setProductToDelete(null);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg font-medium">
          No products added yet
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Newly added products will appear here instantly
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Scrollable products list */}
        <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
          {products.map(({ data: product, status, optimisticId }) => (
            <ProductSessionCreationItem
              key={optimisticId}
              product={product}
              status={status}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {/* Fixed summary at bottom */}
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {products.length} product{products.length !== 1 ? "s" : ""} in this
            session
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        product={editingProduct}
        onSuccess={handleEditSuccess}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!productToDelete}
        onOpenChange={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={productToDelete ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.` : ""}
        isPending={isDeleting}
      />
    </>
  );
}
