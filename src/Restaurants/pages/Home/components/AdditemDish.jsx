import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom/dist";
const AddItemModal = ({ isOpen, onClose, onAddItem, editDish }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discounted_price: "",
    image_url: "",
    is_active: true,
    restaurant_id: "",
    filter: [],
  });

  useEffect(() => {
    if (editDish) {
      setFormData({
        name: editDish.name,
        description: editDish.description,
        category: editDish.category,
        price: editDish.price,
        discounted_price: editDish.discounted_price,
        image_url: editDish.image_url || "",
        is_active: editDish.is_active,
        restaurant_id: editDish.restaurant_id,
        filter: editDish.filter || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        discounted_price: "",
        image_url: "",
        is_active: true,
        restaurant_id: "",
        filter: [],
      });
    }
  }, [editDish]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        image_url: prev.image_url
          ? `${prev.image_url},${validUrls.join(",")}`
          : validUrls.join(","),
      }));

      toast.success(`${validUrls.length} images uploaded successfully`);
    } catch (error) {
      console.error("Error handling image uploads:", error);
      toast.error("Error uploading images");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const urlsArray = prev.image_url ? prev.image_url.split(",") : [];
      urlsArray.splice(indexToRemove, 1);
      return { ...prev, image_url: urlsArray.join(",") };
    });
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      filter: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = null;
    let id = null;
    const categories = ["restaurant", "shop", "activities"];

    for (const category of categories) {
      const storedToken = localStorage.getItem(`token_partner_${category}`);
      const storedId = localStorage.getItem(`roleid`);
      if (storedToken && storedId) {
        token = storedToken;
        id = storedId;
        break;
      }
    }

    if (!token || !id) {
      navigate("/login");
      return;
    }
    try {
      const requestBody = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        discounted_price: Number(formData.discounted_price),
        image_url: formData.image_url,
        is_active: formData.is_active,
        restaurant_id: id,
        filter: formData.filter,
      };

      const response = editDish
        ? await axios.put(
            `${process.env.REACT_APP_BASE_URL}/dish/${editDish._id}`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : await axios.post(
            `${process.env.REACT_APP_BASE_URL}/dish`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      console.log("sucess of food dishes : ", response);
      if (response.status == 200) {
        onAddItem(response.data);
        onClose();
        console.log("consoling the onclose poppup");
        toast.success(
          editDish ? "Dish updated successfully" : "Dish added successfully"
        );
      } else {
        toast.error(editDish ? "Error updating dish" : "Error adding dish");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing request");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {editDish ? "Edit Dish" : "Add New Dish"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price
                    </label>
                    <input
                      name="discounted_price"
                      type="number"
                      value={formData.discounted_price}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filters (comma-separated)
                  </label>
                  <input
                    name="filter"
                    type="text"
                    value={formData.filter.join(",")}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
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
                {formData.image_url && formData.image_url.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.image_url.split(",").map((url, index) => (
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

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editDish ? "Update Dish" : "Add Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
