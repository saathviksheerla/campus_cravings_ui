import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollege } from '../context/CollegeContext';

const CollegeSelectionPage = () => {
  const { colleges, changeCollege } = useCollege();
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedId) return;
    
    setLoading(true);
    try {
      await changeCollege(selectedId);
      navigate('/menu'); // Redirect to menu after selection
    } catch (error) {
      console.error('Failed to change college:', error);
      // Handle error if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Select Your College
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose your college to continue with your food ordering experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {colleges.map((college) => (
              <div key={college._id} 
                   className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                     selectedId === college._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                   }`}
                   onClick={() => setSelectedId(college._id)}>
                <input
                  type="radio"
                  name="college"
                  value={college._id}
                  checked={selectedId === college._id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mr-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{college.name}</div>
                  <div className="text-sm text-gray-500">{college.address}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!selectedId || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeSelectionPage;