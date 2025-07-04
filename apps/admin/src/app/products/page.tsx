"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  X,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
}

interface Variant {
  _id: string;
  name: string;
  price?: number;
  sku?: string;
  stock?: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: Category;
  variants: Variant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const initialForm: Partial<Product> = {
  name: "",
  description: "",
  images: [],
  isActive: true,
  isFeatured: false,
  category: { _id: "", name: "" },
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<Product>>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(searchTerm ? { search: searchTerm } : {}),
    });
    apiFetch<ProductsApiResponse>(`/api/products?${params}`)
      .then((data) => {
        setProducts(data.data.products);
        setTotal(data.data.pagination.total);
        setPages(data.data.pagination.pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page, limit, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const openAddModal = () => {
    console.log("openAddModal called");
    setForm(initialForm);
    setModalMode("add");
    setModalOpen(true);
  };
  const openEditModal = (prod: Product) => {
    setForm(prod);
    setModalMode("edit");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
  };
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (
      type === "checkbox" &&
      (e.target as HTMLInputElement).checked !== undefined
    ) {
      setForm((f) => ({
        ...f,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (modalMode === "add") {
        await apiFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(form),
        });
      } else if (modalMode === "edit" && form._id) {
        await apiFetch(`/api/products/${form._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      }
      closeModal();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/products/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage product inventory and catalog
              </p>
            </div>
            <Button
              className="btn-primary flex items-center space-x-2"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <Button
              variant="outline"
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading/Error/Empty States */}
      {loading && (
        <div className="empty-state">
          <Loader2 className="empty-state-icon animate-spin" />
          <p className="empty-state-text">Loading products...</p>
        </div>
      )}
      {error && (
        <div className="empty-state">
          <div className="empty-state-icon text-red-500">⚠️</div>
          <p className="empty-state-text text-red-600">{error}</p>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <p className="empty-state-text">No products found.</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && products.length > 0 && (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {products.map((product) => (
                  <tr key={product._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-info">
                        {product.category?.name || "No Category"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="badge-success">
                        {product.variants?.length || 0} variants
                      </span>
                    </td>
                    <td className="table-cell">
                      {product.isActive ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-neutral">Inactive</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {product.isFeatured ? (
                        <span className="badge-warning flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </span>
                      ) : (
                        <span className="badge-neutral">Regular</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-700">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-50 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteId(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> to
            <span className="font-medium">
              {" "}
              {Math.min(page * limit, total)}
            </span>{" "}
            of
            <span className="font-medium"> {total}</span> results
          </div>
          <div className="pagination-controls">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700 px-4">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="btn-secondary"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === "add" ? "Add Product" : "Edit Product"}
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleFormChange}
                    className="form-textarea"
                    rows={3}
                    disabled={formLoading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    id="isActive"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    name="isFeatured"
                    type="checkbox"
                    checked={!!form.isFeatured}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    id="isFeatured"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Featured
                  </label>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleFormSubmit}
                  disabled={formLoading}
                  className="btn-primary"
                >
                  {formLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {modalMode === "add" ? "Add Product" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Product
              </h2>
            </div>
            <div className="modal-body">
              <p className="text-gray-700">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="btn-danger"
                >
                  {deleteLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
