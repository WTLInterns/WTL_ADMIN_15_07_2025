
"use client"

import React, { useEffect, useState } from "react";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../container/components/Navbar";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  User,
  Truck,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users
} from "lucide-react";

type ScheduledDate = {
  id: number;
  date: string;
  status: string;
  slotId: number | null;
};

type Vendor = {
  id: number;
  vendorCompanyName: string;
  vendorEmail: string;
  contactNo: string;
};

type VendorDriver = {
  vendorDriverId: number;
  driverName: string;
  email: string;
  contactNo: string;
  licenseNumber: string;
};

type VendorCab = {
  id: number;
  vehicleNameAndRegNo: string;
  vehicleRcNo: string;
  carOtherDetails: string;
  status: string;
};

type AdminDriver = {
  id: number;
  driverName: string;
  contactNo: string;
  altMobNum: string;
  emailId: string;
  status: string;
};

type AdminCab = {
  id: number;
  vehicleNameAndRegNo: string;
  vehicleRcNo: string;
  carOtherDetails: string;
  status: string;
};

type User = {
  id: number;
  userName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
};

type Booking = {
  id: number;
  pickUpLocation: string;
  dropLocation: string;
  time: string;
  returnTime: string;
  shiftTime: string | null;
  bookingType: string;
  dateOfList: string | null;
  bookingId: string;
  vendor: Vendor | null;
  vendorDriver: VendorDriver | null;
  vendorCab: VendorCab | null;
  driverAdmin: AdminDriver | null;
  cabAdmin: AdminCab | null;
  user: User | null;
  scheduledDates: ScheduledDate[];
};


export default function ETSAdminPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch(" http://localhost:8081/schedule/getAllBookings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setFilteredBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load bookings");
        setLoading(false);
      });
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickUpLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(booking => {
        switch (filterType) {
          case "vendor":
            return booking.vendor !== null;
          case "admin":
            return booking.driverAdmin !== null || booking.cabAdmin !== null;
          case "unassigned":
            return booking.vendor === null && booking.driverAdmin === null && booking.cabAdmin === null;
          case "schedule":
            return booking.bookingType === "SCHEDULE";
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, filterType]);

  const handleView = (id: number) => {
    router.push(`/ets/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter((b) => b.id !== id));
      // TODO: Call API to delete booking
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetch(" http://localhost:8081/schedule/getAllBookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setFilteredBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load bookings");
        setLoading(false);
      });
  };

  const getAssignmentStatus = (booking: Booking) => {
    if (booking.vendor) return { type: "vendor", label: "Vendor Assigned", color: "blue" };
    if (booking.driverAdmin || booking.cabAdmin) return { type: "admin", label: "Admin Assigned", color: "green" };
    return { type: "unassigned", label: "Unassigned", color: "gray" };
  };

  const getStatusIcon = (booking: Booking) => {
    const status = getAssignmentStatus(booking);
    switch (status.type) {
      case "vendor":
        return <Truck className="w-4 h-4" />;
      case "admin":
        return <Users className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Sidebar using Navbar component */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  ETS Admin Panel
                </h1>
                <p className="text-blue-100 text-lg">Manage and monitor all booking operations</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Total Bookings</p>
                      <p className="text-2xl font-bold text-white">{bookings.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Assigned</p>
                      <p className="text-2xl font-bold text-white">
                        {bookings.filter(b => b.vendor || b.driverAdmin || b.cabAdmin).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Bookings</option>
                  <option value="vendor">Vendor Assigned</option>
                  <option value="admin">Admin Assigned</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="schedule">Scheduled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 font-medium">
                <Plus className="w-4 h-4" />
                New Booking
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 text-lg">Loading bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={refreshData}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="w-16 h-16 text-gray-400" />
              <p className="text-gray-600 text-lg">No bookings found</p>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const status = getAssignmentStatus(booking);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {booking.bookingId}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {booking.id}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusIcon(booking)}
                        {status.label}
                      </div>
                    </div>

                    {/* Route Information */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Pick Up</p>
                          <p className="text-sm text-gray-600 truncate" title={booking.pickUpLocation}>
                            {booking.pickUpLocation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Drop Off</p>
                          <p className="text-sm text-gray-600 truncate" title={booking.dropLocation}>
                            {booking.dropLocation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Departure</p>
                          <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">Return</p>
                          <p className="text-sm font-medium text-gray-900">{booking.returnTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {booking.user && (
                      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.user.userName} {booking.user.lastName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{booking.user.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Assignment Details */}
                    {booking.vendor && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Vendor Assigned</span>
                        </div>
                        <p className="text-sm text-blue-700">{booking.vendor.vendorCompanyName}</p>
                      </div>
                    )}

                    {(booking.driverAdmin || booking.cabAdmin) && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Admin Resources</span>
                        </div>
                        {booking.driverAdmin && (
                          <p className="text-sm text-green-700">Driver: {booking.driverAdmin.driverName}</p>
                        )}
                        {booking.cabAdmin && (
                          <p className="text-sm text-green-700">Cab: {booking.cabAdmin.vehicleNameAndRegNo}</p>
                        )}
                      </div>
                    )}

                    {/* Scheduled Dates */}
                    {booking.scheduledDates && booking.scheduledDates.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-900 mb-2">Scheduled Dates</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.scheduledDates.slice(0, 3).map((date) => (
                            <span
                              key={date.id}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {new Date(date.date).toLocaleDateString()}
                            </span>
                          ))}
                          {booking.scheduledDates.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{booking.scheduledDates.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleView(booking.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
