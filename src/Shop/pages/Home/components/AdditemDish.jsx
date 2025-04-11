import React, { useRef, useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom/dist";

const AddItemModal = ({ isOpen, onClose, onAddItem, editDish }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discounted_price: "",
    image_url: "",
    images: "",
  });

  useEffect(() => {
    if (editDish) {
      setFormData({
        name: editDish.name || "",
        description: editDish.description || "",
        price: editDish.price?.toString() || "",
        discounted_price: editDish.discounted_price?.toString() || "",
        image_url: editDish.image_url || "",
        images: editDish.images || "",
      });
      const previewUrls = editDish.image_url ? [editDish.image_url] : [];
      setPreviewUrls(previewUrls);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        discounted_price: "",
        image_url: "",
        images: "",
      });
      setPreviewUrls([]);
    }
  }, [editDish]);

  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleClose = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setFormData((prev) => ({ ...prev, images: [] }));
    onClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discounted_price: Number(formData.discounted_price),
      image_url: formData.image_url,
      shop_id: "",
    };
    try {
      let token = null;
      let id = localStorage.getItem("roleid");
      const categories = ["restaurant", "shop", "activities"];
      requestBody.shop_id = id;
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
      const response = editDish
        ? await axios.put(
            `${process.env.REACT_APP_BASE_URL}/product/${editDish._id}`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : await axios.post(
            `${process.env.REACT_APP_BASE_URL}/product`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

      onAddItem(response.data);
      handleClose();
      toast.success(
        editDish ? "Product updated successfully" : "Product added successfully"
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while processing your request");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="relative w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editDish ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discounted Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discounted_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discounted_price: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                enter Image URL
              </label>
              <div className="mt-1 flex flex-col justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-4">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image_url: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                {editDish ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
