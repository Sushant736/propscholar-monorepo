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
  Tag,
  DollarSign,
  Layers,
  X,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  images: string[];
}

interface Variant {
  _id: string;
  name: string;
  comparePrice?: number;
  costPrice?: number;
  isActive: boolean;
  product: Product;
  createdAt?: string;
  updatedAt?: string;
  options?: string[];
}

interface VariantsApiResponse {
  success: boolean;
  data: {
    variants: Variant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const initialForm: Partial<Variant> = {
  name: "",
  options: [],
  isActive: true,
};

export default function VariantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<Variant>>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVariants = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(searchTerm ? { search: searchTerm } : {}),
    });
    apiFetch<VariantsApiResponse>(`/api/variants?${params}`)
      .then((data) => {
        setVariants(data.data.variants);
        setTotal(data.data.pagination.total);
        setPages(data.data.pagination.pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVariants();
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

  const openEditModal = (variant: Variant) => {
    setForm(variant);
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
        await apiFetch("/api/variants", {
          method: "POST",
          body: JSON.stringify(form),
        });
      } else if (modalMode === "edit" && form._id) {
        await apiFetch(`/api/variants/${form._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      }
      closeModal();
      fetchVariants();
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
      await apiFetch(`/api/variants/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchVariants();
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
              <h1 className="text-2xl font-bold text-gray-900">Variants</h1>
              <p className="text-gray-600 mt-1">
                Manage product variants and pricing
              </p>
            </div>
            <Button
              className="btn-primary flex items-center space-x-2"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" />
              <span>Add Variant</span>
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
                placeholder="Search variants..."
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
          <p className="empty-state-text">Loading variants...</p>
        </div>
      )}
      {error && (
        <div className="empty-state">
          <div className="empty-state-icon text-red-500">⚠️</div>
          <p className="empty-state-text text-red-600">{error}</p>
        </div>
      )}
      {!loading && !error && variants.length === 0 && (
        <div className="empty-state">
          <Layers className="empty-state-icon" />
          <p className="empty-state-text">No variants found.</p>
        </div>
      )}

      {/* Variants Table */}
      {!loading && !error && variants.length > 0 && (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Variant</th>
                  <th>Product</th>
                  <th>Compare Price</th>
                  <th>Cost Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {variants.map((variant) => (
                  <tr key={variant._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          {variant.product?.images &&
                          variant.product.images.length > 0 ? (
                            <img
                              src={variant.product.images[0]}
                              alt={variant.product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Tag className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {variant.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-700">
                        {variant.product?.name || "Unknown Product"}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-700">
                          {variant.comparePrice
                            ? `$${variant.comparePrice.toFixed(2)}`
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-700">
                          {variant.costPrice
                            ? `$${variant.costPrice.toFixed(2)}`
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {variant.isActive ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-neutral">Inactive</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-700">
                      {variant.createdAt
                        ? new Date(variant.createdAt).toLocaleDateString()
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
                          onClick={() => openEditModal(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteId(variant._id)}
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
      {!loading && !error && variants.length > 0 && (
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
                  {modalMode === "add" ? "Add Variant" : "Edit Variant"}
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
                  <label className="form-label">
                    Options (comma separated)
                  </label>
                  <input
                    name="options"
                    value={
                      Array.isArray(form.options)
                        ? form.options.join(", ")
                        : form.options || ""
                    }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        options: e.target.value
                          .split(",")
                          .map((opt) => opt.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="form-input"
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
                  {modalMode === "add" ? "Add Variant" : "Save Changes"}
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
                Delete Variant
              </h2>
            </div>
            <div className="modal-body">
              <p className="text-gray-700">
                Are you sure you want to delete this variant? This action cannot
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
