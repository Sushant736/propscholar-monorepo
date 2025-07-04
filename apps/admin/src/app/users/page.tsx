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
  X,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const initialForm: Partial<User> = {
  name: "",
  email: "",
  phone: "",
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<User>>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users
  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(searchTerm ? { search: searchTerm } : {}),
    });
    apiFetch<UsersApiResponse>(`/api/users?${params}`)
      .then((data) => {
        setUsers(data.data.users);
        setTotal(data.data.pagination.total);
        setPages(data.data.pagination.pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, limit, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Add/Edit User
  const openAddModal = () => {
    setForm(initialForm);
    setModalMode("add");
    setModalOpen(true);
  };
  const openEditModal = (user: User) => {
    setForm(user);
    setModalMode("edit");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    // Phone validation: must be 10 digits (customize as needed)
    const phoneRegex = /^\d{10}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      toast.warning("Please enter a valid 10-digit phone number.");
      setFormLoading(false);
      return;
    }
    try {
      if (modalMode === "add") {
        await apiFetch<UsersApiResponse>("/api/users", {
          method: "POST",
          body: JSON.stringify(form),
        });
      } else if (modalMode === "edit" && form._id) {
        await apiFetch<UsersApiResponse>(`/api/users/${form._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "API call was not successful.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete User
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/users/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
          <p className='text-gray-600'>Manage user accounts and permissions</p>
        </div>
        <Button className='flex items-center space-x-2' onClick={openAddModal}>
          <Plus className='h-4 w-4' />
          <span>Add User</span>
        </Button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={handleSearch}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
        <Button variant='outline' className='flex items-center space-x-2'>
          <Filter className='h-4 w-4' />
          <span>Filters</span>
        </Button>
      </div>

      {/* Loading/Error/Empty States */}
      {loading && (
        <div className='text-center text-gray-500 py-10'>Loading users...</div>
      )}
      {error && <div className='text-center text-red-500 py-10'>{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div className='text-center text-gray-500 py-10'>No users found.</div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Phone
                  </th>

                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {users.map((user) => (
                  <tr key={user._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                          <span className='text-sm font-medium text-gray-700'>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {user.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {user.phone || "-"}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => openEditModal(user)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => setDeleteId(user._id)}>
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
      {!loading && !error && users.length > 0 && (
        <div className='flex items-center justify-between mt-4'>
          <div className='text-sm text-gray-700'>
            Showing{" "}
            <span className='font-medium'>{(page - 1) * limit + 1}</span> to
            <span className='font-medium'>
              {Math.min(page * limit, total)}
            </span>{" "}
            of
            <span className='font-medium'>{total}</span> results
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className='text-sm'>
              Page {page} of {pages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
              onClick={closeModal}
              disabled={formLoading}>
              <X className='h-5 w-5' />
            </button>
            <h2 className='text-lg font-semibold mb-4'>
              {modalMode === "add" ? "Add User" : "Edit User"}
            </h2>
            <form onSubmit={handleFormSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input
                  name='name'
                  value={form.name || ""}
                  onChange={handleFormChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Email</label>
                <input
                  name='email'
                  type='email'
                  value={form.email || ""}
                  onChange={handleFormChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Phone</label>
                <input
                  name='phone'
                  value={form.phone || ""}
                  onChange={handleFormChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                  disabled={formLoading}
                />
              </div>
              <Button type='submit' className='w-full' disabled={formLoading}>
                {formLoading && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                {modalMode === "add" ? "Add User" : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative'>
            <h2 className='text-lg font-semibold mb-4'>Delete User</h2>
            <p className='mb-6'>Are you sure you want to delete this user?</p>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={deleteLoading}>
                {deleteLoading && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
