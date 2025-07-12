// src/pages/admin/ManageOrders.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getAdminOrders } from '../../services/api';
import { useAuth } from '../../context/AuthenticationContext';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const {user} = useAuth();

  let collegeId;
      if (user?.selectedCollegeId) {
          collegeId = user.selectedCollegeId;
      } else {
          const storedCollege = localStorage.getItem('selectedCollege');
          if (storedCollege) {
              try {
                  collegeId = JSON.parse(storedCollege).id;
              } catch (e) {
                  console.error("Error parsing stored college data:", e);
                  // Handle error, maybe clear localStorage or set a default
                  collegeId = '';
              }
          }
      }

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeTab));
    }
  }, [activeTab, orders]);

  const fetchOrders = async () => {
    try {
      const response = await getAdminOrders(collegeId);
      setOrders(response.data);
      setFilteredOrders(activeTab === 'all' ? response.data : response.data.filter(order => order.status === activeTab));
      setError(null);
    } catch (error) {
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus, collegeId });
      toast.success(`Order status updated to ${newStatus}`);
      // Update the order status in the local state
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Update error:', error);
    }
  };

  const renderStatusActions = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <button 
              onClick={() => updateOrderStatus(order._id, 'confirmed')}
              className="flex-1 py-2 bg-blue-500 text-white font-body font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              Confirm Order
            </button>
            <button 
              onClick={() => updateOrderStatus(order._id, 'cancelled')}
              className="flex-1 py-2 bg-red-500 text-white font-body font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Cancel Order
            </button>
          </>
        );
      case 'confirmed':
        return (
          <>
            <button 
              onClick={() => updateOrderStatus(order._id, 'preparing')}
              className="flex-1 py-2 bg-yellow-500 text-white font-body font-medium rounded-md hover:bg-yellow-600 transition-colors"
            >
              Start Preparing
            </button>
            <button 
              onClick={() => updateOrderStatus(order._id, 'cancelled')}
              className="flex-1 py-2 bg-red-500 text-white font-body font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Cancel Order
            </button>
          </>
        );
      case 'preparing':
        return (
          <>
            <button 
              onClick={() => updateOrderStatus(order._id, 'ready')}
              className="flex-1 py-2 bg-green-500 text-white font-body font-medium rounded-md hover:bg-green-600 transition-colors"
            >
              Mark as Ready
            </button>
            <button 
              onClick={() => updateOrderStatus(order._id, 'cancelled')}
              className="flex-1 py-2 bg-red-500 text-white font-body font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Cancel Order
            </button>
          </>
        );
      case 'ready':
        return (
          <button 
            onClick={() => updateOrderStatus(order._id, 'completed')}
            className="flex-1 py-2 bg-purple-500 text-white font-body font-medium rounded-md hover:bg-purple-600 transition-colors"
          >
            Complete Order
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error Loading Orders</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-primary mb-6">Manage Orders</h1>
      
      {/* Tabs for filtering orders */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Order filters">
          {tabs.map((tab) => {
            // Count orders for this status
            const count = tab.id === 'all' 
              ? orders.length 
              : orders.filter(order => order.status === tab.id).length;
              
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                  }
                `}
              >
                {tab.label} 
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="font-display text-2xl font-bold text-primary">No {activeTab !== 'all' ? activeTab : ''} Orders</h2>
          <p className="mt-2 font-body text-primary/70">
            {activeTab === 'all' 
              ? 'There are currently no orders in the system' 
              : `There are no orders with "${activeTab}" status`}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {filteredOrders.map((order) => (
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
                    <p className="mt-1 font-body text-sm text-primary/70">
                      Customer: {order.userId?.name || 'Unknown'}
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
                  <div className="flex justify-between mb-4">
                    <p className="font-body font-medium text-primary">Total Amount</p>
                    <p className="font-body font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    {renderStatusActions(order)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}