"use client"

import React, { useState, useEffect } from 'react';
import { Search, Save, Edit, AlertCircle, CheckCircle, Car, DollarSign } from 'lucide-react';
import Navbar from '../../../container/components/Navbar';
import { FaRupeeSign } from 'react-icons/fa';

// Type definitions
type PricingResponse = {
  id: number;
  minDistance: number;
  maxDistance: number;
  hatchback: number;
  sedan: number;
  sedanpremium: number;
  suv: number;
  suvplus: number;
  ertiga: number;
};

type FormData = {
  minDistance: string;
  maxDistance: string;
  hatchback: string;
  sedan: string;
  sedanpremium: string;
  suv: string;
  suvplus: string;
  ertiga: string;
};

const PricingManagement = () => {
  // State management
  const [distance, setDistance] = useState<string>('');
  const [existingPricing, setExistingPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showGST, setShowGST] = useState(false);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    minDistance: '',
    maxDistance: '',
    hatchback: '',
    sedan: '',
    sedanpremium: '',
    suv: '',
    suvplus: '',
    ertiga: ''
  });

  // Service charge and GST rates
  const SERVICE_CHARGE_RATE = 10; // 10%
  const GST_RATE = 5; // 5%

  // Vehicle types for form rendering
  const vehicleTypes = [
    { key: 'hatchback', label: 'Hatchback', icon: '🚗' },
    { key: 'sedan', label: 'Sedan', icon: '🚙' },
    { key: 'sedanpremium', label: 'Sedan Premium', icon: '🚘' },
    { key: 'suv', label: 'SUV', icon: '🚐' },
    { key: 'suvplus', label: 'SUV Plus', icon: '🚛' },
    { key: 'ertiga', label: 'Ertiga', icon: '🚌' }
  ];

  // Helper functions for calculations
  const calculateServiceCharge = (price: number): number => {
    return (price * SERVICE_CHARGE_RATE) / 100;
  };

  const calculateGST = (price: number): number => {
    return (price * GST_RATE) / 100;
  };

  // const calculateTotal = (price: number): number => {
  //   let total = price;
  //   if (showServiceCharge) {
  //     total += calculateServiceCharge(price);
  //   }
  //   if (showGST) {
  //     total += calculateGST(price);
  //   }
  //   return total;
  // };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Search for existing pricing by distance
  const searchPricing = async () => {
    if (!distance || parseInt(distance) <= 0) {
      setError('Please enter a valid distance');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(` http://localhost:8085/api/oneFiftypricing?distance=${distance}`);

      if (response.ok) {
        const data = await response.json();

        // Check if data is null or empty
        if (data && data.id) {
          setExistingPricing(data);
          setShowForm(true);

          // Pre-fill form with existing data
          setFormData({
            minDistance: data.minDistance.toString(),
            maxDistance: data.maxDistance.toString(),
            hatchback: data.hatchback.toString(),
            sedan: data.sedan.toString(),
            sedanpremium: data.sedanpremium.toString(),
            suv: data.suv.toString(),
            suvplus: data.suvplus.toString(),
            ertiga: data.ertiga.toString()
          });

          setSuccess('Existing pricing found! You can update the values below.');
        } else {
          // Data is null or empty - show create form
          setExistingPricing(null);
          setShowForm(true);

          // Reset form for new entry
          setFormData({
            minDistance: '',
            maxDistance: '',
            hatchback: '',
            sedan: '',
            sedanpremium: '',
            suv: '',
            suvplus: '',
            ertiga: ''
          });

          setSuccess('No existing pricing found. You can create new pricing below.');
        }
      } else if (response.status === 404 || response.status === 204) {
        // No existing pricing found (404 Not Found or 204 No Content)
        setExistingPricing(null);
        setShowForm(true);

        // Reset form for new entry
        setFormData({
          minDistance: '',
          maxDistance: '',
          hatchback: '',
          sedan: '',
          sedanpremium: '',
          suv: '',
          suvplus: '',
          ertiga: ''
        });

        setSuccess('No existing pricing found. You can create new pricing below.');
      } else {
        // For any other error status, still show the create form
        setExistingPricing(null);
        setShowForm(true);

        // Reset form for new entry
        setFormData({
          minDistance: '',
          maxDistance: '',
          hatchback: '',
          sedan: '',
          sedanpremium: '',
          suv: '',
          suvplus: '',
          ertiga: ''
        });

        setSuccess('No existing pricing found. You can create new pricing below.');
      }
    } catch (err) {
      // Even on network error, show the create form
      setExistingPricing(null);
      setShowForm(true);

      // Reset form for new entry
      setFormData({
        minDistance: '',
        maxDistance: '',
        hatchback: '',
        sedan: '',
        sedanpremium: '',
        suv: '',
        suvplus: '',
        ertiga: ''
      });

      setSuccess('No existing pricing found. You can create new pricing below.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const requiredFields: (keyof FormData)[] = [
      'minDistance', 'maxDistance', 'hatchback', 'sedan',
      'sedanpremium', 'suv', 'suvplus', 'ertiga'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || parseInt(formData[field]) < 0) {
        setError(`Please enter a valid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (parseInt(formData.minDistance) >= parseInt(formData.maxDistance)) {
      setError('Maximum distance must be greater than minimum distance');
      return false;
    }

    return true;
  };

  // Submit form (create or update)
  const submitForm = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const params = new URLSearchParams({
        minDistance: formData.minDistance,
        maxDistance: formData.maxDistance,
        hatchback: formData.hatchback,
        sedan: formData.sedan,
        sedanpremium: formData.sedanpremium,
        suv: formData.suv,
        suvplus: formData.suvplus,
        ertiga: formData.ertiga
      });

      let url: string;
      let method: string;

      if (existingPricing) {
        // Update existing pricing
        params.append('id', existingPricing.id.toString());
        url = ` http://localhost:8085/api/oneFiftyupdate?${params.toString()}`;
        method = 'PUT';
      } else {
        // Create new pricing
        url = ` http://localhost:8085/api/oneFiftyCreate?${params.toString()}`;
        method = 'POST';
      }

      const response = await fetch(url, { method });

      if (response.ok) {
        const data = await response.json();
        setExistingPricing(data);

        // ✅ Show success popup instead of setting success state
        setShowSuccessPopup(true);
        setSuccessMessage(existingPricing ? 'Pricing updated successfully!' : 'Pricing created successfully!');

        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);

        // Update form with response data
        setFormData({
          minDistance: data.minDistance.toString(),
          maxDistance: data.maxDistance.toString(),
          hatchback: data.hatchback.toString(),
          sedan: data.sedan.toString(),
          sedanpremium: data.sedanpremium.toString(),
          suv: data.suv.toString(),
          suvplus: data.suvplus.toString(),
          ertiga: data.ertiga.toString()
        });
      } else {
        throw new Error('Failed to save pricing');
      }
    } catch (err) {
      setError('Failed to save pricing. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  
  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaRupeeSign className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Pricing Management (1-150 KM)</h1>
          </div>
          <p className="text-gray-600">Search for existing pricing by distance or create new pricing configurations.</p>
        </div>

        {/* Distance Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search by Distance
          </h2>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                Distance (KM)
              </label>
              <input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in kilometers"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="1"
                max="150"
              />
            </div>
            <button
              onClick={searchPricing}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Service Charge and GST Options */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Pricing Options
            </h2>

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
        )}

        {/* Pricing Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              {existingPricing ? (
                <>
                  <Edit className="w-5 h-5" />
                  Update Pricing (ID: {existingPricing.id})
                </>
              ) : (
                <>
                  <Car className="w-5 h-5" />
                  Create New Pricing
                </>
              )}
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); submitForm(); }} className="space-y-6">
              {/* Distance Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minDistance" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Distance (KM) *
                  </label>
                  <input
                    id="minDistance"
                    type="number"
                    value={formData.minDistance}
                    onChange={(e) => handleInputChange('minDistance', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 50"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance (KM) *
                  </label>
                  <input
                    id="maxDistance"
                    type="number"
                    value={formData.maxDistance}
                    onChange={(e) => handleInputChange('maxDistance', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 55"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Pricing (₹)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicleTypes.map((vehicle) => {
                    const basePrice = parseFloat(formData[vehicle.key as keyof FormData]) || 0;
                    const serviceCharge = showServiceCharge ? calculateServiceCharge(basePrice) : 0;
                    const gst = showGST ? calculateGST(basePrice) : 0;
                    const total = basePrice + serviceCharge + gst;

                    return (
                      <div key={vehicle.key} className="space-y-2">
                        <label htmlFor={vehicle.key} className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{vehicle.icon}</span>
                            {vehicle.label} *
                          </span>
                        </label>
                        <input
                          id={vehicle.key}
                          type="number"
                          value={formData[vehicle.key as keyof FormData]}
                          onChange={(e) => handleInputChange(vehicle.key as keyof FormData, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter price"
                          min="0"
                          required
                        />

                        {/* Price Breakdown */}
                        {basePrice > 0 && (showServiceCharge || showGST) && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
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
                              <span>{formatCurrency(total)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {existingPricing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {existingPricing ? 'Update Pricing' : 'Create Pricing'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
    </div>
  );
};

export default PricingManagement;