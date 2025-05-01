// src/pages/Menu.jsx
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthenticationContext';
import { useCart } from '../context/CartContext';
import { getMenu, createOrder, getCategories } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const baseURL = process.env.REACT_APP_API_URL;

function QuantityCounter({ item, quantity, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center justify-center">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={quantity === 1 ? onRemove : onDecrease}
        className="w-8 h-8 flex items-center justify-center bg-accent text-primary rounded-full hover:bg-accent-dark transition-colors focus:outline-none"
        aria-label="Decrease quantity"
      >
        <span className="text-xl font-bold">−</span>
      </motion.button>
      <motion.span 
        key={quantity}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="mx-3 text-secondary font-medium"
      >
        {quantity}
      </motion.span>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        className="w-8 h-8 flex items-center justify-center bg-accent text-primary rounded-full hover:bg-accent-dark transition-colors focus:outline-none"
        aria-label="Increase quantity"
      >
        <span className="text-xl font-bold">+</span>
      </motion.button>
    </div>
  );
}

function MenuItem({ item, onOrder, onEdit, isAdmin }) {
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const [cardColor] = useState(() => {
    // Randomly pick between food card colors for variety
    const colors = ['food-card-red', 'food-card-orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  });
  
  // Get the item from cart if it exists
  const cartItem = cartItems.find(i => i._id === item._id);
  const itemQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  const handleIncrease = () => {
    addToCart(item, 1);
  };

  const handleDecrease = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(item._id, cartItem.quantity - 1);
    } else {
      removeFromCart(item._id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item._id);
    toast.success(`${item.name} removed from cart`);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-food-card-red rounded-lg shadow-elegant hover:shadow-luxury transition-shadow duration-300 overflow-hidden relative"
    >
      {/* Cart item indicator */}
      <AnimatePresence>
        {itemQuantity > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 right-2 bg-accent text-primary font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm"
          >
            {itemQuantity}
          </motion.div>
        )}
      </AnimatePresence>
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
          <div className="p-4 pt-0">
            <AnimatePresence mode="wait">
              {itemQuantity > 0 ? (
                <motion.div 
                  key="counter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <QuantityCounter 
                    item={item} 
                    quantity={itemQuantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors"
                  >
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOrder(item)}
                    className="flex-1 py-3 border border-accent text-accent font-body font-medium rounded-md hover:bg-accent/10 transition-colors"
                  >
                    Order Now
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Floating checkout button component
function FloatingCheckoutButton({ cartItems, totalAmount, onClick }) {
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 py-3 px-6 bg-accent text-primary rounded-full shadow-lg hover:bg-accent-dark"
        >
          <span className="font-bold">Checkout Now</span>
          <span className="bg-primary text-accent rounded-full px-2 py-1 text-sm font-bold">₹{totalAmount}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Header cart total component
function CartTotalIndicator({ totalAmount, itemCount }) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="ml-2 flex items-center bg-accent/10 rounded-full px-3 py-1"
        >
          <span className="text-sm font-medium text-accent mr-1">₹{totalAmount}</span>
          <span className="bg-accent text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            {itemCount}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
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
  const { cartItems } = useCart();
  const categoryBarRef = useRef(null);
  
  // Calculate total cart amount
  const totalCartAmount = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  ).toFixed(2);
  
  const totalItemCount = cartItems.reduce(
    (total, item) => total + item.quantity, 
    0
  );

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, activeCategory, searchQuery]);
  
  // Setup sticky scroll observer
  useEffect(() => {
    if (!categoryBarRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target) {
          if (!entry.isIntersecting) {
            entry.target.classList.add('sticky-category-bar');
          } else {
            entry.target.classList.remove('sticky-category-bar');
          }
        }
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    
    observer.observe(categoryBarRef.current);
    return () => {
      if (categoryBarRef.current) {
        observer.unobserve(categoryBarRef.current);
      }
    };
  }, [categoryBarRef]);

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
  
  const handleCheckout = () => {
    navigate('/checkout');
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
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-display font-bold text-accent sm:text-4xl">
              Our Menu
            </h1>
            <CartTotalIndicator totalAmount={totalCartAmount} itemCount={totalItemCount} />
          </div>
        </div>

        {/* Search and Filter UI */}
        <div className="mt-8" ref={categoryBarRef}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-primary py-2">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                className="bg-white border border-primary-light/30 text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full pl-10 p-2.5"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="w-full md:max-w-3xl overflow-x-auto pb-2">
              <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                    activeCategory === null
                      ? 'bg-accent text-primary'
                      : 'bg-secondary/80 text-primary hover:bg-secondary'
                  }`}
                >
                  All Items
                </motion.button>
                
                {categories.map((category) => (
                  <motion.button
                    key={category || 'uncategorized'}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                      activeCategory === category
                        ? 'bg-accent text-primary'
                        : 'bg-secondary/80 text-primary hover:bg-secondary'
                    }`}
                  >
                    {category === '' ? 'Uncategorized' : category}
                  </motion.button>
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
            <motion.div 
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredItems.map(item => (
                  <MenuItem 
                    key={item._id} 
                    item={item} 
                    onOrder={handleOrder}
                    isAdmin={user?.role === 'admin'}
                    onEdit={item => navigate(`/admin/menu-items/edit/${item._id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        
        {/* Floating Checkout Button */}
        <FloatingCheckoutButton 
          cartItems={cartItems} 
          totalAmount={totalCartAmount}
          onClick={handleCheckout}
        />
      </div>
    </div>
  );
}