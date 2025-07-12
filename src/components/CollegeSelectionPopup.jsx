import React, { useState } from 'react';
import { useCollege } from '../context/CollegeContext';

const CollegeSelectionPopup = () => {
  const { colleges, changeCollege, showPopup, setShowPopup } = useCollege();
  const [selectedId, setSelectedId] = useState('');

  const handleSubmit = async () => {
    if (!selectedId) return;
    
    try {
      await changeCollege(selectedId);
      setSelectedId(''); // reset selectedID
      setShowPopup(false); 
    } catch (error) {
      console.error('Failed to change college:', error);
      // Handle error if needed
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Your College</h2>
        </div>
        
        <p className="text-gray-600 mb-6">Choose your college to see the menu and place orders.</p>
        
        <div>
          <div className="space-y-3 mb-6">
            {colleges.map((college) => (
              <div key={college._id} 
                   className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                     selectedId === college._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                   }`}
                   onClick={() => setSelectedId(college._id)}>
                <input
                  type="radio"
                  name="college"
                  value={college._id}
                  checked={selectedId === college._id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mr-3 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{college.name}</div>
                  <div className="text-sm text-gray-500">{college.address}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedId}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeSelectionPopup;