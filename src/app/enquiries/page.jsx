"use client";
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../container/components/Navbar";

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch enquiries from API
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8085/getAllEnquiry");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEnquiries(data);
      setError("");
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setError("Failed to fetch enquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Get unique services for filter dropdown
  const uniqueServices = useMemo(() => {
    const services = [...new Set(enquiries.map(e => e.serviceName))];
    return services.map(service => ({
      value: service,
      label: service,
      count: enquiries.filter(e => e.serviceName === service).length
    }));
  }, [enquiries]);

  // Filter and sort enquiries
  const filteredAndSortedEnquiries = useMemo(() => {
    let filtered = [...enquiries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(enquiry =>
        enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.contact.includes(searchTerm)
      );
    }

    // Service filter
    if (selectedService !== "all") {
      filtered = filtered.filter(enquiry => enquiry.serviceName === selectedService);
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== "all") {
      filtered = filtered.filter(enquiry => {
        const enquiryDate = new Date(enquiry.timeStamp);
        switch (dateFilter) {
          case "today":
            return enquiryDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return enquiryDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return enquiryDate >= monthAgo;
          case "custom":
            if (customDateRange.start && customDateRange.end) {
              const startDate = new Date(customDateRange.start);
              const endDate = new Date(customDateRange.end);
              return enquiryDate >= startDate && enquiryDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.timeStamp) - new Date(b.timeStamp);
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "service":
          comparison = a.serviceName.localeCompare(b.serviceName);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [enquiries, searchTerm, selectedService, dateFilter, customDateRange, sortBy, sortOrder]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedService("all");
    setDateFilter("all");
    setCustomDateRange({ start: "", end: "" });
    setSortBy("date");
    setSortOrder("desc");
  };

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedService !== "all") count++;
    if (dateFilter !== "all") count++;
    return count;
  }, [searchTerm, selectedService, dateFilter]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">All Enquiries</h1>
              <p className="text-gray-600 mt-2">Manage and view all customer enquiries</p>
            </div>
            <button
              onClick={fetchEnquiries}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{enquiries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAndSortedEnquiries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enquiries.filter(e => {
                      const enquiryDate = new Date(e.timeStamp);
                      const today = new Date();
                      const diffTime = Math.abs(today - enquiryDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Filters</p>
                  <p className="text-2xl font-bold text-gray-900">{activeFiltersCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters & Search
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Service Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="all">All Services ({enquiries.length})</option>
                  {uniqueServices.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label} ({service.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="service">Service</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                  >
                    {sortOrder === "asc" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Date Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700 self-center">Quick Filters:</span>
              {[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "custom", label: "Custom Range" }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setDateFilter(filter.value);
                    if (filter.value === "custom") {
                      setShowDatePicker(true);
                    } else {
                      setShowDatePicker(false);
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    dateFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker */}
            {showDatePicker && dateFilter === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedService !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Service: {selectedService}
                      <button
                        onClick={() => setSelectedService("all")}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {dateFilter !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Date: {dateFilter === "custom" ? "Custom Range" : dateFilter}
                      <button
                        onClick={() => {
                          setDateFilter("all");
                          setShowDatePicker(false);
                        }}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Counter */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredAndSortedEnquiries.length}</span> of{" "}
              <span className="font-medium">{enquiries.length}</span> enquiries
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading enquiries...</span>
            </div>
          )}

          {/* Enquiries Table */}
          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Enquiries List</h2>
              </div>
              
              {enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No enquiries found</h3>
                  <p className="mt-1 text-sm text-gray-500">No customer enquiries have been submitted yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enquiries.map((enquiry) => (
                        <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">#{enquiry.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{enquiry.name}</div>
                              <div className="text-gray-500">{enquiry.email}</div>
                              <div className="text-gray-500">{enquiry.contact}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {enquiry.serviceName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestamp(enquiry.timeStamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              View
                            </button>
                            <button className="text-green-600 hover:text-green-900 mr-3">
                              Contact
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiriesPage;
