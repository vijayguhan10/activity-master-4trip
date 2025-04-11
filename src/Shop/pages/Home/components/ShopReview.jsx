import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, StarHalf, User } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(review.rating);
    const hasHalfStar = review.rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start mb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {review.booking_id.name}
          </h3>
          <p className="text-sm text-gray-500">
            {review.booking_id.phone_number}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        <div className="flex mr-2">{renderStars()}</div>
        <span className="text-sm font-medium text-gray-700">
          {review.rating.toFixed(1)}
        </span>
      </div>

      <h4 className="text-lg font-medium text-gray-800 mb-2">{review.title}</h4>
      <p className="text-gray-600">{review.description}</p>

      <div className="mt-4 text-sm text-gray-400">
        {new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
};

const ShopReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessId, setBusinessId] = useState('');
  const [businessType, setBusinessType] = useState('');

  useEffect(() => {
    const fetchTokenAndBusinessInfo = () => {
      let token = localStorage.getItem('token_partner_shop');
      let businessType = 'Shop';

      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setBusinessId(payload.business_id);
        setBusinessType(businessType);
        return { token, businessType };
      } else {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return null;
      }
    };

    const { token, businessType } = fetchTokenAndBusinessInfo() || {};

    if (token && businessType && businessId) {
      fetchReviews(token, businessType);
    }
  }, [businessId]);

  const fetchReviews = async (token, type) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/review/${type}/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews');
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Customer Reviews
        </h1>
        <div className="flex items-center">
          <div className="text-4xl font-bold mr-4">
            {calculateAverageRating()}
          </div>
          <div>
            <div className="flex mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(calculateAverageRating())
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">
              No reviews yet
            </h3>
            <p className="text-gray-400">
              Customers haven't left any reviews for your business.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopReview;
