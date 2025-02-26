// src/pages/Menu.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthenticationContext';
import { useCart } from '../context/CartContext';
import { getMenu, createOrder } from '../services/api';

function MenuItem({ item, onOrder, onEdit, isAdmin }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="bg-secondary rounded-lg shadow-elegant hover:shadow-luxury transition-shadow duration-300">
      <div className="p-6">
        <img
          src={item.imageUrl}
          className="w-full h-48 object-cover rounded-lg"
          alt={item.name}
        />
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-primary">{item.name}</h3>
            <span className="px-3 py-1 bg-accent/10 text-primary font-body rounded-full">
              ₹{item.price}
            </span>
          </div>
          <p className="mt-2 text-primary/70 font-body">{item.description}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Preparation time: {item.preparationTime} mins
            </p>
          </div>
        </div>
        {isAdmin ? (
          <button
            onClick={() => onEdit(item)}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Item
          </button>
        ) : (
          <div className="mt-6 flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={() => onOrder(item)}
              className="flex-1 py-3 border border-accent text-accent font-body font-medium rounded-md hover:bg-accent/10 transition-colors"
            >
              Order Now
            </button>
          </div>
        )}
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