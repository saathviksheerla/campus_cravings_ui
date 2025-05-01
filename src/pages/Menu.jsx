// src/pages/Menu.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthenticationContext';
import { useCart } from '../context/CartContext';
import { getMenu, createOrder, getCategories } from '../services/api';
import { useNavigate } from 'react-router-dom';

const baseURL = process.env.REACT_APP_API_URL;

function MenuItem({ item, onOrder, onEdit, isAdmin }) {
  const { addToCart } = useCart();
  const [cardColor] = useState(() => {
    // Randomly pick between food card colors for variety
    const colors = ['food-card-red', 'food-card-orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  const handleAddToCart = () => {
    addToCart(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="bg-food-card-red rounded-lg shadow-elegant hover:shadow-luxury transition-shadow duration-300 overflow-hidden">
      <div>
        <img
          src={item.imageUrl}
          className="w-full h-48 object-cover"
          alt={item.name}
        />
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-secondary font-bold">{item.name}</h3>
            <span className="bg-accent text-primary font-bold rounded-full px-3 py-1 text-sm">
              ₹{item.price}
            </span>
          </div>
          <p className="mt-2 text-secondary/90 font-body">{item.description}</p>
          <div className="mt-2">
            <p className="text-sm text-secondary/70">
              Preparation time: {item.preparationTime} mins
            </p>
          </div>
        </div>
        {isAdmin ? (
          <button
            onClick={() => onEdit(item)}
            className="w-full bg-primary-light text-secondary px-4 py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Edit Item
          </button>
        ) : (
          <div className="p-4 pt-0 flex gap-2">
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

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, activeCategory, searchQuery]);

  const fetchMenuAndCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items
      const menuResponse = await getMenu();
      setMenuItems(menuResponse.data);
      
      // Fetch categories
      try {
        const categoriesResponse = await getCategories();
        setCategories([...categoriesResponse.data]);
      } catch (error) {
        console.error('Categories fetch error:', error);
        // Fallback to extracting categories from menu items
        const uniqueCategories = [...new Set(menuResponse.data.map(item => item.category || ''))];
        setCategories([ ...uniqueCategories.filter(cat => cat !== '')]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Menu fetch error:', error);
      setError(error.response?.data?.error || 'Failed to load menu');
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let items = [...menuItems];
    
    // Filter by category
    if (activeCategory) {
      items = items.filter(item => 
        activeCategory === 'Uncategorized' 
          ? !item.category || item.category === ''
          : item.category === activeCategory
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(items);
  };

  const handleCategoryClick = (category) => {
    // If the current active category is clicked again, clear the filter
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const handleOrder = async (item) => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
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
      <div className="flex justify-center items-center h-64 bg-primary text-accent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-primary text-secondary">
        <h2 className="text-2xl font-semibold">Error Loading Menu</h2>
        <p className="mt-2 text-secondary/70">{error}</p>
        <button
          onClick={fetchMenuAndCategories}
          className="mt-4 px-4 py-2 bg-accent text-primary rounded-md hover:bg-accent-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 bg-primary text-secondary">
        <h2 className="text-2xl font-semibold">No Menu Items Available</h2>
        <p className="mt-2 text-secondary/70">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-accent sm:text-4xl">
            Our Menu
          </h1>
        </div>

        {/* Search and Filter UI */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                className="bg-secondary border border-primary-light/30 text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full pl-10 p-2.5"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="w-full md:max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                    activeCategory === null
                      ? 'bg-accent text-primary'
                      : 'bg-secondary/80 text-primary hover:bg-secondary'
                  }`}
                >
                  All Items
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category || 'uncategorized'}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                      activeCategory === category
                        ? 'bg-accent text-primary'
                        : 'bg-secondary/80 text-primary hover:bg-secondary'
                    }`}
                  >
                    {category === '' ? 'Uncategorized' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {activeCategory && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-secondary/80">
              Filtered by: <span className="font-medium text-accent">{activeCategory}</span>
            </span>
            <button 
              onClick={() => setActiveCategory(null)}
              className="ml-2 text-xs bg-secondary/20 text-secondary/80 rounded-full px-2 py-1 flex items-center hover:bg-secondary/30"
            >
              Clear
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="mt-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <h2 className="text-xl font-semibold">No items found</h2>
              <p className="mt-2 text-secondary/70">Try changing your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <MenuItem 
                  key={item._id} 
                  item={item} 
                  onOrder={handleOrder}
                  isAdmin={user?.role === 'admin'}
                  onEdit={item => navigate(`/admin/menu-items/edit/${item._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}