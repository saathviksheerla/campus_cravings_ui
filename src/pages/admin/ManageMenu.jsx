import React, { useState, useEffect } from 'react';
import { getMenu } from '../../services/api';

export default function ManageMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await getMenu();
      const data = await response.data;
      setMenuItems(data);
    } catch (err) {
      setError('Failed to fetch menu items');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error('Failed to create item');
      
      await fetchMenuItems();
      setNewItem({ name: '', price: '', description: '', available: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editItem),
      });
      if (!response.ok) throw new Error('Failed to update item');
      
      await fetchMenuItems();
      setEditItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchMenuItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Menu</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add New Item Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
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
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={newItem.available}
              onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
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
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white shadow rounded-lg p-4">
            {editItem?.id === item._id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.name}
                  onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                />
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.price}
                  onChange={(e) => setEditItem({...editItem, price: e.target.value})}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editItem.description}
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editItem.available}
                    onChange={(e) => setEditItem({...editItem, available: e.target.checked})}
                  />
                  <label className="ml-2 text-sm text-gray-700">Available</label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditItem(null)}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    {item.available ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
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