import axios from 'axios';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import React from 'react'
import { toast } from 'react-hot-toast';

const BookingsManager = ({ bookings, setBookings }) => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Error fetching bookings');
      }
    };

    return (
      <div className="bg-white rounded-lg shadow w-full px-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="border-none focus:ring-0"
              />
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Send Update
              </button>
              <button className="px-4 py-2 border rounded-lg">
                Date
              </button>
            </div>
          </div>
        </div>
  
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Sr no.</th>
              <th className="p-4 text-left">Full name</th>
              <th className="p-4 text-left">Phone number</th>
              <th className="p-4 text-left">Total members</th>
              <th className="p-4 text-left">Time and day</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b">
                <td className="p-4">{booking.id}</td>
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4">
                  <select className="border rounded p-1">
                    <option>{booking.status}</option>
                    <option>Confirmed</option>
                    <option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
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
      </div>
    );
  };

export default BookingsManager
