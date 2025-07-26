'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../../container/components/Navbar';

const UpdateTripPricing = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [dStates, setDStates] = useState([]);
  const [dCities, setDCities] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDState, setSelectedDState] = useState('');
  const [selectedDCity, setSelectedDCity] = useState('');

  const [prices, setPrices] = useState({
    hatchback: '',
    sedan: '',
    sedanPremium: '',
    suv: '',
    suvPlus: '',
    ertiga: '',
  });

  // Service charge and GST state
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showGST, setShowGST] = useState(false);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Service charge and GST rates
  const SERVICE_CHARGE_RATE = 10; // 10%
  const GST_RATE = 5; // 5%

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

  useEffect(() => {
    // Fetch initial state data
    fetch('/api/states') // Adjust your API endpoint
      .then((res) => res.json())
      .then((data) => {
        setStates(data);
        setDStates(data);
      })
      .catch((error) => console.error('Error fetching states:', error));
  }, []);

  const handleStateChange = async (stateId) => {
    setSelectedState(stateId);
    try {
      const response = await fetch(`/api/cities?stateId=${stateId}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleDStateChange = async (stateId) => {
    setSelectedDState(stateId);
    try {
      const response = await fetch(`/api/dCities?stateId=${stateId}`);
      const data = await response.json();
      setDCities(data);
    } catch (error) {
      console.error('Error fetching destination cities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('Submitted Prices:', prices);
      console.log('Selected Locations:', {
        selectedState,
        selectedCity,
        selectedDState,
        selectedDCity,
      });

      // TODO: Add actual API call here for rental pricing
      // For now, simulate success

      // ✅ Show success popup
      setShowSuccessPopup(true);
      setSuccessMessage("Rental pricing updated successfully!");

      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating rental pricing:', error);
      alert('Error occurred while updating rental pricing');
    }
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Rental Prices Outstation
        </h1>
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
            {/* Source State and City */}
            <div>
              <label className="block text-sm font-medium">Source State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Source City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination State and City */}
            <div>
              <label className="block text-sm font-medium">Destination State</label>
              <select
                value={selectedDState}
                onChange={(e) => handleDStateChange(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select State</option>
                {dStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Destination City</label>
              <select
                value={selectedDCity}
                onChange={(e) => setSelectedDCity(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select City</option>
                {dCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
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
                  <strong>ℹ️ Note:</strong> These charges will be applied only to the pricing display for reference.
                  The base rates saved to the database will remain unchanged.
                  {showServiceCharge && ` Service Charge: +${SERVICE_CHARGE_RATE}%`}
                  {showServiceCharge && showGST && ', '}
                  {showGST && ` GST: +${GST_RATE}%`}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Prices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                      min="0"
                      value={prices[carType]}
                      onChange={(e) => setPrices({ ...prices, [carType]: e.target.value })}
                      className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Vehicle Type Label */}
                    {prices[carType] && (
                      <div className="mt-2 text-sm text-gray-600">
                        {`${carType.charAt(0).toUpperCase() + carType.slice(1)} Cab`}
                      </div>
                    )}

                    {/* Price Breakdown */}
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>

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
    </div>
  );
};

export default UpdateTripPricing;
