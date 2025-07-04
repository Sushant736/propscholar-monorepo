"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Eye, Loader2, X, Box } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface Order {
  _id: string;
  orderNumber?: string;
  user: { _id: string; name: string; email: string; phone?: string };
  status: string;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  items: {
    _id: string;
    product: { _id: string; name: string; images?: string[] };
    variant: { _id: string; name: string };
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  pricing?: {
    subtotal: number;
    tax: number;
    discount: number;
    shippingCost: number;
    total: number;
  };
  customerDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentDetails?: {
    paymentMethod: string;
    merchantOrderId: string;
    amount: number;
    currency: string;
    status: string;
    _id: string;
    refundDetails: any[];
    phonepeOrderId: string;
  };
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    _id: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    _id: string;
  };
}

interface OrdersApiResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedOrderNumber = useDebouncedValue(orderNumber, 400);
  const debouncedCustomerName = useDebouncedValue(customerName, 400);
  const debouncedCustomerEmail = useDebouncedValue(customerEmail, 400);
  const debouncedStatus = useDebouncedValue(statusFilter, 400);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(debouncedOrderNumber ? { orderNumber: debouncedOrderNumber } : {}),
      ...(debouncedCustomerName ? { customerName: debouncedCustomerName } : {}),
      ...(debouncedCustomerEmail
        ? { customerEmail: debouncedCustomerEmail }
        : {}),
      ...(debouncedStatus ? { status: debouncedStatus } : {}),
    });
    apiFetch<OrdersApiResponse>(`/api/orders/admin?${params}`)
      .then((data) => {
        setOrders(data.data.orders);
        setTotal(data.data.pagination.total);
        setPages(data.data.pagination.pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [
    page,
    limit,
    searchTerm,
    debouncedOrderNumber,
    debouncedCustomerName,
    debouncedCustomerEmail,
    debouncedStatus,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Add status badge helper
  const statusBadge = (status: string) => {
    let color = "bg-gray-200 text-gray-700";
    if (status === "pending") color = "bg-yellow-100 text-yellow-800";
    else if (status === "completed") color = "bg-green-100 text-green-800";
    else if (status === "cancelled") color = "bg-red-100 text-red-800";
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
          <p className='text-gray-600'>Manage and review customer orders</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className='flex items-center gap-4 mb-2'>
        <div className='relative flex-1 max-w-xs'>
          <input
            type='text'
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setPage(1);
            }}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            placeholder='Order No'
          />
        </div>
        <div className='relative flex-1 max-w-xs'>
          <input
            type='text'
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setPage(1);
            }}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            placeholder='Customer Name'
          />
        </div>
        <div className='relative flex-1 max-w-xs'>
          <input
            type='text'
            value={customerEmail}
            onChange={(e) => {
              setCustomerEmail(e.target.value);
              setPage(1);
            }}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            placeholder='Customer Email'
          />
        </div>
        <div className='relative flex-1 max-w-xs'>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none'>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className='flex items-center'>
          <button
            type='button'
            className='px-3 py-2 rounded-md border text-xs font-medium bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
            onClick={() => {
              setOrderNumber("");
              setCustomerName("");
              setCustomerEmail("");
              setStatusFilter("");
              setPage(1);
            }}
            disabled={
              !orderNumber && !customerName && !customerEmail && !statusFilter
            }>
            Clear
          </button>
        </div>
      </div>
      {loading && (
        <div className='text-center text-gray-500 py-10'>
          <Loader2 className='mx-auto h-6 w-6 animate-spin mb-2' />
          Loading orders...
        </div>
      )}
      {error && <div className='text-center text-red-500 py-10'>{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className='text-center text-gray-500 py-10'>No orders found.</div>
      )}
      {!loading && !error && orders.length > 0 && (
        <div className='overflow-x-auto bg-white rounded-lg border border-gray-200'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Order ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Price
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
              {orders.map((order, idx) => (
                <tr
                  key={order.orderNumber}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className='px-6 py-3 text-sm font-mono text-gray-900'>
                    {order.orderNumber}
                  </td>
                  <td className='px-6 py-3 text-sm text-gray-700'>
                    {order.user?.name || "-"}
                  </td>
                  <td className='px-6 py-3 text-sm'>
                    {statusBadge(order.status)}
                  </td>
                  <td className='px-6 py-3 text-sm text-gray-900 font-semibold'>
                    ₹{order.pricing?.total ?? order.total ?? "-"}
                  </td>
                  <td className='px-6 py-3 text-xs text-gray-400'>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className='px-6 py-3 text-xs text-gray-400'>
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className='px-6 py-3 text-right'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 border-gray-200 hover:bg-gray-200 hover:text-gray-700'
                      onClick={() => setSelectedOrder(order)}>
                      <Eye className='h-4 w-4' />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && orders.length > 0 && (
        <div className='flex items-center justify-between mt-4'>
          <div className='text-sm text-gray-700'>
            Showing{" "}
            <span className='font-medium'>{(page - 1) * limit + 1}</span> to
            <span className='font-medium'>
              {" "}
              {Math.min(page * limit, total)}
            </span>{" "}
            of
            <span className='font-medium'> {total}</span> results
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
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full shadow p-1'
              onClick={() => setSelectedOrder(null)}>
              <X className='h-5 w-5' />
            </button>
            <h2 className='text-lg font-semibold px-6 pt-6 pb-2 border-b'>
              Order Details
            </h2>
            <div className='px-6 py-4 space-y-4'>
              {/* Order Info */}
              <section>
                <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                  Order Info
                </div>
                <div className='grid grid-cols-2 gap-x-6 gap-y-1 text-sm'>
                  <div>
                    <div className='text-xs text-gray-400'>Order Number</div>
                    <div className='font-mono text-base text-gray-900'>
                      {selectedOrder.orderNumber || selectedOrder._id}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Status</div>
                    <div className='text-sm mb-2'>
                      {statusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Created</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Updated</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.updatedAt
                        ? new Date(selectedOrder.updatedAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </section>
              {/* Customer Info */}
              <section>
                <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                  Customer
                </div>
                <div className='grid grid-cols-2 gap-x-6 gap-y-1 text-sm'>
                  <div>
                    <div className='text-xs text-gray-400'>Name</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.customerDetails?.name}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Email</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.customerDetails?.email}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Phone</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.customerDetails?.phone}
                    </div>
                  </div>
                </div>
              </section>
              {/* Payment Info */}
              <section>
                <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                  Payment
                </div>
                <div className='grid grid-cols-2 gap-x-6 gap-y-1 text-sm'>
                  <div>
                    <div className='text-xs text-gray-400'>Method</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.paymentDetails?.paymentMethod?.toUpperCase() ||
                        "-"}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Status</div>
                    <div className='text-sm text-gray-700'>
                      {selectedOrder.paymentDetails?.status}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>Amount</div>
                    <div className='text-sm text-gray-700'>
                      ₹
                      {selectedOrder.paymentDetails?.amount
                        ? (selectedOrder.paymentDetails.amount / 100).toFixed(2)
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>
                      Merchant Order ID
                    </div>
                    <div className='text-xs font-mono text-gray-600 break-all'>
                      {selectedOrder.paymentDetails?.merchantOrderId}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs text-gray-400'>
                      PhonePe Order ID
                    </div>
                    <div className='text-xs font-mono text-gray-600 break-all'>
                      {selectedOrder.paymentDetails?.phonepeOrderId}
                    </div>
                  </div>
                </div>
              </section>
              {/* Addresses */}
              <section className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                    Shipping Address
                  </div>
                  <div className='text-xs text-gray-400 mb-1'>
                    {selectedOrder.shippingAddress?.name}
                  </div>
                  <div className='text-sm text-gray-700 whitespace-pre-line'>
                    {selectedOrder.shippingAddress?.address}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {selectedOrder.shippingAddress?.country} -{" "}
                    {selectedOrder.shippingAddress?.zipCode}
                  </div>
                  <div className='text-sm text-gray-700'>
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </div>
                </div>
                <div>
                  <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                    Billing Address
                  </div>
                  <div className='text-xs text-gray-400 mb-1'>
                    {selectedOrder.billingAddress?.name}
                  </div>
                  <div className='text-sm text-gray-700 whitespace-pre-line'>
                    {selectedOrder.billingAddress?.address}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {selectedOrder.billingAddress?.city},{" "}
                    {selectedOrder.billingAddress?.state}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {selectedOrder.billingAddress?.country} -{" "}
                    {selectedOrder.billingAddress?.zipCode}
                  </div>
                  <div className='text-sm text-gray-700'>
                    Phone: {selectedOrder.billingAddress?.phone}
                  </div>
                </div>
              </section>
              {/* Order Items */}
              <section>
                <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                  Order Items
                </div>
                <div className='overflow-x-auto'>
                  <div className='rounded-xl shadow-sm bg-white border border-gray-100'>
                    <table className='min-w-full text-xs bg-white'>
                      <thead className='bg-gray-50 sticky top-0 z-10 shadow-sm'>
                        <tr>
                          <th className='text-left py-2 px-4 font-semibold rounded-tl-xl'>
                            Product
                          </th>
                          <th className='text-left py-2 px-4 font-semibold'>
                            Variant
                          </th>
                          <th className='text-left py-2 px-4 font-semibold'>
                            Qty
                          </th>
                          <th className='text-left py-2 px-4 font-semibold'>
                            Price
                          </th>
                          <th className='text-left py-2 px-4 font-semibold rounded-tr-xl'>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
                          <tr
                            key={idx}
                            className='hover:bg-gray-50 transition group'>
                            <td className='py-2 px-4 font-medium text-gray-900 flex items-center gap-2 rounded-l-xl group-first:rounded-tl-xl group-last:rounded-bl-xl'>
                              <Box className='w-4 h-4 text-gray-400' />
                              <span>{item.product.name}</span>
                            </td>
                            <td className='py-2 px-4 text-gray-700'>
                              {item.variant.name}
                            </td>
                            <td className='py-2 px-4'>{item.quantity}</td>
                            <td className='py-2 px-4'>₹{item.price}</td>
                            <td className='py-2 px-4 rounded-r-xl group-first:rounded-tr-xl group-last:rounded-br-xl'>
                              ₹{item.totalPrice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              {/* Pricing */}
              <section>
                <div className='font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider'>
                  Pricing
                </div>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.pricing?.subtotal}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tax:</span>
                    <span>₹{selectedOrder.pricing?.tax}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.pricing?.shippingCost}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Discount:</span>
                    <span>₹{selectedOrder.pricing?.discount}</span>
                  </div>
                  <div className='flex justify-between text-base font-bold mt-2'>
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricing?.total}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
