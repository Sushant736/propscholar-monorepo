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
  Layers,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import * as Tabs from "@radix-ui/react-tabs";

interface Category {
  _id: string;
  name: string;
}

interface Variant {
  _id: string;
  name: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  stock?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedProductVariants, setSelectedProductVariants] = useState<
    Variant[]
  >([]);
  const [variantEdit, setVariantEdit] = useState<Partial<Variant> | null>(null);
  const [variantFormLoading, setVariantFormLoading] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const res = await apiFetch<any>("/api/categories?limit=1000");
      setCategories(res.data.categories || []);
    } catch (err: any) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    if (modalOpen) {
      fetchCategories();
    }
    // eslint-disable-next-line
  }, [page, limit, searchTerm, modalOpen]);

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
        const newProduct: any = await apiFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Product added successfully");
        setProducts((prev) => [newProduct.data, ...prev]);
        fetchProducts();
      } else if (modalMode === "edit" && form._id) {
        const updatedProduct: any = await apiFetch(
          `/api/products/${form._id}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          }
        );
        toast.success("Product updated successfully");
        setProducts((prev) =>
          prev.map((p) =>
            p._id === updatedProduct.data._id ? updatedProduct.data : p
          )
        );
        fetchProducts();
      }
      closeModal();
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = categories.find((cat) => cat._id === selectedId);
    setForm((f) => ({
      ...f,
      category: selected
        ? { _id: selected._id, name: selected.name }
        : { _id: "", name: "" },
    }));
  };

  const openVariantsModal = (product: Product) => {
    setSelectedProductVariants(product.variants || []);
    setForm(product);
    setVariantsModalOpen(true);
  };
  const closeVariantsModal = () => {
    setVariantsModalOpen(false);
    setVariantEdit(null);
  };

  const handleVariantEdit = (variant?: Variant) => {
    setVariantEdit(
      variant || {
        name: "",
        price: 0,
        comparePrice: 0,
        costPrice: 0,
        sku: "",
        stock: 0,
        isActive: true,
      }
    );
  };
  const handleVariantEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setVariantEdit((v) => ({
      ...v!,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleVariantSave = async () => {
    setVariantFormLoading(true);
    try {
      if (variantEdit?._id) {
        const updatedVariant: any = await apiFetch(
          `/api/variants/${variantEdit._id}`,
          {
            method: "PUT",
            body: JSON.stringify(variantEdit),
          }
        );
        toast.success("Variant updated successfully");
        setForm((prev) => ({
          ...prev!,
          variants:
            prev?.variants?.map((v) =>
              v._id === updatedVariant.data._id ? updatedVariant.data : v
            ) || [],
        }));
        fetchProducts();
        setVariantEdit(null);
      } else {
        const newVariant: any = await apiFetch(`/api/variants`, {
          method: "POST",
          body: JSON.stringify({ ...variantEdit, product: form._id }),
        });
        toast.success("Variant added successfully");
        setForm((prev) => ({
          ...prev!,
          variants: prev?.variants
            ? [newVariant.data, ...prev.variants]
            : [newVariant.data],
        }));
        fetchProducts();
        setVariantEdit(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving variant");
    } finally {
      setVariantFormLoading(false);
    }
  };
  const handleVariantDelete = async (variantId: string) => {
    if (!window.confirm("Delete this variant?")) return;
    try {
      await apiFetch(`/api/variants/${variantId}`, { method: "DELETE" });
      fetchProducts();
      setSelectedProductVariants((vs) => vs.filter((v) => v._id !== variantId));
    } catch (err: any) {
      toast.error(err.message || "Error deleting variant");
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='card'>
        <div className='card-header'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Products</h1>
              <p className='text-gray-600 mt-1'>
                Manage product inventory and catalog
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='card'>
        <div className='card-body'>
          <div className='flex items-center space-x-4 justify-between'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search products...'
                value={searchTerm}
                onChange={handleSearch}
                className='search-input'
              />
            </div>
            <Button
              className='btn-primary flex items-center space-x-2'
              onClick={openAddModal}>
              <Plus className='h-4 w-4' />
              <span>Add Product</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading/Error/Empty States */}
      {loading && (
        <div className='empty-state'>
          <Loader2 className='empty-state-icon animate-spin' />
          <p className='empty-state-text'>Loading products...</p>
        </div>
      )}
      {error && (
        <div className='empty-state'>
          <div className='empty-state-icon text-red-500'>⚠️</div>
          <p className='empty-state-text text-red-600'>{error}</p>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div className='empty-state'>
          <Package className='empty-state-icon' />
          <p className='empty-state-text'>No products found.</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && products.length > 0 && (
        <div className='table-container'>
          <div className='overflow-x-auto'>
            <table className='table'>
              <thead className='table-header'>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th className='text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='table-body'>
                {products.map((product) => (
                  <tr key={product._id} className='table-row'>
                    <td className='table-cell'>
                      <div className='flex items-center'>
                        <div className='h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200'>
                          <Package className='h-6 w-6 text-gray-500' />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-semibold text-gray-900'>
                            {product.name}
                          </div>
                          <div className='text-sm text-gray-600 max-w-xs truncate'>
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='table-cell'>
                      <span className='badge-info'>
                        {product.category?.name || "No Category"}
                      </span>
                    </td>
                    <td className='table-cell'>
                      <span className='badge-success'>
                        {product.variants?.length || 0} variants
                      </span>
                    </td>
                    <td className='table-cell'>
                      {product.isActive ? (
                        <span className='badge-success'>Active</span>
                      ) : (
                        <span className='badge-neutral'>Inactive</span>
                      )}
                    </td>
                    <td className='table-cell'>
                      {product.isFeatured ? (
                        <span className='badge-warning flex items-center'>
                          <Star className='h-3 w-3 mr-1' />
                          Featured
                        </span>
                      ) : (
                        <span className='badge-neutral'>Regular</span>
                      )}
                    </td>
                    <td className='table-cell text-sm text-gray-700'>
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className='table-cell text-right'>
                      <div className='flex items-center justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600'
                          onClick={() => openEditModal(product)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 hover:bg-red-50 hover:text-red-600'
                          onClick={() => setDeleteId(product._id)}>
                          <Trash2 className='h-4 w-4' />
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
        <div className='pagination-container'>
          <div className='pagination-info'>
            Showing{" "}
            <span className='font-medium'>{(page - 1) * limit + 1}</span> to
            <span className='font-medium'>
              {" "}
              {Math.min(page * limit, total)}
            </span>{" "}
            of
            <span className='font-medium'> {total}</span> results
          </div>
          <div className='pagination-controls'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className='btn-secondary'>
              Previous
            </Button>
            <span className='text-sm text-gray-700 px-4'>
              Page {page} of {pages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className='btn-secondary'>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
              onClick={closeModal}
              disabled={formLoading}>
              <X className='h-5 w-5' />
            </button>
            <Tabs.Root defaultValue='basic'>
              <Tabs.List className='flex border-b mb-6'>
                <Tabs.Trigger
                  value='basic'
                  className='px-4 py-2 font-medium text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600'>
                  Basic Details
                </Tabs.Trigger>
                <Tabs.Trigger
                  value='variants'
                  className='px-4 py-2 font-medium text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600'>
                  Variants
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value='basic'>
                <form onSubmit={handleFormSubmit} className='space-y-4'>
                  <div>
                    <label className='form-label'>Name</label>
                    <input
                      name='name'
                      value={form.name || ""}
                      onChange={handleFormChange}
                      className='form-input'
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className='form-label'>Description</label>
                    <textarea
                      name='description'
                      value={form.description || ""}
                      onChange={handleFormChange}
                      className='form-textarea'
                      rows={3}
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Category
                    </label>
                    <select
                      name='category'
                      value={form.category?._id || ""}
                      onChange={handleCategoryChange}
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                      required
                      disabled={formLoading}>
                      <option value=''>Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      name='isActive'
                      type='checkbox'
                      checked={!!form.isActive}
                      onChange={handleFormChange}
                      disabled={formLoading}
                      id='isActive'
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='isActive'
                      className='text-sm font-medium text-gray-700'>
                      Active
                    </label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      name='isFeatured'
                      type='checkbox'
                      checked={!!form.isFeatured}
                      onChange={handleFormChange}
                      disabled={formLoading}
                      id='isFeatured'
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='isFeatured'
                      className='text-sm font-medium text-gray-700'>
                      Featured
                    </label>
                  </div>
                  <div className='flex justify-end'>
                    <Button type='submit' disabled={formLoading}>
                      {formLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Tabs.Content>
              <Tabs.Content value='variants'>
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-xl font-bold text-gray-900'>
                      Variants
                    </h3>
                    <Button
                      variant='outline'
                      className='flex items-center gap-2'
                      onClick={() => handleVariantEdit()}>
                      <Plus className='h-4 w-4' /> Add Variant
                    </Button>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full bg-white shadow rounded-lg overflow-hidden'>
                      <thead className='bg-gray-100'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Name
                          </th>

                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Compare Price
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Cost Price
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Status
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Created
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Updated
                          </th>
                          <th className='px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants?.length ? (
                          form.variants.map((variant, idx) => (
                            <tr
                              key={variant._id}
                              className={
                                idx % 2 === 0
                                  ? "bg-white hover:bg-gray-50 transition"
                                  : "bg-gray-50 hover:bg-gray-100 transition"
                              }>
                              <td className='px-6 py-3 text-sm font-medium text-gray-900'>
                                {variant.name}
                              </td>

                              <td className='px-6 py-3 text-sm text-gray-700'>
                                {variant.comparePrice
                                  ? `₹${variant.comparePrice}`
                                  : "-"}
                              </td>
                              <td className='px-6 py-3 text-sm text-gray-700'>
                                {variant.costPrice
                                  ? `₹${variant.costPrice}`
                                  : "-"}
                              </td>
                              <td className='px-6 py-3'>
                                {variant.isActive ? (
                                  <span className='inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700'>
                                    Active
                                  </span>
                                ) : (
                                  <span className='inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-400'>
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className='px-6 py-3 text-xs text-gray-400'>
                                {variant.createdAt
                                  ? new Date(
                                      variant.createdAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className='px-6 py-3 text-xs text-gray-400'>
                                {variant.updatedAt
                                  ? new Date(
                                      variant.updatedAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className='px-6 py-3 text-right flex gap-2 justify-end'>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 border-gray-200 hover:bg-gray-200 hover:text-gray-700'
                                  onClick={() => handleVariantEdit(variant)}>
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 border-gray-200 hover:bg-gray-200 hover:text-red-600'
                                  onClick={() =>
                                    handleVariantDelete(variant._id!)
                                  }>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={8}
                              className='text-center text-gray-400 py-8'>
                              No variants found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Variant Edit Form Modal */}
                  {variantEdit && (
                    <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/40'>
                      <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
                        <button
                          className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
                          onClick={() => setVariantEdit(null)}>
                          <X className='h-5 w-5' />
                        </button>
                        <h3 className='text-lg font-semibold mb-4'>
                          {variantEdit._id ? "Edit Variant" : "Add Variant"}
                        </h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleVariantSave();
                          }}
                          className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Name
                            </label>
                            <input
                              name='name'
                              value={variantEdit.name || ""}
                              onChange={handleVariantEditChange}
                              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                              required
                              disabled={variantFormLoading}
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Price
                            </label>
                            <input
                              name='price'
                              type='number'
                              value={variantEdit.price || 0}
                              onChange={handleVariantEditChange}
                              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                              required
                              disabled={variantFormLoading}
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Compare Price
                            </label>
                            <input
                              name='comparePrice'
                              type='number'
                              value={variantEdit.comparePrice || ""}
                              onChange={handleVariantEditChange}
                              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                              disabled={variantFormLoading}
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Cost Price
                            </label>
                            <input
                              name='costPrice'
                              type='number'
                              value={variantEdit.costPrice || ""}
                              onChange={handleVariantEditChange}
                              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                              disabled={variantFormLoading}
                            />
                          </div>
                          <div className='flex items-center space-x-2'>
                            <input
                              name='isActive'
                              type='checkbox'
                              checked={!!variantEdit.isActive}
                              onChange={(e) =>
                                setVariantEdit((v) => ({
                                  ...v!,
                                  isActive: e.target.checked,
                                }))
                              }
                              disabled={variantFormLoading}
                              id='variantIsActive'
                              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                            <label
                              htmlFor='variantIsActive'
                              className='text-sm'>
                              Active
                            </label>
                          </div>
                          <div className='flex justify-end space-x-2'>
                            {variantEdit._id && (
                              <Button
                                variant='outline'
                                type='button'
                                className='border-gray-200 hover:bg-gray-200 hover:text-red-600'
                                onClick={() =>
                                  handleVariantDelete(variantEdit._id!)
                                }
                                disabled={variantFormLoading}>
                                Delete
                              </Button>
                            )}
                            <Button type='submit' disabled={variantFormLoading}>
                              {variantFormLoading ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Delete Product
              </h2>
            </div>
            <div className='modal-body'>
              <p className='text-gray-700'>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
            </div>
            <div className='modal-footer'>
              <div className='flex justify-end space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                  className='btn-secondary'>
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className='btn-danger'>
                  {deleteLoading && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variants Modal */}
      {variantsModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-lg shadow-2xl w-full max-w-5xl p-8 relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
              onClick={closeVariantsModal}>
              <X className='h-5 w-5' />
            </button>
            <h2 className='text-2xl font-bold mb-6'>
              Manage Variants for {form.name}
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 border rounded-lg'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Name
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Price
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Compare Price
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Cost Price
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Status
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Created
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                      Updated
                    </th>
                    <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {selectedProductVariants.map((variant) => (
                    <tr key={variant._id} className='hover:bg-gray-50'>
                      <td className='px-4 py-2'>{variant.name}</td>
                      <td className='px-4 py-2'>₹{variant.price}</td>
                      <td className='px-4 py-2'>
                        {variant.comparePrice
                          ? `₹${variant.comparePrice}`
                          : "-"}
                      </td>
                      <td className='px-4 py-2'>
                        {variant.costPrice ? `₹${variant.costPrice}` : "-"}
                      </td>
                      <td className='px-4 py-2'>
                        {variant.isActive ? (
                          <span className='text-green-600 font-medium'>
                            Active
                          </span>
                        ) : (
                          <span className='text-gray-400'>Inactive</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-xs text-gray-400'>
                        {variant.createdAt
                          ? new Date(variant.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className='px-4 py-2 text-xs text-gray-400'>
                        {variant.updatedAt
                          ? new Date(variant.updatedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className='px-4 py-2 text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleVariantEdit(variant)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleVariantDelete(variant._id!)}>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Variant Edit Form Modal */}
            {variantEdit && (
              <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/40'>
                <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
                  <button
                    className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
                    onClick={() => setVariantEdit(null)}>
                    <X className='h-5 w-5' />
                  </button>
                  <h3 className='text-lg font-semibold mb-4'>
                    {variantEdit._id ? "Edit Variant" : "Add Variant"}
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVariantSave();
                    }}
                    className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Name
                      </label>
                      <input
                        name='name'
                        value={variantEdit.name || ""}
                        onChange={handleVariantEditChange}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                        required
                        disabled={variantFormLoading}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Price
                      </label>
                      <input
                        name='price'
                        type='number'
                        value={variantEdit.price || 0}
                        onChange={handleVariantEditChange}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                        required
                        disabled={variantFormLoading}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Compare Price
                      </label>
                      <input
                        name='comparePrice'
                        type='number'
                        value={variantEdit.comparePrice || ""}
                        onChange={handleVariantEditChange}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                        disabled={variantFormLoading}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Cost Price
                      </label>
                      <input
                        name='costPrice'
                        type='number'
                        value={variantEdit.costPrice || ""}
                        onChange={handleVariantEditChange}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                        disabled={variantFormLoading}
                      />
                    </div>
                    <div className='flex items-center space-x-2'>
                      <input
                        name='isActive'
                        type='checkbox'
                        checked={!!variantEdit.isActive}
                        onChange={(e) =>
                          setVariantEdit((v) => ({
                            ...v!,
                            isActive: e.target.checked,
                          }))
                        }
                        disabled={variantFormLoading}
                        id='variantIsActive'
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <label htmlFor='variantIsActive' className='text-sm'>
                        Active
                      </label>
                    </div>
                    <div className='flex justify-end space-x-2'>
                      {variantEdit._id && (
                        <Button
                          variant='destructive'
                          type='button'
                          onClick={() => handleVariantDelete(variantEdit._id!)}
                          disabled={variantFormLoading}>
                          Delete
                        </Button>
                      )}
                      <Button type='submit' disabled={variantFormLoading}>
                        {variantFormLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
