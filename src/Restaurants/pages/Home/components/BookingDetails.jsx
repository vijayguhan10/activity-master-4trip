import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const RestaurantBookingsManager = () => {
  const [bookings, setBookings] = useState({ active: [], inactive: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [canReserve, setCanReserve] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [partnerId, setPartnerId] = useState('');

  // Get token and IDs from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token_partner_restaurant');
    const id = localStorage.getItem('id_partner_restaurant');

    if (token && id) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setBusinessId(payload.business_id);
      setPartnerId(id);
    } else {
      setError('Authentication required. Please login again.');
      setLoading(false);
    }
  }, []);

  // Fetch bookings and restaurant details
  useEffect(() => {
    if (businessId) {
      fetchBookings();
      fetchRestaurantDetails();
    }
  }, [businessId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/reservation/business/${businessId}/Restaurant`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'token_partner_restaurant'
            )}`
          }
        }
      );
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'token_partner_restaurant'
            )}`
          }
        }
      );
      setCanReserve(response.data.canReserve || false);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };

  const updateRegistrationStatus = async () => {
    try {
      const newStatus = !canReserve;
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/auth/${partnerId}/`,
        { canReserve: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'token_partner_restaurant'
            )}`
          }
        }
      );
      setCanReserve(newStatus);
      toast.success(
        `New reservations are now ${newStatus ? 'allowed' : 'blocked'}`
      );
    } catch (error) {
      console.error('Error updating registration status:', error);
      toast.error('Failed to update registration status');
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/reservation/${reservationId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'token_partner_restaurant'
            )}`
          }
        }
      );
      toast.success('Reservation status updated');
      fetchBookings();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
    }
  };

  // Helper function to parse date strings safely
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;

    // Try parsing as ISO string first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Try parsing common date string formats
    const formats = [
      'EEE MMM dd yyyy', // Mon Mar 17 2025
      'MM/dd/yyyy', // 03/17/2025
      'yyyy-MM-dd', // 2025-03-17
      'MMMM d, yyyy' // March 17, 2025
    ];

    for (const format of formats) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    return null;
  };

  // Filter bookings based on search and date
  const filterBookings = (bookingsList) => {
    return bookingsList.filter((booking) => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        booking.booking_id?.email?.toLowerCase().includes(searchTerm) ||
        booking.booking_id?.name?.toLowerCase().includes(searchTerm) ||
        booking.booking_id?.phone_number?.includes(searchTerm);

      // Date filter
      if (selectedDate) {
        const bookingDate = parseDateString(booking.date);
        if (!bookingDate) return matchesSearch;

        const filterDate = new Date(selectedDate);
        return (
          matchesSearch &&
          bookingDate.getFullYear() === filterDate.getFullYear() &&
          bookingDate.getMonth() === filterDate.getMonth() &&
          bookingDate.getDate() === filterDate.getDate()
        );
      }

      return matchesSearch;
    });
  };

  const activeBookings = filterBookings(bookings.active);
  const inactiveBookings = filterBookings(bookings.inactive);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    const date = parseDateString(dateStr);
    if (!date) return dateStr || 'N/A';

    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Confirmed':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Completed':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'Cancelled':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="bg-white mt-2 rounded-lg shadow w-full px-6">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Active Reservations ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'inactive'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Past Reservations ({inactiveBookings.length})
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">
                Accept New Reservations
              </span>
              <button
                onClick={updateRegistrationStatus}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                  canReserve ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                    canReserve ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white sticky top-0">
            <tr className="border-b">
              <th className="p-4 text-left">Booking ID</th>
              <th className="p-4 text-left">Customer Details</th>
              <th className="p-4 text-left">Date & Time</th>
              <th className="p-4 text-left">Members</th>
              <th className="p-4 text-left">Advance</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'active' ? (
              activeBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No active reservations found
                  </td>
                </tr>
              ) : (
                activeBookings.map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{booking._id.slice(-6)}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {booking.booking_id?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.booking_id?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.booking_id?.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{formatDisplayDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">
                        {booking.bookedTime}
                      </div>
                    </td>
                    <td className="p-4">{booking.totalMembers}</td>
                    <td className="p-4">₹{booking.advance_Amt || 0}</td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          updateReservationStatus(booking._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-lg border ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))
              )
            ) : inactiveBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No past reservations found
                </td>
              </tr>
            ) : (
              inactiveBookings.map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{booking._id.slice(-6)}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {booking.booking_id?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.booking_id?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.booking_id?.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>{formatDisplayDate(booking.date)}</div>
                    <div className="text-sm text-gray-500">
                      {booking.bookedTime}
                    </div>
                  </td>
                  <td className="p-4">{booking.totalMembers}</td>
                  <td className="p-4">₹{booking.advance_Amt || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(activeTab === 'active' && activeBookings.length === 0) ||
      (activeTab === 'inactive' && inactiveBookings.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          {selectedDate
            ? `No ${activeTab} reservations found for ${new Date(
                selectedDate
              ).toLocaleDateString()}`
            : `No ${activeTab} reservations found matching your search.`}
        </div>
      ) : null}
    </div>
  );
};

export default RestaurantBookingsManager;
