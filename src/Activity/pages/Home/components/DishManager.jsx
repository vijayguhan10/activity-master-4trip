import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddItemModal from './AdditemDish';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskManager = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDish, setEditDish] = useState(null);

  const filters = [
    'Veg',
    'Non-Veg',
    'Bestseller',
    'Spicy',
    'No onion or garlic'
  ];

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/task`
      );
      setDishes(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch activities');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const filteredDishes = dishes.filter((dish) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      dish.title?.toLowerCase().includes(searchTerm) ||
      dish.description?.toLowerCase().includes(searchTerm) ||
      dish.price?.toString().includes(searchTerm)
    );
  });

  const handleAddItem = (newItem) => {
    setDishes([...dishes, newItem]);
  };

  const toggleAvailability = async (id, is_deleted) => {
    try {
      let token = null;
      const categories = ['restaurant', 'shop', 'activities'];
      for (const category of categories) {
        const storedToken = localStorage.getItem(`token_partner_${category}`);
        if (storedToken) {
          token = storedToken;
          break;
        }
      }

      if (!token) {
        navigate('/login');
        return;
      }
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/task/${id}`,
        {
          is_deleted: !is_deleted
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDishes(
        dishes.map((dish) =>
          dish._id === id ? { ...dish, is_deleted: !is_deleted } : dish
        )
      );
      toast.success('Activity availability status updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating activity status');
    }
  };

  const handleEditDish = (id) => {
    const dishToEdit = dishes.find((dish) => dish._id === id);
    console.log(dishToEdit);
    setEditDish(dishToEdit);
    setIsModalOpen(true);
  };

  const handleSaveDish = (updatedDish) => {
    fetchDishes();
    setEditDish(null);
  };

  const handleDeleteDish = async (id) => {
    try {
      let token = null;
      const categories = ['restaurant', 'shop', 'activities'];
      // requestBody.shop_id = id;
      for (const category of categories) {
        const storedToken = localStorage.getItem(`token_partner_${category}`);
        if (storedToken) {
          token = storedToken;
          break;
        }
      }

      if (!token) {
        navigate('/login');
        return;
      }
      await axios.is_deleted(
        `${process.env.REACT_APP_BASE_URL}/task/${id}`,
        {
          is_deleted: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDishes(dishes.filter((dish) => dish._id !== id));
      toast.success('Activity deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting activity');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow w-full px-6 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setEditDish(null);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </button>
          </div>
        </div>

        {/* <div className="flex space-x-2">
          {filters.map((filter) => (
            <span
              key={filter}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {filter}
            </span>
          ))}
        </div> */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white sticky top-0">
            <tr className="border-b">
              <th className="p-4 text-left">Sr no.</th>
              <th className="p-4 text-left">Name of the Activity</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Discount</th>
              <th className="p-4 text-left">Availability status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDishes.map((dish, index) => (
              <tr key={dish._id} className="border-b">
                <td className="p-4">{index + 1}</td>
                <td className="p-4">{dish.name}</td>
                <td className="p-4">{dish.price}</td>
                <td className="p-4">{dish.discount_percentage}%</td>
                <td className="p-4">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                        !dish.is_deleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      onClick={() =>
                        toggleAvailability(dish._id, dish.is_deleted)
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          !dish.is_deleted ? 'translate-x-6' : ''
                        }`}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleDeleteDish(dish._id);
                        console.log(dish._id);
                      }}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditDish(dish._id)}
                      className="p-1 text-blue-500 hover:text-blue-600"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDishes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No activities found matching your search.
          </div>
        )}
      </div>

      {/* <div className="p-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">01 page of 21</span>
        <div className="flex items-center space-x-2">
          <button className="p-1"><ChevronLeft className="w-5 h-5" /></button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded">01</button>
          <button className="px-3 py-1">02</button>
          <button className="px-3 py-1">03</button>
          <button className="px-3 py-1">...</button>
          <button className="px-3 py-1">21</button>
          <button className="p-1"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div> */}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditDish(null);
        }}
        onAddItem={editDish ? handleSaveDish : handleAddItem}
        editDish={editDish}
      />
    </div>
  );
};

export default TaskManager;
