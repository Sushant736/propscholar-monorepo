"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Copy,
  Loader2,
  Package,
  CreditCard,
} from "lucide-react";
import { ordersApi, Order } from "@/lib/api/orders";
import { toast } from "sonner";

type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "LOADING" | "ERROR";

interface PaymentResult {
  status: PaymentStatus;
  order?: Order;
  message?: string;
  transactionId?: string;
}

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderId =
    searchParams.get("orderId") || localStorage.getItem("pendingOrderId");

  const [result, setResult] = useState<PaymentResult>({ status: "LOADING" });
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stoppedRef = useRef(false);

  // Helper to map backend payment status to UI status
  const mapPaymentStatus = (status: string): PaymentStatus => {
    switch (status) {
      case "completed":
        return "SUCCESS";
      case "failed":
      case "cancelled":
        return "FAILED";
      case "pending":
      case "processing":
        return "PENDING";
      default:
        return "ERROR";
    }
  };

  useEffect(() => {
    stoppedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!orderId) {
      setResult({
        status: "ERROR",
        message:
          "No order information found. Please contact support if you were charged.",
      });
      return;
    }

    const pollStatus = async () => {
      try {
        const paymentStatusRes = await ordersApi.checkPaymentStatus(orderId);
        const backendStatus =
          paymentStatusRes.order.paymentStatus || paymentStatusRes.order.status;
        const mappedStatus = mapPaymentStatus(backendStatus);
        const order = await ordersApi.getById(orderId);
        if (mappedStatus === "SUCCESS") {
          await clearCart();
          if (typeof import("@/lib/api/cart").then === "function") {
            const cartApi = (await import("@/lib/api/cart")).cartApi;
            if (cartApi?.clearCart) {
              try {
                await cartApi.clearCart();
              } catch (e) {
                /* ignore error */
              }
            }
          }
          localStorage.removeItem("pendingOrderId");
          setResult({
            status: mappedStatus,
            order,
            transactionId: order.paymentDetails.phonepeTransactionId,
          });
          stoppedRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (mappedStatus === "FAILED" || mappedStatus === "ERROR") {
          setResult({
            status: mappedStatus,
            order,
            message: "Payment failed. Please try again or contact support.",
          });
          stoppedRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setResult({
            status: mappedStatus,
            order,
            message: "Payment is being processed. Please wait...",
          });
        }
      } catch (error) {
        setResult({
          status: "ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to verify payment status.",
        });
        stoppedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    pollStatus();
    intervalRef.current = setInterval(() => {
      if (!stoppedRef.current) pollStatus();
    }, 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stoppedRef.current = true;
    };
  }, [orderId]);

  const copyOrderId = async () => {
    if (result.order?._id) {
      await navigator.clipboard.writeText(result.order._id);
      setCopied(true);
      toast.success("Order ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case "SUCCESS":
        return <CheckCircle className='h-16 w-16 text-green-500' />;
      case "FAILED":
        return <XCircle className='h-16 w-16 text-red-500' />;
      case "PENDING":
        return <Clock className='h-16 w-16 text-yellow-500' />;
      case "LOADING":
        return (
          <Loader2 className='h-16 w-16 text-prop-scholar-electric-blue animate-spin' />
        );
      default:
        return <AlertTriangle className='h-16 w-16 text-orange-500' />;
    }
  };

  const getStatusTitle = () => {
    switch (result.status) {
      case "SUCCESS":
        return "Payment Successful!";
      case "FAILED":
        return "Payment Failed";
      case "PENDING":
        return "Payment Pending";
      case "LOADING":
        return "Verifying Payment...";
      default:
        return "Payment Error";
    }
  };

  const getStatusMessage = () => {
    if (result.message) return result.message;

    switch (result.status) {
      case "SUCCESS":
        return "Your order has been placed successfully. You will receive a confirmation email shortly.";
      case "FAILED":
        return "Your payment could not be processed. Please try again or contact support.";
      case "PENDING":
        return "Your payment is being processed. This may take a few minutes.";
      case "LOADING":
        return "Please wait while we verify your payment...";
      default:
        return "There was an issue processing your payment. Please contact support.";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy'>
      <PropScholarNavbar />

      <div className='pt-24 pb-12 px-4'>
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-8'>
            {getStatusIcon()}
            <h1 className='text-3xl md:text-4xl font-bold text-prop-scholar-main-text mt-6 mb-4'>
              {getStatusTitle()}
            </h1>
            <p className='text-prop-scholar-secondary-text text-lg max-w-2xl mx-auto'>
              {getStatusMessage()}
            </p>
          </motion.div>

          {result.order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6 mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Package className='h-6 w-6 text-prop-scholar-electric-blue' />
                <h2 className='text-prop-scholar-main-text font-bold text-xl'>
                  Order Details
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Order Information */}
                <div className='space-y-4'>
                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Order ID
                    </label>
                    <div className='flex items-center gap-2 mt-1'>
                      <span className='text-prop-scholar-main-text font-mono text-sm bg-white/10 px-3 py-2 rounded-lg flex-1'>
                        {result.order._id}
                      </span>
                      <button
                        onClick={copyOrderId}
                        className='p-2 text-prop-scholar-electric-blue hover:bg-white/10 rounded-lg transition-colors'
                        title='Copy Order ID'>
                        {copied ? (
                          <CheckCircle className='h-4 w-4' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Order Date
                    </label>
                    <p className='text-prop-scholar-main-text mt-1'>
                      {formatDate(result.order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Order Status
                    </label>
                    <p className='text-prop-scholar-main-text mt-1 capitalize'>
                      {result.order.status.replace("_", " ").toLowerCase()}
                    </p>
                  </div>

                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Total Amount
                    </label>
                    <p className='text-prop-scholar-main-text font-bold text-lg mt-1'>
                      ₹{result.order.pricing.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className='space-y-4'>
                  {result.transactionId && (
                    <div>
                      <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                        Transaction ID
                      </label>
                      <p className='text-prop-scholar-main-text font-mono text-sm bg-white/10 px-3 py-2 rounded-lg mt-1'>
                        {result.transactionId}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Payment Method
                    </label>
                    <div className='flex items-center gap-2 mt-1'>
                      <CreditCard className='h-4 w-4 text-prop-scholar-electric-blue' />
                      <span className='text-prop-scholar-main-text'>
                        {result.order.paymentDetails?.paymentMethod ||
                          "PhonePe"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                      Payment Status
                    </label>
                    <div className='flex items-center gap-2 mt-1'>
                      {result.order.paymentDetails?.status === "completed" && (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      )}
                      {(result.order.paymentDetails?.status === "failed" ||
                        result.order.paymentDetails?.status ===
                          "cancelled") && (
                        <XCircle className='h-4 w-4 text-red-500' />
                      )}
                      {(result.order.paymentDetails?.status === "pending" ||
                        result.order.paymentDetails?.status ===
                          "processing") && (
                        <Clock className='h-4 w-4 text-yellow-500' />
                      )}
                      <span className='text-prop-scholar-main-text capitalize'>
                        {result.order.paymentDetails?.status?.toLowerCase() ||
                          "Processing"}
                      </span>
                    </div>
                  </div>

                  {result.order.paymentDetails?.paymentTimestamp && (
                    <div>
                      <label className='text-prop-scholar-secondary-text text-sm font-medium'>
                        Payment Time
                      </label>
                      <p className='text-prop-scholar-main-text mt-1'>
                        {formatDate(
                          result.order.paymentDetails.paymentTimestamp
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Items */}
          {result.order?.items && result.order.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='bg-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6 mb-8'>
              <h3 className='text-prop-scholar-main-text font-bold text-xl mb-6'>
                Order Items
              </h3>

              <div className='space-y-4'>
                {result.order.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                    <div>
                      <h4 className='text-prop-scholar-main-text font-medium'>
                        {item.product?.name}
                        {item.variant?.name ? ` (${item.variant.name})` : ""}
                      </h4>
                      <p className='text-prop-scholar-secondary-text text-sm'>
                        Quantity: {item.quantity} × ₹
                        {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-prop-scholar-main-text font-bold'>
                        ₹{item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-4 justify-center'>
            {result.status === "SUCCESS" && (
              <>
                <button
                  onClick={() => router.push("/shop")}
                  className='flex items-center justify-center gap-2 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)]'>
                  Continue Shopping
                  <ArrowRight className='h-5 w-5' />
                </button>
              </>
            )}

            {result.status === "FAILED" && (
              <>
                <button
                  onClick={() => router.push("/cart")}
                  className='flex items-center justify-center gap-2 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)]'>
                  Try Again
                  <ArrowRight className='h-5 w-5' />
                </button>

                <button
                  onClick={() => router.push("/shop")}
                  className='flex items-center justify-center gap-2 bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text hover:bg-white/20 px-6 py-3 rounded-xl font-medium transition-all duration-300'>
                  Continue Shopping
                </button>
              </>
            )}

            {result.status === "PENDING" && (
              <button
                onClick={() => window.location.reload()}
                className='flex items-center justify-center gap-2 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)]'>
                <Loader2 className='h-5 w-5 animate-spin' />
                Refresh Status
              </button>
            )}

            {(result.status === "ERROR" || result.status === "LOADING") && (
              <button
                onClick={() => router.push("/shop")}
                className='flex items-center justify-center gap-2 bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)]'>
                Go to Shop
                <ArrowRight className='h-5 w-5' />
              </button>
            )}
          </motion.div>

          {/* Help Section */}
          {(result.status === "FAILED" || result.status === "ERROR") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className='mt-8 text-center'>
              <div className='bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6'>
                <AlertTriangle className='h-8 w-8 text-orange-500 mx-auto mb-4' />
                <h3 className='text-prop-scholar-main-text font-bold text-lg mb-2'>
                  Need Help?
                </h3>
                <p className='text-prop-scholar-secondary-text mb-4'>
                  If you were charged but don&apos;t see your order, or if
                  you&apos;re experiencing issues, please contact our support
                  team with your order details.
                </p>
                <div className='flex flex-col sm:flex-row gap-2 justify-center text-sm'>
                  <span className='text-prop-scholar-secondary-text'>
                    Email: support@propscholar.com
                  </span>
                  <span className='text-prop-scholar-secondary-text hidden sm:inline'>
                    |
                  </span>
                  <span className='text-prop-scholar-secondary-text'>
                    Phone: +91 12345 67890
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-lg'>Loading...</p>
          </div>
        </div>
      }>
      <PaymentResultContent />
    </Suspense>
  );
}
