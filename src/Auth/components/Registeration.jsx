import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Upload, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
const PartnerRegistration = () => {
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    category: "restaurant",
    address: "",
    city: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    openingTime: "",
    closingTime: "",
    image_url: [],
    logo_url: "",
    location_id: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/location/dropdown/list`)
      .then((response) => response.json())
      .then((data) => {
        console.log("data for the dropdown locations : ", data);
        setLocations(data.data);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations");
      });
  }, []);

  useEffect(() => {
    const filtered = locations.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const uploadImage = async (file) => {
    if (!file) {
      console.error("No file provided");
      toast.error("No file selected");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://fourtrip-server.onrender.com/api/upload/single",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.fileUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleImageUpload = async (files) => {
    const uploadPromises = Array.from(files).map((file) => uploadImage(file));
    try {
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        image_url: [...prev.image_url, ...urls.filter((url) => url !== null)],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload some images");
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) {
      console.error("File is undefined");
      toast.error("Please select a file before uploading.");
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      setFormData((prev) => ({
        ...prev,
        logo_url: url,
      }));
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (
        !formData.businessName ||
        !formData.ownerName ||
        !formData.email ||
        !formData.phone ||
        !formData.category ||
        !formData.address ||
        !formData.city ||
        !formData.pincode ||
        !formData.location_id
      ) {
        toast.error("Please fill all the fields");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const submitData = {
      name: formData.ownerName,
      email: formData.email,
      phone_number: formData.phone,
      password: formData.password,
      business_name: formData.businessName,
      owner_name: formData.ownerName,
      image_url: formData.image_url,
      logo_url: formData.logo_url,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      businessHours: {
        days: selectedDays,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
      },
      location_id: formData.location_id,
      isNew: true,
    };

    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/${formData.category}`,
        submitData
      )

      .then((response) => {
        if (response.status === 201) {
          toast.success("Registration successful");
          navigate("/login");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      location_id: location._id,
    }));
    setIsLocationDropdownOpen(false);
  };

  const renderLocationDropdown = () => (
    <div className="relative location-dropdown">
      <label className="block text-sm mb-1">Location</label>
      <div
        className="w-full px-4 py-2 rounded bg-orange-50 cursor-pointer flex justify-between items-center"
        onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
      >
        <span
          className={`${
            !formData.location_id ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {formData.location_id
            ? locations.find((l) => l._id === formData.location_id)?.name
            : "Select a location"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isLocationDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isLocationDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-4 py-2 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No locations found
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocationSelect(location);
                  }}
                >
                  <span>{location.name}</span>
                  {location.type && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {location.type}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStepOne = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Business Name</label>
        <input
          type="text"
          name="businessName"
          placeholder="Enter your business name"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.businessName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Owner Name</label>
        <input
          type="text"
          name="ownerName"
          placeholder="Enter owner name"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.ownerName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email address"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Phone Number</label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Category</label>
        <select
          name="category"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.category}
          onChange={handleInputChange}
        >
          <option value="restaurant">Restaurant</option>
          <option value="shop">Shop</option>
          <option value="activities">Activities</option>
        </select>
      </div>
      {renderLocationDropdown()}
      <div>
        <label className="block text-sm mb-1">Address</label>
        <input
          type="text"
          name="address"
          placeholder="Enter your address"
          className="w-full px-4 py-2 rounded bg-orange-50"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">City</label>
          <input
            type="text"
            name="city"
            placeholder="Enter city"
            className="w-full px-4 py-2 rounded bg-orange-50"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Pin Code</label>
          <input
            type="text"
            name="pincode"
            placeholder="Enter pin code"
            className="w-full px-4 py-2 rounded bg-orange-50"
            value={formData.pincode}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Upload Business Logo</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <input
            type="file"
            className="hidden"
            id="logoUpload"
            onChange={(e) => handleLogoUpload(e.target.files[0])}
            accept="image/*"
          />
          <label
            htmlFor="logoUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Upload Business Logo</span>
          </label>
        </div>
        {formData.logo_url && (
          <div className="mb-4">
            <img
              src={formData.logo_url}
              alt="Business Logo"
              className="w-24 h-24 object-cover rounded"
            />
          </div>
        )}

        <h3 className="text-lg font-medium mb-4">Upload Restaurant Images</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="imageUpload"
            onChange={(e) => handleImageUpload(e.target.files)}
            accept="image/*"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload images
            </span>
            <span className="text-xs text-gray-400 mt-1">
              You can select multiple images
            </span>
          </label>
        </div>

        {/* Preview uploaded images */}
        {formData.image_url.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">
              Uploaded Images ({formData.image_url.length})
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {formData.image_url.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        image_url: prev.image_url.filter((_, i) => i !== index),
                      }));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Business Hours</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <button
              key={day}
              className={`p-2 rounded ${
                selectedDays.includes(day)
                  ? "bg-emerald-400 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => handleDayToggle(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Opening Time</label>
            <input
              type="time"
              name="openingTime"
              className="w-full px-4 py-2 rounded bg-orange-50"
              value={formData.openingTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Closing Time</label>
            <input
              type="time"
              name="closingTime"
              className="w-full px-4 py-2 rounded bg-orange-50"
              value={formData.closingTime}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Create Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="w-full px-4 py-2 rounded bg-orange-50 pr-10"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            className="w-full px-4 py-2 rounded bg-orange-50 pr-10"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".location-dropdown");
      if (
        isLocationDropdownOpen &&
        dropdown &&
        !dropdown.contains(event.target)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLocationDropdownOpen]);

  return (
    <div className="min-h-fit bg-white p-6 rounded-xl">
      <ProgressBar currentStep={currentStep} />
      <div className="max-w-md mx-auto mt-6">
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}

        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 text-gray-700 rounded py-2 hover:bg-gray-300"
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            className="w-full bg-emerald-400 text-white rounded py-2 hover:bg-emerald-500"
          >
            {currentStep === 3 ? "Join as a Partner" : "Continue"}
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          Have an account already?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PartnerRegistration;
