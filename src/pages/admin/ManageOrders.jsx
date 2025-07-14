// src/pages/admin/ManageOrders.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { user } = useAuth();
  const pollingRef = useRef(null);
  const isActiveRef = useRef(true);

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

  // Helper function to check if current time is peak hours
  const isPeakTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    // Peak times: 8am-10am, 11:30am-2pm, 4pm-5:30pm
    const peakRanges = [
      { start: 8 * 60, end: 10 * 60 },           // 8:00 AM - 10:00 AM
      { start: 11 * 60 + 30, end: 14 * 60 },     // 11:30 AM - 2:00 PM
      { start: 16 * 60, end: 17 * 60 + 30 }      // 4:00 PM - 5:30 PM
    ];
    
    return peakRanges.some(range => 
      timeInMinutes >= range.start && timeInMinutes <= range.end
    );
  };

  // Helper function to determine polling interval
  const getPollingInterval = () => {
    if (isPeakTime()) {
      return 3000; // 3 seconds during peak hours
    }
    
    // Check if it's a quiet period (very few orders)
    const totalOrders = orders.length;
    if (totalOrders <= 2) {
      return 10000; // 10 seconds during very quiet periods
    }
    
    return 5000; // 5 seconds during normal times
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (document.hidden) {
        // Tab is hidden, stop polling
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
        setIsPolling(false);
      } else {
        // Tab is visible, resume polling
        if (!loading && !error) {
          startPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, error]);

  // Fetch orders with optional refresh flag
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await getAdminOrders(collegeId);
      setOrders(response.data);
      setFilteredOrders(activeTab === 'all' ? response.data : response.data.filter(order => order.status === activeTab));
      setError(null);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        toast.success('Orders refreshed');
      }
    } catch (error) {
      setError('Failed to load orders');
      if (!isRefresh) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [collegeId, activeTab]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }
    
    setIsPolling(true);
    
    const poll = async () => {
      if (isActiveRef.current && !document.hidden) {
        try {
          await fetchOrders();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
      
      // Schedule next poll
      if (isActiveRef.current) {
        pollingRef.current = setTimeout(poll, getPollingInterval());
      }
    };
    
    pollingRef.current = setTimeout(poll, getPollingInterval());
  }, [fetchOrders]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Manual refresh
  const handleManualRefresh = () => {
    fetchOrders(true);
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Start polling after initial load
  useEffect(() => {
    if (!loading && !error && isActiveRef.current) {
      startPolling();
    }
    
    return () => stopPolling();
  }, [loading, error, startPolling, stopPolling]);

  // Update filtered orders when activeTab or orders change
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeTab));
    }
  }, [activeTab, orders]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

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
          onClick={() => fetchOrders()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold text-primary">Manage Orders</h1>
        
        {/* Status and Manual Refresh */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {lastUpdated && (
              <span>
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isPolling && (
                  <span className="ml-2 inline-flex items-center">
                    <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="ml-1 text-green-600">Live</span>
                  </span>
                )}
              </span>
            )}
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-3 w-3 border border-gray-500 border-t-transparent rounded-full mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-3 w-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      
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
                    <p className="mt-1 font-body text-sm text-primary/70">
                      Phone: {order.userId?.phone || 'N/A'}
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