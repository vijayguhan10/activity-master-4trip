import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  Bell,
  Box,
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  Settings,
  ShoppingBag,
  LogOut,
  User,
  X,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const ShopDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [userData, setUserData] = useState({
    business_name: '',
    owner_name: '',
    phone_number: '',
    email: '',
    address: '',
    single_line_address: '',
    city: '',
    pincode: '',
    businessHours: {
      openingTime: '',
      closingTime: '',
      days: []
    },
    customer_rating: 0,
    discount: '',
    image_url: [],
    logo_url: '',
    map_url: '',
    description: ''
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formDataRef = useRef({});
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const path = location.pathname.split('/shop/')[1] || '';
    setActiveTab(path || 'home');
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token_partner_shop');
      const id = localStorage.getItem('id_partner_shop');

      if (!token || !id) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/auth/profile/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        localStorage.setItem('roleid', response.data.role_id);
        console.log('Fetched Shop Data:', response.data);
        setUserData(response.data);
        formDataRef.current = response.data;
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token_partner_shop');
    localStorage.removeItem('id_partner_shop');
    localStorage.removeItem('roleid');
    navigate('/login');
  };

  const handleProfileEdit = () => {
    setShowProfileMenu(false);
    setShowSettingsModal(true);
  };

  const uploadImage = async (file) => {
    if (!file) {
      console.error('No file provided');
      toast.error('No file selected');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'https://fourtrip-server.onrender.com/api/upload/single',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      return response.data.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleImageUpload = async (files) => {
    const uploadPromises = Array.from(files).map((file) => uploadImage(file));
    try {
      const urls = await Promise.all(uploadPromises);
      const newImageUrls = [
        ...formDataRef.current.image_url,
        ...urls.filter((url) => url !== null)
      ];

      formDataRef.current = {
        ...formDataRef.current,
        image_url: newImageUrls
      };
      setUserData((prev) => ({
        ...prev,
        image_url: newImageUrls
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) {
      console.error('File is undefined');
      toast.error('Please select a file before uploading.');
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      formDataRef.current = {
        ...formDataRef.current,
        logo_url: url
      };
      setUserData((prev) => ({
        ...prev,
        logo_url: url
      }));
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formDataRef.current.image_url];
    updatedImages.splice(index, 1);

    formDataRef.current = {
      ...formDataRef.current,
      image_url: updatedImages
    };
    setUserData((prev) => ({
      ...prev,
      image_url: updatedImages
    }));
  };

  const ProfileSettingsModal = React.memo(() => {
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const currentPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;

      if (name.startsWith('businessHours.')) {
        const field = name.split('.')[1];
        formDataRef.current = {
          ...formDataRef.current,
          businessHours: {
            ...formDataRef.current.businessHours,
            [field]: value
          }
        };
      } else {
        formDataRef.current = {
          ...formDataRef.current,
          [name]: type === 'checkbox' ? checked : value
        };

        // Sync owner_name with name
        if (name === 'owner_name') {
          formDataRef.current = {
            ...formDataRef.current,
            name: value
          };
        }
      }
    };

    const handleDaysChange = (event) => {
      const { value, checked } = event.target;
      formDataRef.current = {
        ...formDataRef.current,
        businessHours: {
          ...formDataRef.current.businessHours,
          days: checked
            ? [...formDataRef.current.businessHours.days, value]
            : formDataRef.current.businessHours.days.filter(
                (day) => day !== value
              )
        }
      };
    };

    const togglePasswordFields = useCallback(() => {
      // Save scroll position before toggling
      const scrollPosition = modalContentRef.current?.scrollTop;

      setShowPasswordFields((prev) => !prev);

      // Restore scroll position after state update
      if (modalContentRef.current && scrollPosition) {
        setTimeout(() => {
          modalContentRef.current.scrollTop = scrollPosition;
        }, 0);
      }
    }, []);

    const handleSaveChanges = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token_partner_shop');
      const id = localStorage.getItem('id_partner_shop');

      // Prepare the update data
      const updateData = { ...formDataRef.current };

      // Only include password fields if they're filled and showPasswordFields is true
      if (showPasswordFields) {
        if (
          currentPasswordRef.current?.value &&
          newPasswordRef.current?.value
        ) {
          updateData.currentPassword = currentPasswordRef.current.value;
          updateData.newPassword = newPasswordRef.current.value;
        }
      }

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BASE_URL}/auth/${id}/`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success('Shop details updated successfully!');
          setShowSettingsModal(false);
          setUserData(formDataRef.current);
          setShowPasswordFields(false);

          // Safely reset password fields only if refs exist
          if (currentPasswordRef.current) {
            currentPasswordRef.current.value = '';
          }
          if (newPasswordRef.current) {
            newPasswordRef.current.value = '';
          }
        }
      } catch (error) {
        console.error('Error updating shop details:', error);
        toast.error(
          error.response?.data?.error || 'Failed to update shop details.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10 rounded-tl-lg rounded-tr-lg">
            <h2 className="text-xl font-semibold">Shop Settings</h2>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-6" ref={modalContentRef}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                {/* Logo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {formDataRef.current.logo_url ? (
                      <div className="relative">
                        <img
                          src={formDataRef.current.logo_url}
                          alt="Shop Logo"
                          className="w-24 h-24 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            formDataRef.current = {
                              ...formDataRef.current,
                              logo_url: ''
                            };
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {formDataRef.current.logo_url
                          ? 'Change Logo'
                          : 'Upload Logo'}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shop Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Images
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formDataRef.current.image_url?.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Shop ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Images</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleImageUpload(e.target.files)}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload high-quality images of your shop (max 10 images)
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      defaultValue={userData.business_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      defaultValue={userData.owner_name || userData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      defaultValue={userData.phone_number}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={userData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </div>
                  </label>
                  <textarea
                    name="address"
                    defaultValue={userData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Line Address
                  </label>
                  <input
                    type="text"
                    name="single_line_address"
                    defaultValue={userData.single_line_address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={userData.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      defaultValue={userData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        name="businessHours.openingTime"
                        defaultValue={userData.businessHours.openingTime}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        name="businessHours.closingTime"
                        defaultValue={userData.businessHours.closingTime}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Days
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {daysOfWeek.map((day, index) => (
                      <div key={index}>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="days"
                            value={day}
                            defaultChecked={userData.businessHours.days.includes(
                              day
                            )}
                            onChange={handleDaysChange}
                            className="mr-2"
                          />
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    defaultValue={userData.discount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map URL
                  </label>
                  <input
                    type="text"
                    name="map_url"
                    defaultValue={userData.map_url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={userData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Password Change Section */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={togglePasswordFields}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
                  >
                    {showPasswordFields
                      ? 'Hide Password Change'
                      : 'Change Password'}
                  </button>

                  {showPasswordFields && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          ref={currentPasswordRef}
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          ref={newPasswordRef}
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="flex justify-end gap-4 p-4 border-t sticky bottom-0 bg-white rounded-bl-lg rounded-br-lg">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className={`px-3 py-1 text-white rounded-md flex items-center ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <React.Fragment>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </React.Fragment>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  });

  const NavLink = React.memo(({ icon: Icon, label, value, path }) => (
    <button
      onClick={() => navigate(`/shop/${path}`)}
      className={`flex items-center w-full min-w-fit p-3 px-6 text-nowrap ${
        activeTab === value
          ? 'border-r-2 bg-blue-50 border-blue-700 text-black'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon
        className={`w-5 h-5 mr-3 ${
          activeTab === value ? 'text-blue-700' : 'text-gray-700'
        } `}
      />
      <span>{label}</span>
    </button>
  ));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="py-3 px-4 bg-[#FF8749]">
        <div className="flex justify-end items-center">
          <div className="flex items-center space-x-4 relative">
            <div
              className="flex items-center space-x-2 px-3 py-2 text-md bg-white rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User className="w-4 h-4" />
              <span>{userData ? userData.business_name : 'Loading...'}</span>
            </div>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-md shadow-lg py-1 z-50 min-w-[12rem] max-w-md">
                <div className="px-4 py-2 text-sm text-gray-700 border-b break-words">
                  <p className="font-medium">{userData?.owner_name}</p>
                  <p className="text-xs text-gray-500 break-all">
                    {userData?.email}
                  </p>
                </div>
                <button
                  onClick={handleProfileEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 mr-2 bg-white border-r shadow-sm">
          <nav className="space-y-2 p-4">
            <NavLink icon={Home} label="Home" value="home" path="" />
            <NavLink
              icon={ShoppingBag}
              label="Manage Products"
              value="listing"
              path="listing"
            />
            <NavLink
              icon={MessageSquare}
              label="Reviews"
              value="reviews"
              path="reviews"
            />
            <NavLink
              icon={DollarSign}
              label="Payments"
              value="payments"
              path="payments"
            />
          </nav>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <Outlet />
        </div>
      </div>

      {showSettingsModal && <ProfileSettingsModal />}
    </div>
  );
};

export default ShopDashboard;
