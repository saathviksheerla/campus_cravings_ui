// src/pages/admin/ManageMenu.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { getMenu, createMenuItem } from '../../services/api';
import { useAuth } from '../../context/AuthenticationContext';

export default function ManageMenu() {
  const {user} = useAuth();
  let collegeId = null;
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
  const [menuItems, setMenuItems] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    preparationTime: '',
    available: true,
    collegeId: collegeId
  });

  useEffect(() => {
    fetchMenuItems();
    checkPendingOrders();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenu(collegeId);
      setMenuItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch menu items');
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const checkPendingOrders = async () => {
    try {
      const response = await api.post('/orders/admin/all', {collegeId});
      const hasPendingOrders = response.data.some(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      );
      setPendingOrders(hasPendingOrders);

      if (hasPendingOrders) {
        toast.info('Some menu items cannot be edited while there are pending orders');
      }
    } catch (err) {
      console.error('Error checking pending orders:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMenuItem(newItem);
      toast.success('Menu item created successfully');
      await fetchMenuItems();
      setNewItem({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        preparationTime: '',
        available: true,
        collegeId: collegeId
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item');
      toast.error('Failed to create menu item');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/menu/${id}`, editItem);
      toast.success('Menu item updated successfully');
      await fetchMenuItems();
      setEditItem(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update item');
      toast.error('Failed to update menu item');
    }
  };

  const handleDelete = async (id) => {
    // Check if there are pending orders
    if (pendingOrders) {
      toast.error('Cannot delete items while there are pending orders');
      return;
    }

    try {
      await api.delete(`/menu/${id}`);
      toast.success('Menu item deleted successfully');
      await fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
      toast.error('Failed to delete menu item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Menu</h2>

      {pendingOrders && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Warning: Some operations may be restricted while there are pending orders
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add New Item Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Add New Menu Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Link
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.imageUrl}
              onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              <option value="Sandwiches">Sandwiches</option>
              <option value="Burgers">Burgers</option>
              <option value="Sides">Sides</option>
              <option value="Beverages">Beverages</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preparation Time (minutes)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.preparationTime}
              onChange={(e) => setNewItem({ ...newItem, preparationTime: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={newItem.available}
              onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
            />
            <label className="ml-2 text-sm text-gray-700">Available</label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Menu Item
          </button>
        </form>
      </div>

      {/* Menu Items List */}
      <h3 className="text-lg font-medium mb-4">Current Menu Items</h3>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white shadow rounded-lg p-4">
            {editItem && editItem._id === item._id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.price}
                  onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.imageUrl}
                  onChange={(e) => setEditItem({ ...editItem, imageUrl: e.target.value })}
                />
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                >
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Sides">Sides</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                </select>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Preparation Time (minutes)"
                  value={editItem.preparationTime}
                  onChange={(e) => setEditItem({ ...editItem, preparationTime: e.target.value })}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editItem.available}
                    onChange={(e) => setEditItem({ ...editItem, available: e.target.checked })}
                  />
                  <label className="ml-2 text-sm text-gray-700">Available</label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                    disabled={pendingOrders && item.available !== editItem.available}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditItem(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <img
                    src={item.imageUrl}
                    className="w-full h-24 object-cover rounded-lg"
                    alt={item.name}
                  />
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                  <p className="text-sm text-gray-500">
                    Preparation Time: {item.preparationTime || 'Not specified'} mins
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.available ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                    disabled={pendingOrders}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}