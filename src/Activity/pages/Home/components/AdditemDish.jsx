import React, { useRef, useState, useEffect } from "react";
import { X, Upload, Plus, Minus } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddItemModal = ({ isOpen, onClose, onAddItem, editDish }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    available: true,
    image_url: [],
    duration: "",
    agerequirement: "",
    dresscode: "",
    accessibility: "",
    difficulty: "",
    timeSlot: [],
    whatsincluded: [""],
  });

  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Initialize form data when editDish changes
  useEffect(() => {
    if (editDish) {
      console.log(editDish);
      setFormData({
        name: editDish.name,
        description: editDish.description,
        price: editDish.price,
        discount: editDish.discount_percentage,
        available: true,
        image_url: editDish.image_url || [],
        duration: editDish.additional_info?.duration || "",
        agerequirement: editDish.additional_info?.agerequirement || "",
        dresscode: editDish.additional_info?.dresscode || "",
        accessibility: editDish.additional_info?.accessibility || "",
        difficulty: editDish.additional_info?.difficulty || "",
        timeSlot: editDish.slots || [],
        whatsincluded: editDish.whatsincluded?.length
          ? editDish.whatsincluded
          : [""],
      });
      setPreviewUrls(editDish.image_url || []);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        discount: "",
        available: true,
        image_url: [],
        duration: "",
        agerequirement: "",
        dresscode: "",
        accessibility: "",
        difficulty: "",
        timeSlot: [],
        whatsincluded: [""],
      });
      setPreviewUrls([]);
    }
  }, [editDish]);

  // Cleanup object URLs when the component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle image file selection
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/upload/single`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(uploadFile);

    try {
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url) => url !== null);

      setFormData((prev) => ({
        ...prev,
        image_url: [...prev.image_url, ...validUrls],
      }));

      toast.success(`${validUrls.length} images uploaded successfully`);
    } catch (error) {
      console.error("Error handling image uploads:", error);
      toast.error("Error uploading images");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      image_url: prev.image_url.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Close the modal and reset form data
  const handleClose = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setFormData((prev) => ({
      ...prev,
      image_url: [],
      name: "",
      description: "",
      price: "",
      discount: "",
      duration: "",
      agerequirement: "",
      dresscode: "",
      accessibility: "",
      difficulty: "",
      timeSlot: [],
      whatsincluded: [""],
    }));
    onClose();
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeSlot") {
      // Split the input by commas and trim each value
      const timeSlots = value.split(",").map((slot) => slot.trim());
      setFormData((prev) => ({
        ...prev,
        [name]: timeSlots, // Save as an array of strings
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle changes in "What's Included" items
  const handleIncludedItemChange = (index, value) => {
    const newIncludedItems = [...formData.whatsincluded];
    newIncludedItems[index] = value;
    setFormData((prev) => ({
      ...prev,
      whatsincluded: newIncludedItems,
    }));
  };

  // Add a new "What's Included" item
  const addIncludedItem = () => {
    setFormData((prev) => ({
      ...prev,
      whatsincluded: [...prev.whatsincluded, ""],
    }));
  };

  // Remove a "What's Included" item
  const removeIncludedItem = (index) => {
    if (formData.whatsincluded.length > 1) {
      const newIncludedItems = formData.whatsincluded.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        whatsincluded: newIncludedItems,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const roleid = localStorage.getItem("roleid");

    let token = null;
    const categories = ["restaurant", "shop", "activities"];
    for (const category of categories) {
      const storedToken = localStorage.getItem(`token_partner_${category}`);
      if (storedToken) {
        token = storedToken;
        break;
      }
    }
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const requestBody = {
        name: formData.name,
        description: formData.description,
        whatsincluded: formData.whatsincluded,
        additional_info: {
          duration: formData.duration || "",
          agerequirement: formData.agerequirement || "",
          dresscode: formData.dresscode || "",
          accessibility: formData.accessibility || "",
          difficulty: formData.difficulty || "",
        },
        price: Number(formData.price),
        slots: formData.timeSlot, // Already an array of strings
        discount_percentage: Number(formData.discount),
        activity_id: roleid,
        image_url: formData.image_url,
      };

      const response = editDish
        ? await axios.put(
            `${process.env.REACT_APP_BASE_URL}/task/${editDish._id}`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : await axios.post(
            `${process.env.REACT_APP_BASE_URL}/task`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      if (response.status === 200) {
        onAddItem(response.data.data);
        handleClose();
        toast.success(
          editDish
            ? "Activity updated successfully"
            : "Activity added successfully"
        );
      } else {
        toast.error("Error processing request", response.data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing request");
    }
  };

  // Don't render the modal if it's not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {editDish ? "Edit Activity" : "Add New Activity"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* What's Included Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                  What's Included
                </h3>
                <div className="space-y-2">
                  {formData.whatsincluded.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleIncludedItemChange(index, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Enter included item"
                      />
                      <button
                        type="button"
                        onClick={() => removeIncludedItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIncludedItem}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium mt-2 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dresscode
                    </label>
                    <input
                      name="dresscode"
                      type="text"
                      value={formData.dresscode}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Requirements
                    </label>
                    <input
                      name="agerequirement"
                      type="text"
                      value={formData.agerequirement}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accessibility
                    </label>
                    <input
                      name="accessibility"
                      type="text"
                      value={formData.accessibility}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <input
                      name="difficulty"
                      type="text"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      name="duration"
                      type="text"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                  Pricing & Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <input
                      name="timeSlot"
                      type="text"
                      value={formData.timeSlot.join(", ")} // Convert array to comma-separated string
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Add Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border rounded-md px-3 py-2 w-full"
                />
                {formData.image_url.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.image_url.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {editDish ? "Update Activity" : "Add Activity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
