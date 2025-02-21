// src/pages/Menu.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthenticationContext';
import { getMenu, createOrder } from '../services/api';

function MenuItem({ item, onOrder }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <img
          src={item.imageUrl}
          className="m-auto w-66 h-66 object-cover rounded-lg shadow-sm"
          alt={item.name}
        />
        <div className="mt-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <h3 className="px-2 py-1 text-green-800 text-sm font-medium bg-green-100 rounded-full">
            ₹{item.price}
          </h3>
        </div>
        <p className="mt-1 text-gray-600">{item.description}</p>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Preparation time: {item.preparationTime} mins
          </p>
        </div>
        <button
          onClick={() => onOrder(item)}
          className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}

function MenuSection({ title, items, onOrder }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <MenuItem key={item._id} item={item} onOrder={onOrder} />
        ))}
      </div>
    </div>
  );
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      console.log('Fetching menu...');
      const response = await getMenu();
      console.log('Menu response:', response);
      setMenuItems(response.data);
      setError(null);
    } catch (error) {
      console.error('Menu fetch error:', error);
      setError(error.response?.data?.error || 'Failed to load menu');
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (item) => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      await createOrder({
        items: [{
          menuItemId: item._id,
          quantity: 1
        }]
      });
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error Loading Menu</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchMenu}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">No Menu Items Available</h2>
        <p className="mt-2 text-gray-600">Please check back later.</p>
      </div>
    );
  }

  const categorizedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Our Menu
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Fresh, delicious meals prepared daily
        </p>
      </div>

      {Object.entries(categorizedItems).map(([category, items]) => (
        <MenuSection
          key={category}
          title={category}
          items={items}
          onOrder={handleOrder}
        />
      ))}
    </div>
  );
}