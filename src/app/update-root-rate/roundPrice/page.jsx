"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../container/components/Navbar";
import axios from "axios";

const UpdateTripPricing = ({ params }) => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [prices, setPrices] = useState({
    hatchback: "",
    sedan: "",
    sedanPremium: "",
    suv: "",
    suvPlus: "",
    ertiga: "",
  });
  const [distance, setDistance] = useState("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Service charge and GST state
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showGST, setShowGST] = useState(false);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Service charge and GST rates
  const SERVICE_CHARGE_RATE = 10; // 10%
  const GST_RATE = 5; // 5%

  // Refs for the autocomplete input fields
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  // Helper functions for calculations
  const calculateServiceCharge = (price) => {
    return (price * SERVICE_CHARGE_RATE) / 100;
  };

  const calculateGST = (price) => {
    return (price * GST_RATE) / 100;
  };

  const calculateTotalWithCharges = (price) => {
    let total = price;
    if (showServiceCharge) {
      total += calculateServiceCharge(price);
    }
    if (showGST) {
      total += calculateGST(price);
    }
    return total;
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Load Google Maps API with Places library
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w&libraries=places";
      script.async = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
        console.log("Google Maps API loaded");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize Autocomplete for Pickup and Drop inputs once API is loaded
  useEffect(() => {
    if (googleMapsLoaded && window.google) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(
        pickupRef.current,
        { types: ["geocode"] }
      );
      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();
        setPickup(place.formatted_address || place.name);
      });

      const dropAutocomplete = new window.google.maps.places.Autocomplete(
        dropRef.current,
        { types: ["geocode"] }
      );
      dropAutocomplete.addListener("place_changed", () => {
        const place = dropAutocomplete.getPlace();
        setDrop(place.formatted_address || place.name);
      });
    }
  }, [googleMapsLoaded]);

  // Calculate distance when both pickup and drop are selected
  useEffect(() => {
    if (pickup && drop && googleMapsLoaded) {
      console.log("Both pickup and drop locations selected. Calculating distance.");
      calculateDistance();
    } else {
      if (!pickup || !drop) console.log("Either pickup or drop location is not selected.");
      if (!googleMapsLoaded) console.log("Google Maps API not loaded yet.");
    }
  }, [pickup, drop, googleMapsLoaded]);

  const calculateDistance = () => {
    if (pickup && drop && googleMapsLoaded) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickup],
          destinations: [drop],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            const calculatedDistance = response.rows[0].elements[0].distance.text;
            setDistance(calculatedDistance);
            console.log(`Calculated Distance: ${calculatedDistance}`);
          } else {
            console.error("Error calculating distance:", status);
            setDistance("Error calculating distance");
          }
        }
      );
    } else {
      console.log("Cannot calculate distance. Either pickup or drop is missing.");
    }
  };

  // Updated handleSubmit with fixes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!pickup || !drop) {
        alert("Please select both pickup and drop locations.");
        return;
      }

      // Validate that all prices are filled and are valid numbers
      const requiredFields = ['hatchback', 'sedan', 'sedanPremium', 'suv', 'suvPlus', 'ertiga'];
      const emptyFields = requiredFields.filter(field => !prices[field] || prices[field] === '');
      
      if (emptyFields.length > 0) {
        alert(`Please fill in all price fields. Missing: ${emptyFields.join(', ')}`);
        return;
      }

      // Validate that all prices are valid numbers
      const invalidFields = requiredFields.filter(field => isNaN(parseInt(prices[field])) || parseInt(prices[field]) <= 0);
      
      if (invalidFields.length > 0) {
        alert(`Please enter valid positive numbers for: ${invalidFields.join(', ')}`);
        return;
      }

      // Extract source/destination city and state from pickup and drop strings
      const pickupParts = pickup.split(",").map((part) => part.trim());
      const dropParts = drop.split(",").map((part) => part.trim());
      const sourceCity = pickupParts[0] || "";
      const sourceState = pickupParts[1] || "";
      const destinationCity = dropParts[0] || "";
      const destinationState = dropParts[1] || "";

      // Validate location parts
      if (!sourceCity || !sourceState || !destinationCity || !destinationState) {
        alert("Please ensure pickup and drop locations are in 'City, State' format");
        return;
      }

      console.log("Extracted locations:", {
        sourceCity,
        sourceState,
        destinationCity,
        destinationState
      });

      // Call the GET API for round-trip to check for existing data
      const getUrl = ` http://localhost:8085/roundTrip/${encodeURIComponent(pickup)}/${encodeURIComponent(drop)}`;
      console.log("Checking existing trips with URL:", getUrl);
      
      const getResponse = await fetch(getUrl);
      let existingTrips = [];
      if (getResponse.ok) {
        existingTrips = await getResponse.json();
        console.log("Existing trips found:", existingTrips);
      } else {
        console.error("GET request error:", getResponse.status);
      }

      let apiUrl;
      let method;

      if (!existingTrips || existingTrips.length === 0) {
        // No record found; use POST API for creating a new round trip pricing record
        apiUrl = " http://localhost:8085/rounprice";
        method = "POST";
        console.log("No existing trip found, creating new one");
      } else {
        // Record exists; call the PUT API to update pricing
        apiUrl = " http://localhost:8085/update-roundway-prices";
        method = "PUT";
        console.log("Existing trip found, updating prices");
      }

      // Build query parameters with correct parameter names and integer conversion
      const queryParams = new URLSearchParams({
        sourceState: sourceState,
        destinationState: destinationState,
        sourceCity: sourceCity,
        destinationCity: destinationCity,
        hatchbackPrice: parseInt(prices.hatchback),
        sedanPrice: parseInt(prices.sedan),
        sedanPremiumPrice: parseInt(prices.sedanPremium),
        suvPrice: parseInt(prices.suv),
        suvPlusPrice: parseInt(prices.suvPlus),
        ertiga: parseInt(prices.ertiga), // Fixed: was "ertigaPrice", now "ertiga"
        ...(method === "POST" ? { status: "s" } : {}),
      }).toString();

      const apiUrlWithParams = `${apiUrl}?${queryParams}`;

      console.log("API URL:", apiUrlWithParams);
      console.log("Method:", method);
      console.log("Query Parameters:", queryParams);

      const apiResponse = await fetch(apiUrlWithParams, { 
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("API Response Status:", apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API call failed: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      console.log("API Response:", result);

      // ✅ Show success popup instead of alert
      setShowSuccessPopup(true);
      setSuccessMessage(method === "POST" ? "Round trip pricing created successfully!" : "Round trip pricing updated successfully!");

      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      
      // Optionally reset form after successful submission
      // setPrices({
      //   hatchback: "",
      //   sedan: "",
      //   sedanPremium: "",
      //   suv: "",
      //   suvPlus: "",
      //   ertiga: "",
      // });
      
    } catch (err) {
      console.error("Error details:", err);
      alert(`Error occurred while processing round-trip pricing: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total cost based on distance and price provided
  const calculateTotal = (price) => {
    if (!distance || isNaN(price)) return null;
    const numericDistance = parseFloat(distance.replace(/[^\d.-]/g, ""));
    // For round trip, double the distance
    const totalDistance = isRoundTrip ? numericDistance * 2 : numericDistance;
    return totalDistance * price;
  };

  const calculateDistanceTotalWithCharges = (price) => {
    const baseTotal = calculateTotal(price);
    if (!baseTotal) return null;

    let finalTotal = baseTotal;
    if (showServiceCharge) {
      finalTotal += calculateServiceCharge(baseTotal);
    }
    if (showGST) {
      finalTotal += calculateGST(baseTotal);
    }
    return finalTotal;
  };

  // For excel file functionality
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(" http://localhost:8085/upload/roundTrip/excel/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const deleteJob = async () => {
    try {
      const res = await axios.delete(" http://localhost:8085/upload/roundTrip/excel/delete");
      alert(res.data);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file || !startDate || !endDate) {
      alert("Please select file, start date, and end date.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      const res = await axios.post(" http://localhost:8085/upload/roundTrip/excel", formData);
      alert(res.data);
      fetchJobs();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Upload failed.");
    }
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            {isRoundTrip
              ? "Round Way Trip Prices Outstation"
              : "One Way Trip Prices Outstation"}
          </h1>
          <a
            href=" http://localhost:8085/upload/excel/exportRound"
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            ExportRoundPrice
          </a>
        </div>

        <div className="card bg-white shadow-md rounded-md mb-6">
          <div className="card-header bg-gray-200 px-4 py-2 rounded-t-md">
            <strong className="text-lg font-semibold flex items-center">
              <i className="mr-2 fa fa-money text-blue-500"></i>
              Update Trip Pricing
              <span className="ml-2 text-xl text-green-500">
                <i className="fa fa-inr"></i>
              </span>
            </strong>
          </div>
          <div className="card-body p-4">
            <div className="flex space-x-2">
              <a
                href="/update-root-rate"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                One way Prices
              </a>
              <a
                href="/update-root-rate/roundPrice"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Round Prices
              </a>
              <a
                href="/update-root-rate/rentalPrice"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Rental Prices
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Pickup Location
              </label>
              <input
                type="text"
                ref={pickupRef}
                placeholder="Enter Pickup Location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Drop Location
              </label>
              <input
                type="text"
                ref={dropRef}
                placeholder="Enter Drop Location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            {distance && <div className="text-sm text-gray-600">Distance: {distance}</div>}
          </div>

          {/* Service Charge and GST Options */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa fa-calculator text-green-500"></i>
              Pricing Options
            </h3>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <input
                  id="serviceCharge"
                  type="checkbox"
                  checked={showServiceCharge}
                  onChange={(e) => setShowServiceCharge(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="serviceCharge" className="ml-2 text-sm font-medium text-gray-700">
                  Include Service Charge ({SERVICE_CHARGE_RATE}%)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="gst"
                  type="checkbox"
                  checked={showGST}
                  onChange={(e) => setShowGST(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="gst" className="ml-2 text-sm font-medium text-gray-700">
                  Include GST ({GST_RATE}%)
                </label>
              </div>
            </div>

            {(showServiceCharge || showGST) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>ℹ️ Note:</strong> These charges will be applied only to the distance calculation display for reference.
                  The base rates saved to the database will remain unchanged.
                  {showServiceCharge && ` Service Charge: +${SERVICE_CHARGE_RATE}%`}
                  {showServiceCharge && showGST && ', '}
                  {showGST && ` GST: +${GST_RATE}%`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Prices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {["hatchback", "sedan", "sedanPremium", "suv", "suvPlus", "ertiga"].map((carType) => {
                const basePrice = parseFloat(prices[carType]) || 0;
                const serviceCharge = showServiceCharge ? calculateServiceCharge(basePrice) : 0;
                const gst = showGST ? calculateGST(basePrice) : 0;
                const totalWithCharges = basePrice + serviceCharge + gst;

                return (
                  <div key={carType} className="space-y-2">
                    <label className="block text-sm font-medium capitalize">
                      {carType.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={prices[carType]}
                      onChange={(e) => setPrices({ ...prices, [carType]: e.target.value })}
                      className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter price"
                      required
                    />

                    {/* Vehicle Type Label */}
                    {prices[carType] && (
                      <div className="mt-2 text-sm text-gray-600">
                        {`${carType.charAt(0).toUpperCase() + carType.slice(1)} Cab`}
                      </div>
                    )}

                    {/* Price Breakdown
                    {basePrice > 0 && (showServiceCharge || showGST) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1 border">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span className="font-medium">{formatCurrency(basePrice)}</span>
                        </div>
                        {showServiceCharge && (
                          <div className="flex justify-between text-blue-600">
                            <span>Service Charge ({SERVICE_CHARGE_RATE}%):</span>
                            <span className="font-medium">+{formatCurrency(serviceCharge)}</span>
                          </div>
                        )}
                        {showGST && (
                          <div className="flex justify-between text-green-600">
                            <span>GST ({GST_RATE}%):</span>
                            <span className="font-medium">+{formatCurrency(gst)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-1 font-semibold text-gray-800">
                          <span>Total:</span>
                          <span>{formatCurrency(totalWithCharges)}</span>
                        </div>
                      </div>
                    )} */}

                    {/* Distance-based calculation with charges applied */}
                    {prices[carType] && distance && (
                      <div className="mt-2 text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                        <div className="font-medium text-gray-800 mb-2">Distance Calculation:</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Base Total (Price × Distance{isRoundTrip ? ' × 2' : ''}):</span>
                            <span className="font-medium">₹{calculateTotal(prices[carType])?.toFixed(2)}</span>
                          </div>
                          {showServiceCharge && (
                            <div className="flex justify-between text-blue-600">
                              <span>Service Charge ({SERVICE_CHARGE_RATE}%):</span>
                              <span>+₹{calculateServiceCharge(calculateTotal(prices[carType]) || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {showGST && (
                            <div className="flex justify-between text-green-600">
                              <span>GST ({GST_RATE}%):</span>
                              <span>+₹{calculateGST(calculateTotal(prices[carType]) || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {(showServiceCharge || showGST) && (
                            <div className="flex justify-between border-t pt-1 font-semibold text-gray-800">
                              <span>Final Total:</span>
                              <span>₹{calculateDistanceTotalWithCharges(prices[carType])?.toFixed(2)}</span>
                            </div>
                          )}
                          {!showServiceCharge && !showGST && (
                            <div className="flex justify-between font-semibold text-gray-800">
                              <span>Total:</span>
                              <span>₹{calculateTotal(prices[carType])?.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isSubmitting ? 'Processing...' : 'Update'}
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Excel Job Manager</h2>

        <form onSubmit={handleFileUpload} className="mb-6 space-y-4">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="block"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block border rounded p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block border rounded p-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Excel & Schedule
          </button>
        </form>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Scheduled Jobs</h3>
          {jobs.length === 0 ? (
            <p>No jobs scheduled</p>
          ) : (
            <ul className="list-disc pl-5">
              {jobs.map((job, i) => (
                <li key={i} className="mb-1">
                  <strong>{job.jobName}</strong> – Next Fire: {job.nextFireTime}
                </li>
              ))}
            </ul>
          )}
        </div>

        {jobs.length > 0 && (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={deleteJob}
          >
            Delete Job & Excel
          </button>
        )}
      </div>

      {/* ✅ SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 transform animate-pulse">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>

              {/* Auto-close message */}
              <p className="text-sm text-gray-500">This popup will close automatically in 3 seconds</p>

              {/* Manual Close Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateTripPricing;