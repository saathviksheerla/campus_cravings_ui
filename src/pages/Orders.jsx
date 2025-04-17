// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-primary">No Orders Yet</h2>
          <p className="mt-2 font-body text-primary/70">Your order history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Your Orders</h1>
      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-elegant rounded-lg overflow-hidden">
            <div className="px-6 py-6 border-b border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-xl font-bold text-primary">
                    Order #<span className="font-mono tracking-wider text-blue-700">{order.pickupCode}</span>
                  </h3>
                  <p className="mt-1 font-body text-sm text-primary/70">
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="px-4 py-2 bg-accent/10 rounded-full">
                  <span className="font-body font-medium text-primary capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              <h4 className="font-body text-sm font-medium text-primary/70">Order Items</h4>
              <ul className="mt-4 divide-y divide-primary/10">
                {order.items.map((item, index) => (
                  <li key={index} className="py-4 flex justify-between">
                    <div className="flex-1">
                      <p className="font-body text-primary">
                        {item.quantity}x {item.name}
                      </p>
                      {item.specialInstructions && (
                        <p className="mt-1 text-sm text-primary/70">{item.specialInstructions}</p>
                      )}
                    </div>
                    <p className="font-body font-medium text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-primary/10">
                <div className="flex justify-between">
                  <p className="font-body font-medium text-primary">Total Amount</p>
                  <p className="font-body font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}