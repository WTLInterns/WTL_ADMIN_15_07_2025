"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../../../container/components/Navbar";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Bookings = () => {
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tripType, setTripType] = useState("oneWay");
  const [userPickup, setUserPickUp] = useState("");
  const [userDrop, setUserDrop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [time, setTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [car, setCar] = useState("Sedan");
  const [amount, setAmount] = useState("");
  const [collection, setCollection] = useState("0");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const[driverBhata,setDriverBhata]=useState(0);
  const[serviceCharge,setServiceCharge]=useState(0);
  const[gst,setGst]=useState(0);
  const[baseAmount,setBaseAmount]=useState(0);

  // Google Maps Autocomplete states
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  // Pricing states
  const [pricingData, setPricingData] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [packageName, setPackageName] = useState("4hrs/40km"); // For rental trips

  // Autocomplete status
  const [autocompleteReady, setAutocompleteReady] = useState(false);

  // Additional charges states
  const [includeDriverBhatta, setIncludeDriverBhatta] = useState(false);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);
  const [includeGST, setIncludeGST] = useState(false);

  // Invoice generation states
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  // Refs for autocomplete
  const pickupRef = useRef(null);
  const dropRef = useRef(null);
  const pickupAutocomplete = useRef(null);
  const dropAutocomplete = useRef(null);
  const mapRef = useRef(null);

  const router = useRouter();

  // Bookings from backend
  const [bookings, setBookings] = useState([]);

  // Filter state for trip type (all, oneWay, roundTrip)
  const [filterTrip, setFilterTrip] = useState("all");

  const API_KEY = "AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w";

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('Google Maps already loaded, initializing autocomplete');
          setTimeout(initializeAutocomplete, 100);
        }
        return;
      }

      console.log('Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Create global callback
      window.initGoogleMaps = () => {
        console.log('Google Maps loaded successfully');
        setTimeout(initializeAutocomplete, 100);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setDistanceError('Failed to load Google Maps. Please check your internet connection.');
      };

      document.head.appendChild(script);
    };

    if (isFormOpen) {
      loadGoogleMapsScript();
    }

    // Cleanup function
    return () => {
      if (pickupAutocomplete.current) {
        window.google?.maps?.event?.clearInstanceListeners(pickupAutocomplete.current);
      }
      if (dropAutocomplete.current) {
        window.google?.maps?.event?.clearInstanceListeners(dropAutocomplete.current);
      }
    };
  }, [isFormOpen]);

  const initializeAutocomplete = () => {
    console.log('Initializing autocomplete...');

    // Check if Google Maps is loaded
    if (!window.google) {
      console.error('Google Maps not loaded');
      setDistanceError('Google Maps not loaded');
      return;
    }

    if (!window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places library not loaded');
      setDistanceError('Google Maps Places library not loaded');
      return;
    }

    // Check if DOM elements exist
    if (!pickupRef.current || !dropRef.current) {
      console.error('Input elements not found');
      setTimeout(initializeAutocomplete, 500); // Retry after 500ms
      return;
    }

    try {
      console.log('Creating autocomplete instances...');

      // Clear any existing autocomplete instances
      if (pickupAutocomplete.current) {
        window.google.maps.event.clearInstanceListeners(pickupAutocomplete.current);
      }
      if (dropAutocomplete.current) {
        window.google.maps.event.clearInstanceListeners(dropAutocomplete.current);
      }

      // Initialize pickup autocomplete
      pickupAutocomplete.current = new window.google.maps.places.Autocomplete(
        pickupRef.current,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'in' }, // Restrict to India
          fields: ['formatted_address', 'name', 'geometry']
        }
      );

      // Initialize drop autocomplete
      dropAutocomplete.current = new window.google.maps.places.Autocomplete(
        dropRef.current,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'in' }, // Restrict to India
          fields: ['formatted_address', 'name', 'geometry']
        }
      );

      // Add listeners
      pickupAutocomplete.current.addListener('place_changed', () => {
        console.log('Pickup place changed');
        const place = pickupAutocomplete.current.getPlace();
        if (place && (place.formatted_address || place.name)) {
          setUserPickUp(place.formatted_address || place.name);
          calculateDistance();
        }
      });

      dropAutocomplete.current.addListener('place_changed', () => {
        console.log('Drop place changed');
        const place = dropAutocomplete.current.getPlace();
        if (place && (place.formatted_address || place.name)) {
          setUserDrop(place.formatted_address || place.name);
          calculateDistance();
        }
      });

      console.log('Autocomplete initialized successfully');
      setDistanceError(''); // Clear any previous errors

    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setDistanceError('Error initializing location search');
    }
  };

  const calculateDistance = async () => {
    const pickup = pickupRef.current?.value;
    const drop = dropRef.current?.value;

    if (!pickup || !drop || pickup.length < 3 || drop.length < 3) {
      setDistance('');
      setDuration('');
      return;
    }

    if (!window.google) {
      setDistanceError('Google Maps API not loaded');
      return;
    }

    setLoadingDistance(true);
    setDistanceError('');

    try {
      const service = new window.google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [pickup],
          destinations: [drop],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: true,
        },
        (response, status) => {
          setLoadingDistance(false);

          if (status === 'OK') {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              setDistance(element.distance.text);
              setDuration(element.duration.text);
              setDistanceError('');
              // Fetch pricing after distance calculation
              fetchPricing(pickup, drop);
            } else {
              setDistanceError('Unable to calculate distance between these locations');
              setDistance('');
              setDuration('');
            }
          } else {
            setDistanceError('Error calculating distance. Please try again.');
            setDistance('');
            setDuration('');
          }
        }
      );
    } catch (err) {
      console.error('Distance calculation error:', err);
      setDistanceError('Error calculating distance. Please try again.');
      setDistance('');
      setDuration('');
      setLoadingDistance(false);
    }
  };

  // Function to fetch pricing from /api/cab1 API
  const fetchPricing = async (pickup, drop) => {
    if (!pickup || !drop || !tripType) {
      console.log('Missing required parameters for pricing fetch');
      return;
    }

    // Validate required parameters based on trip type
    if (tripType === 'roundTrip' && !returnDate) {
      setPricingError('Return date is required for round trip');
      return;
    }

    if (tripType === 'rental' && !packageName) {
      setPricingError('Package selection is required for rental trips');
      return;
    }

    setLoadingPricing(true);
    setPricingError('');

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('tripType', tripType);
      params.append('pickupLocation', pickup);
      params.append('dropLocation', drop);
      params.append('date', startDate || new Date().toISOString().split('T')[0]);
      params.append('time', time || '10:00');

      // Add distance parameter (extract numeric value from distance string)
      // if (distance) {
      //   const numericDistance = distance.replace(/[^0-9.]/g, '');
      //   if (numericDistance) {
      //     params.append('distance', numericDistance);
      //   }
      // }

      // Add Returndate for roundTrip (note the capital R)
      if (tripType === 'roundTrip' && returnDate) {
        params.append('Returndate', returnDate);
      }

      // Add packageName for rental trips
      if (tripType === 'rental' && packageName) {
        params.append('packageName', packageName);
      }

      const apiUrl = `http://localhost:8085/api/cab1?${params.toString()}`;
      console.log('Fetching pricing from:', apiUrl);
      console.log('Parameters:', Object.fromEntries(params));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Validate and sanitize the response data
        const sanitizedData = {
          ...data,
          distance: data.distance || 0,
          days: data.days || 1,
          tripinfo: data.tripinfo || [],
          pickupLocation: data.pickupLocation || pickup,
          dropLocation: data.dropLocation || drop
        };

        setPricingData(sanitizedData);
        console.log('Pricing data received:', sanitizedData);
      } else {
        const errorText = await response.text();
        setPricingError(`Failed to fetch pricing information: ${response.status}`);
        console.error('Pricing API error:', response.status, errorText);
      }
    } catch (error) {
      setPricingError('Error fetching pricing information');
      console.error('Pricing fetch error:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  // Function to handle trip type change and fetch pricing
  const handleTripTypeChange = (newTripType) => {
    setTripType(newTripType);
    // Reset pricing data when trip type changes
    setPricingData(null);
    setPricingError('');

    // Reset package name when switching to/from rental
    if (newTripType === 'rental') {
      setPackageName('4hrs/40km');
    }

    // If we have pickup and drop locations, fetch new pricing
    if (userPickup && userDrop) {
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        fetchPricing(userPickup, userDrop);
      }, 100);
    }
  };

  // Function to handle package change for rental trips
  const handlePackageChange = (newPackage) => {
    setPackageName(newPackage);

    // If we have pickup and drop locations and it's a rental trip, fetch new pricing
    if (userPickup && userDrop && tripType === 'rental') {
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        fetchPricing(userPickup, userDrop);
      }, 100);
    }
  };

  // Function to calculate total amount with all charges
  const calculateTotalAmount = (basePrice) => {
    if (!basePrice) return { total: 0, breakdown: { basePrice: 0, driverBhata: 0, serviceCharge: 0, gst: 0 } };

    let total = parseFloat(basePrice);
    let breakdown = {
      basePrice: total,
      driverBhata: 0,
      serviceCharge: 0,
      gst: 0
    };

    // Driver Bhata: 300 * days
    if (includeDriverBhatta && pricingData?.days) {
      breakdown.driverBhata = 300 * pricingData.days;
      total += breakdown.driverBhata;
    }

    // Service Charge: 10% of backend price
    if (includeServiceCharge) {
      breakdown.serviceCharge = total * 0.10;
      total += breakdown.serviceCharge;
    }

    // GST: 5% of backend price
    if (includeGST) {
      breakdown.gst = total * 0.05;
      total += breakdown.gst;
    }

    return { total: Math.round(total), breakdown };
  };

  // Function to update amount when charges change
  const updateAmountWithCharges = () => {
    if (car && pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0) {
      const tripInfo = pricingData.tripinfo[0];
      let basePrice = 0;
      switch(car) {
        case 'Hatchback': basePrice = tripInfo.hatchback; break;
        case 'Sedan': basePrice = tripInfo.sedan; break;
        case 'SedanPremium': basePrice = tripInfo.sedanpremium; break;
        case 'SUV': basePrice = tripInfo.suv; break;
        case 'SUVPlus': basePrice = tripInfo.suvplus; break;
        case 'Ertiga': basePrice = tripInfo.ertiga; break;
        default: basePrice = tripInfo.sedan;
      }
      const totalData = calculateTotalAmount(basePrice);

      // Update individual state variables
      setBaseAmount(basePrice);
      setDriverBhata(totalData.breakdown.driverBhata);
      setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
      setGst(Math.round(totalData.breakdown.gst));
      setAmount(totalData.total.toString());
    }
  };

  // Update amount when charges change
  React.useEffect(() => {
    updateAmountWithCharges();
  }, [includeDriverBhatta, includeServiceCharge, includeGST, car, pricingData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate required fields
    if (!userPickup || !userDrop || !startDate || !time || !name || !phone) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate trip type specific requirements
    if (tripType === 'roundTrip' && !returnDate) {
      setError("Return date is required for round trip");
      return;
    }

    if (tripType === 'rental' && !packageName) {
      setError("Package selection is required for rental trips");
      return;
    }

    // Validate that pricing data is available
    if (!pricingData || !pricingData.tripinfo || pricingData.tripinfo.length === 0) {
      setError("Please calculate pricing first by clicking 'Calculate Distance & Get Pricing'");
      return;
    }

    // Get the price for the selected car type
    const tripInfo = pricingData.tripinfo[0];
    let selectedPrice = 0;
    switch(car) {
      case 'Hatchback':
        selectedPrice = tripInfo.hatchback;
        break;
      case 'Sedan':
        selectedPrice = tripInfo.sedan;
        break;
      case 'SedanPremium':
        selectedPrice = tripInfo.sedanpremium;
        break;
      case 'SUV':
        selectedPrice = tripInfo.suv;
        break;
      case 'SUVPlus':
        selectedPrice = tripInfo.suvplus;
        break;
      case 'Ertiga':
        selectedPrice = tripInfo.ertiga;
        break;
      default:
        selectedPrice = tripInfo.sedan; // Default to sedan
    }

    // Calculate total amount with all charges
    const totalAmountData = calculateTotalAmount(selectedPrice);
    const finalAmount = totalAmountData.total;

    const params = new URLSearchParams();
    params.append("bookingType", "custom_booking");
    params.append("tripType", tripType);
    params.append("userPickup", userPickup);
    params.append("userDrop", userDrop);
    params.append("startDate", startDate);
    params.append("time", time);
    if (returnDate) params.append("returnDate", returnDate);

    // Add distance from pricing data
    if (pricingData?.distance) {
      params.append("distance", pricingData.distance.toString());
    } else if (distance) {
      const numericDistance = distance.replace(/[^0-9.]/g, '');
      if (numericDistance) params.append("distance", numericDistance);
    }

    if (tripType === 'rental' && packageName) params.append("packageName", packageName);

    // Add required booking parameters with proper data type validation
    params.append("car", car);
    params.append("amount", finalAmount.toString());
    params.append("name", name);
    params.append("email", email || "");
    params.append("phone", phone);

    // Ensure collection is a valid number (convert empty string to 0)
    const collectionValue = collection && collection.trim() !== "" ? collection : "0";
    params.append("collection", collectionValue);

    params.append("companyName", companyName || "");

    // Add additional charges information
    params.append("includeDriverBhatta", includeDriverBhatta.toString());
    params.append("includeServiceCharge", includeServiceCharge.toString());
    params.append("includeGST", includeGST.toString());
    params.append("driverBhata", driverBhata.toString());
    params.append("serviceCharge", serviceCharge.toString());
    params.append("gst", gst.toString());
    params.append("baseAmount", baseAmount.toString());

    // Add days information
    if (pricingData?.days) {
      params.append("days", pricingData.days.toString());
    }

    // Debug: Log all parameters being sent
    console.log("=== Booking Creation Debug ===");
    console.log("Selected car:", car);
    console.log("Selected price:", selectedPrice);
    console.log("Final amount:", finalAmount);
    console.log("Charge breakdown:", {
      baseAmount,
      driverBhata,
      serviceCharge,
      gst,
      days: pricingData?.days
    });
    console.log("Pricing data:", pricingData);
    console.log("Booking parameters being sent:");
    for (const [key, value] of params.entries()) {
      console.log(`${key}: ${value} (type: ${typeof value})`);
    }

    try {
      const response = await fetch("http://localhost:8085/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const resultText = await response.text();
        console.log("Booking created successfully:", resultText);
        setSuccessMessage("Booking created successfully.");
        setError(null); // Clear any previous errors
        fetchBookings();
        setIsFormOpen(false);
        // Reset form
        setUserPickUp("");
        setUserDrop("");
        setDistance("");
        setDuration("");
        setName("");
        setEmail("");
        setPhone("");
        setCompanyName("");
        setStartDate("");
        setTime("");
        setReturnDate("");
        setAmount("");
        setCollection("0");
        setTripType("oneWay");
        setPricingData(null);
        setPricingError("");
        setPackageName("4hrs/40km");
        setIncludeDriverBhatta(false);
        setIncludeServiceCharge(false);
        setIncludeGST(false);
        setDriverBhata(0);
        setServiceCharge(0);
        setGst(0);
        setBaseAmount(0);
        
      } else {
        const errorText = await response.text();
        console.error("Failed to create booking:", errorText);

        // Try to parse error response for better error messages
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            setError(`Failed to create booking: ${errorJson.message}`);
          } else if (errorJson.error) {
            setError(`Failed to create booking: ${errorJson.error}`);
          } else {
            setError(`Failed to create booking: ${response.status} ${response.statusText}`);
          }
        } catch (parseError) {
          setError(`Failed to create booking: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error during booking creation:", error);
      setError(`Network or server error: ${error.message}`);
    }
  };

  // Fetch bookings from the backend
  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:8085/details");
      if (response.status === 200 && Array.isArray(response.data)) {
        setBookings(response.data);
        console.log(response.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings to show only custom bookings and then by trip type if needed.
  const filteredBookings = bookings.filter((b) => {
    return (
      b.bookingType === "custom_booking" &&
      (filterTrip === "all" || b.tripType === filterTrip)
    );
  });

  const deleteBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8085/delete/${bookingId}`);
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.bookingId !== bookingId)
      );
      fetchBookings();
    } catch (error) {
      setError("Error deleting booking");
    } finally {
      setDeleting(false);
    }
  };

  // Function to generate invoice
  const generateInvoice = async (bookingId) => {
    setGeneratingInvoice(true);
    setCurrentInvoiceId(bookingId);
    setInvoiceError("");

    try {
      console.log("Fetching booking data for ID:", bookingId);

      // Fetch booking data from API
      const response = await fetch(`http://localhost:8085/booking/${bookingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.status} ${response.statusText}`);
      }

      const bookingData = await response.json();
      console.log("Booking data received:", bookingData);

      // Generate and download PDF
      await generatePDFInvoice(bookingData);

    } catch (error) {
      console.error("Error generating invoice:", error);
      setInvoiceError(`Failed to generate invoice: ${error.message}`);
      alert(`Error generating invoice: ${error.message}`);
    } finally {
      setGeneratingInvoice(false);
      setCurrentInvoiceId(null);
    }
  };

  // Function to generate PDF from booking data
  const generatePDFInvoice = async (bookingData) => {
    // Create the HTML content with the booking data
    const invoiceHTML = createInvoiceHTML(bookingData);

    // Create a new window for the invoice with download functionality
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    // Add download functionality to the window
    printWindow.onload = () => {
      // Add download button and functionality
      addDownloadFunctionality(printWindow, bookingData);

      // Auto-focus for better UX
      printWindow.focus();
    };
  };

  // Function to add download functionality to the invoice window
  const addDownloadFunctionality = (printWindow, bookingData) => {
    const doc = printWindow.document;

    // Create download button container
    const downloadContainer = doc.createElement('div');
    downloadContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 10px;
      border: 2px solid #4285f4;
      border-radius: 0px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // Create download button
    const downloadBtn = doc.createElement('button');
    downloadBtn.innerHTML = '📥 Download PDF';
    downloadBtn.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-right: 8px;
    `;

    // Create print button
    const printBtn = doc.createElement('button');
    printBtn.innerHTML = '🖨️ Print';
    printBtn.style.cssText = `
      background: #34a853;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;

    // Add click handlers
    downloadBtn.onclick = () => downloadAsPDF(printWindow, bookingData);
    printBtn.onclick = () => printWindow.print();

    // Add buttons to container
    downloadContainer.appendChild(downloadBtn);
    downloadContainer.appendChild(printBtn);

    // Add container to document
    doc.body.appendChild(downloadContainer);
  };

  // Function to download invoice as PDF
  const downloadAsPDF = async (printWindow, bookingData) => {
    try {
      // Generate filename
      const filename = generatePDFFilename(bookingData);

      // Try to use html2pdf if available, otherwise fallback to print
      if (typeof printWindow.html2pdf !== 'undefined') {
        const element = printWindow.document.querySelector('.container');

        // Optimize element for PDF generation
        element.style.width = '100%';
        element.style.maxWidth = '800px';
        element.style.margin = '0 auto';
        element.style.padding = '20px';
        element.style.boxSizing = 'border-box';

        const opt = {
          margin: [10, 10, 10, 10], // margins in mm [top, left, bottom, right]
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 1.2, // Reduced scale to prevent cutting
            useCORS: true,
            allowTaint: true,
            width: 800, // Fixed width
            height: null, // Auto height
            scrollX: 0,
            scrollY: 0,
            letterRendering: true,
            logging: false
          },
          jsPDF: {
            unit: 'mm',
            format: 'a1', // A1 format for large content
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await printWindow.html2pdf().set(opt).from(element).save();
      } else {
        // Fallback: Load html2pdf dynamically
        await loadHTML2PDF(printWindow);

        const element = printWindow.document.querySelector('.container');

        // Optimize element for PDF generation
        element.style.width = '100%';
        element.style.maxWidth = '800px';
        element.style.margin = '0 auto';
        element.style.padding = '20px';
        element.style.boxSizing = 'border-box';

        const opt = {
          margin: [10, 10, 10, 10], // margins in mm [top, left, bottom, right]
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 1.2, // Reduced scale to prevent cutting
            useCORS: true,
            allowTaint: true,
            width: 800, // Fixed width
            height: null, // Auto height
            scrollX: 0,
            scrollY: 0,
            letterRendering: true,
            logging: false
          },
          jsPDF: {
            unit: 'mm',
            format: 'a1', // A1 format for large content
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await printWindow.html2pdf().set(opt).from(element).save();
      }
    } catch (error) {
      console.error('PDF download failed:', error);

      // Enhanced fallback with better print styles
      const printStyles = printWindow.document.createElement('style');
      printStyles.textContent = `
        @page {
          size: A1 portrait;
          margin: 10mm;
        }
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          table {
            width: 100% !important;
            table-layout: fixed !important;
          }
          td, th {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
        }
      `;
      printWindow.document.head.appendChild(printStyles);

      alert('PDF download failed. The print dialog will open - please select "Save as PDF" and choose A1 paper size for best results.');
      printWindow.print();
    }
  };

  // Function to load html2pdf library dynamically
  const loadHTML2PDF = (targetWindow) => {
    return new Promise((resolve, reject) => {
      const script = targetWindow.document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      targetWindow.document.head.appendChild(script);
    });
  };

  // Function to generate PDF filename
  const generatePDFFilename = (bookingData) => {
    const bookingId = bookingData.bookingId || bookingData.id || 'Unknown';
    const date = bookingData.startDate || new Date().toISOString().split('T')[0];
    const formattedDate = date.replace(/-/g, '');
    return `Invoice_${bookingId}_${formattedDate}.pdf`;
  };

  // Function to create HTML content for invoice
  const createInvoiceHTML = (bookingData) => {
    // Helper function to format dates
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Log the actual booking data structure for debugging
    console.log("=== Booking Data Structure ===");
    console.log("Raw booking data:", bookingData);
    console.log("Trip Type:", bookingData.tripType);
    console.log("Days:", bookingData.days);
    console.log("Available fields:", Object.keys(bookingData));

    // Map booking data to invoice format with improved field mapping
    const invoiceData = {
      // Basic booking info
      bookid: bookingData.bookingId || bookingData.id || 'N/A',
      car: bookingData.car || 'N/A',
      phone: bookingData.phone || 'N/A',

      // Location fields - check multiple possible field names
      pickup: bookingData.userPickup || bookingData.pickupLocation || bookingData.pickup || 'N/A',
      drop: bookingData.userDrop || bookingData.dropLocation || bookingData.drop || 'N/A',

      // Date and time fields
      date: bookingData.startDate || bookingData.date || 'N/A',
      time: bookingData.time || bookingData.startTime || 'N/A',
      dateend: bookingData.returnDate || bookingData.endDate || 'N/A',
      timeend: bookingData.endTime || '06:00 PM',

      // Trip type mapping with proper handling
      trip: getTripTypeDisplay(bookingData.tripType),
      tripType: bookingData.tripType || 'oneWay', // Keep original for logic

      // Customer info
      name: bookingData.name || 'N/A',
      email: bookingData.email || 'N/A',

      // Financial fields with proper fallbacks
      service: parseFloat(bookingData.serviceCharge || 0),
      parking: parseFloat(bookingData.parkingCharges || 0),
      gst: parseFloat(bookingData.gst || 0),
      distance: parseFloat(bookingData.distance || 0),
      amount: parseFloat(bookingData.baseAmount || bookingData.amount || 0),
      driver: parseFloat(bookingData.driverBhata || bookingData.driverBhatta || 0),
      toll: parseFloat(bookingData.tollCharges || 0),

      // Days calculation with proper handling
      days: calculateDays(bookingData),

      // Total amounts calculation
      new_amount: calculateSubtotal(bookingData),
      totalpaidAmt: parseFloat(bookingData.amount || bookingData.totalAmount || 0),
      remainAmt: parseFloat(bookingData.remainingAmount || 0),

      // Company details
      companyname: bookingData.companyName || '',
      companyaddress: bookingData.companyAddress || '',
      gstno: bookingData.gstNumber || bookingData.clientGst || ''
    };

    console.log("=== Mapped Invoice Data ===");
    console.log("Mapped invoice data:", invoiceData);

    return generateInvoiceHTML(invoiceData);
  };

  // Helper function to get trip type display text
  const getTripTypeDisplay = (tripType) => {
    switch(tripType) {
      case 'roundTrip':
        return 'Round';
      case 'oneWay':
        return 'One Way';
      case 'rental':
        return 'Rental';
      default:
        return 'One Way';
    }
  };

  // Helper function to calculate days
  const calculateDays = (bookingData) => {
    if (bookingData.days && bookingData.days > 0) {
      return parseInt(bookingData.days);
    }

    // Calculate days from dates if not provided
    if (bookingData.startDate && bookingData.returnDate) {
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.returnDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
      return diffDays;
    }

    return 1; // Default to 1 day
  };

  // Helper function to calculate subtotal
  const calculateSubtotal = (bookingData) => {
    const baseAmount = parseFloat(bookingData.baseAmount || bookingData.amount || 0);
    const driverBhata = parseFloat(bookingData.driverBhata || bookingData.driverBhatta || 0);
    const tollCharges = parseFloat(bookingData.tollCharges || 0);
    const parkingCharges = parseFloat(bookingData.parkingCharges || 0);

    return baseAmount + driverBhata + tollCharges + parkingCharges;
  };

  // Function to generate the HTML template
  const generateInvoiceHTML = (invoiceData) => {
    // Helper function to format dates within the template
    const formatDate = (dateString) => {
      if (!dateString || dateString === 'N/A') return 'N/A';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Helper function to get journey type display
    const getJourneyTypeDisplay = (data) => {
      switch(data.tripType) {
        case 'roundTrip':
          return `${data.days} Days Round Trip`;
        case 'rental':
          return `${data.days} Days Rental`;
        case 'oneWay':
        default:
          return 'One Way';
      }
    };





    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tax Invoice - ${invoiceData.bookid}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.3;
            font-size: 9pt;
            margin: 0;
            padding: 0;
            background-color: #fdfdfd;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 10px auto;
            padding: 20px;
            min-height: 100vh;
            border: 1px solid #eee;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
            overflow: visible;
        }

        /* Ensure all content fits within container */
        .container * {
            box-sizing: border-box;
            max-width: 100%;
        }

        /* PDF-specific styles */
        @media print {
            body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            .container {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 15px !important;
                border: none !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                overflow: visible !important;
            }

            /* Ensure tables don't overflow */
            table {
                width: 100% !important;
                table-layout: fixed !important;
            }

            /* Prevent text overflow */
            td, th {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
        }
        .invoice-header {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo {
            float: left;
            width: 30%;
            text-align: left;
        }
        .invoice-title {
            text-align: center;
            float: left;
            width: 40%;
            padding-top: 5px;
        }
        .invoice-info {
            float: right;
            width: 30%;
            text-align: right;
            padding-top: 5px;
        }
        .invoice-info p {
            margin: 3px 0;
        }
        .clearfix:after {
            content: "";
            display: table;
            clear: both;
        }
        .company-details {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        .client-details {
            float: left;
            width: 48%;
            padding: 2px;
        }
        .provider-details {
            float: right;
            width: 48%;
            text-align: right;
            padding: 2px;
        }
        .client-details h4,
        .provider-details h4 {
            color: #333;
            font-weight: bold;
        }
        .section-title {
            background-color: #4285f4;
            color: white;
            padding: 4px 8px;
            font-weight: bold;
            border-radius: 3px 3px 0 0;
            margin-bottom: 0;
            font-size: 10pt;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .invoice-table th,
        .invoice-table td {
            padding: 3px 6px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        .invoice-table th {
            background-color: #f1f1f1;
            text-align: left;
        }
        .invoice-table td {
            background-color: white;
        }
        .trip-details,
        .booking-details {
            margin-bottom: 8px;
        }
        .trip-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .trip-table th {
            background-color: #f1f1f1;
            border: 1px solid #ddd;
            padding: 3px 6px;
            text-align: left;
            font-size: 9pt;
            width: 33.33%;
        }
        .trip-table td {
            background-color: white;
            border: 1px solid #ddd;
            padding: 3px 6px;
            font-size: 9pt;
            width: 33.33%;
        }
        .subtotal-row {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .total-row {
            background-color: #f1f1f1;
            font-weight: bold;
        }
        .footer-container {
            margin-top: 4px;
            border-top: 1px solid #ddd;
            padding-top: 4px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .bank-details {
            float: left;
            width: 48%;
            padding: 2px;
        }
        .bank-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .bank-table th,
        .bank-table td {
            padding: 3px 6px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        .bank-table th {
            background-color: #f1f1f1;
            text-align: left;
            width: 40%;
        }
        .bank-table td {
            background-color: white;
            width: 60%;
        }
        .signature-section {
            float: right;
            width: 48%;
            text-align: right;
            padding: 2px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .terms-conditions {
            margin-top: 3px;
            margin-bottom: 6px;
            font-size: 9pt;
            clear: both;
        }
        .stamp-container {
            position: relative;
            height: 180px;
            margin-top: 0;
            text-align: right;
        }
        .stamp {
            position: relative;
            display: inline-block;
            margin-bottom: 10px;
        }
        .signature-text {
            margin-top: 5px;
            text-align: right;
            position: relative;
            z-index: 2;
        }
        .footer-note {
            clear: both;
            font-size: 7pt;
            padding-top: 4px;
        }
        hr.divider {
            height: 2px;
            background-color: #4285f4;
            border: none;
            margin: 0 0 12px 0;
        }
        h4 {
            margin: 4px 0;
            font-size: 10pt;
            font-weight: bold;
        }
        p {
            margin: 2px 0;
            line-height: 1.4;
        }
        strong {
            font-weight: bold;
        }
        .invoice-number {
            font-size: 11pt;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="invoice-header clearfix">
            <div class="logo">
                <img src="/images/wtlLogo.jpeg" height="60px" width="80px" alt="WTL Tourism Logo" style="margin: 0 auto; display: block; object-fit: contain;">
            </div>
            <div class="invoice-title">
                <h1 style="font-size: 30px; margin: 0; font-weight: bold;">TAX INVOICE</h1>
            </div>
            <div class="invoice-info">
                <p style="margin: 3px 0;"><strong>Date:</strong> ${formatDate(invoiceData.date)}</p>
                <p style="margin: 3px 0;">Invoice No: <span class="invoice-number">${invoiceData.bookid}</span></p>
            </div>
        </div>

        <hr class="divider">

        <!-- Company and Client Details -->
        <div class="company-details clearfix">
            <div class="client-details">
                <p style="margin: 2px 0;"><strong>Company Name:</strong> ${invoiceData.companyname || 'N/A'}</p>
                ${invoiceData.companyaddress ? `<p style="margin: 2px 0;"><strong>Company Address:</strong> ${invoiceData.companyaddress}</p>` : ''}
                <p style="margin: 2px 0;"><strong>Name:</strong> ${invoiceData.name}</p>
                <p style="margin: 2px 0;"><strong>Mobile:</strong> ${invoiceData.phone} | <strong>Email:</strong> ${invoiceData.email}</p>
                <p style="margin: 2px 0;"><strong>GSTIN:</strong> ${invoiceData.gstno || 'N/A'}</p>
            </div>
            <div class="provider-details">
                <p style="margin: 2px 0;"><strong>WTL Tourism Pvt. Ltd.</strong></p>
                <p style="margin: 2px 0;"><strong>Mobile:</strong> 9325578091</p>
                <p style="margin: 2px 0;"><strong>Email:</strong> contact@worldtriplink.com</p>
                <p style="margin: 2px 0;"><strong>GSTIN:</strong> 27AADCW8531C1ZD</p>
            </div>
        </div>

        <!-- Trip Details Section -->
        <div class="trip-details">
            <h3 class="section-title">TRIP DETAILS</h3>
            <table class="trip-table">
                <thead>
                    <tr>
                        <th>Pickup Location</th>
                        <th>Drop Location</th>
                        <th>Journey Type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoiceData.pickup}</td>
                        <td>${invoiceData.drop}</td>
                        <td>${getJourneyTypeDisplay(invoiceData)}</td>
                    </tr>
                    <tr>
                        <th>Distance (Km)</th>
                        <th>${invoiceData.tripType === 'roundTrip' ? 'Start Date' : 'Pickup Date'}</th>
                        <th>${invoiceData.tripType === 'roundTrip' ? 'Start Time' : 'Pickup Time'}</th>
                    </tr>
                    <tr>
                        <td>${invoiceData.distance}</td>
                        <td>${formatDate(invoiceData.date)}</td>
                        <td>${invoiceData.time}</td>
                    </tr>
                    ${invoiceData.tripType === 'roundTrip' ? `
                    <tr>
                        <th>End Date</th>
                        <th>End Time</th>
                        <th></th>
                    </tr>
                    <tr>
                        <td>${formatDate(invoiceData.dateend)}</td>
                        <td>${invoiceData.timeend}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>

        <!-- Booking Details Section -->
        <div class="booking-details">
            <h3 class="section-title">BOOKING DETAILS</h3>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th width="70%">Description</th>
                        <th width="30%">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Vehicle Type: ${invoiceData.car}</td>
                        <td>Rs.${invoiceData.amount}</td>
                    </tr>
                    ${invoiceData.trip === 'Round' && invoiceData.driver > 0 ? `
                    <tr>
                        <td>Driver Allowance</td>
                        <td>Rs.${invoiceData.driver}</td>
                    </tr>
                    ` : ''}
                    ${invoiceData.toll > 0 ? `
                    <tr>
                        <td>Toll Charges</td>
                        <td>Rs.${invoiceData.toll}</td>
                    </tr>
                    ` : ''}
                    ${invoiceData.parking > 0 ? `
                    <tr>
                        <td>Parking Charges</td>
                        <td>Rs.${invoiceData.parking}</td>
                    </tr>
                    ` : ''}
                    <tr class="subtotal-row">
                        <td>Subtotal</td>
                        <td>Rs.${invoiceData.new_amount}</td>
                    </tr>
                    <tr>
                        <td>Service Charge (10%)</td>
                        <td>Rs.${invoiceData.service}</td>
                    </tr>
                    <tr>
                        <td>GST Tax (5%)</td>
                        <td>Rs.${invoiceData.gst}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Paid Amount</td>
                        <td>Rs.${invoiceData.totalpaidAmt}</td>
                    </tr>
                    ${invoiceData.new_amount !== invoiceData.totalpaidAmt ? `
                    <tr>
                        <td>Remaining Amount</td>
                        <td>Rs.${invoiceData.remainAmt}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-conditions">
            <h3 class="section-title">TERMS AND CONDITIONS</h3>
            <p style="margin: 2px 0; line-height: 1.2;">1. Extra Kilometer charges applicable beyond agreed distance. Toll, Parking and other charges additional as per actuals.</p>
            <p style="margin: 2px 0; line-height: 1.2;">2. Payment to be made in full before trip starts. Cancellation should be intimated 2 hours in advance for refund eligibility.</p>
        </div>

        <!-- Footer with Bank Details and Signature -->
        <div class="footer-container clearfix">
            <!-- Bank Details Section (Left Side) -->
            <div class="bank-details">
                <h3 class="section-title">BANK DETAILS</h3>
                <table class="bank-table">
                    <tr>
                        <th>Account Name</th>
                        <td>WTL Tourism Private Limited</td>
                    </tr>
                    <tr>
                        <th>Bank Name</th>
                        <td>AU Small Finance Bank Limited</td>
                    </tr>
                    <tr>
                        <th>Account Number</th>
                        <td>2402262260634299</td>
                    </tr>
                    <tr>
                        <th>IFSC CODE</th>
                        <td>AUBL0002622</td>
                    </tr>
                    <tr>
                        <th>Branch Name</th>
                        <td>Magarpatta</td>
                    </tr>
                </table>
            </div>

            <!-- Signature Section (Right Side) -->
            <div class="signature-section">
                <div class="stamp-container">
                    <img src="/images/wtl-stamp.png" height="180px" width="200px" alt="WTL Tourism Stamp" class="stamp"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                         style="object-fit: contain; max-width: 200px; max-height: 180px; position: absolute;top: 26px;">
                    <div style="display:none; text-align:center; padding:20px; border:2px solid #1a237e; border-radius:50%; width:180px; height:180px; line-height:20px;">
                        <strong style="color:#1a237e;">WTL TOURISM<br>PUNE<br>PVT LTD</strong><br>
                        <small>Authorized Signature</small>
                    </div>
                </div>
                <p style="position: relative;right: -164px;"><strong>WTL Tourism Pvt. Ltd.</strong></p>
            </div>

            <!-- Footer Note -->
            <div class="footer-note">
                ${invoiceData.toll === 0 && invoiceData.parking === 0 ? '<p><strong>Note: </strong>This is a computer-generated invoice. Toll, Parking and Extra KM charges will be as per the receipt.</p>' : ''}
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - fixed and not scrollable */}
      <Navbar className="flex-shrink-0" />
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-6">
          {/* Header Section */}
          <div className="bg-gray-100 p-4 flex items-center justify-between rounded-lg shadow">
            <h2 className="font-semibold text-lg flex items-center">
              <span className="mr-2">🚖</span> Custom Bookings
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="border p-2 rounded-md bg-black hover:bg-gray-800 text-white transition duration-300"
            >
              <FaPlus className="text-white" />
            </button>
          </div>

          {/* Filter Options */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="text-gray-700">Filter by Trip Type:</label>
            <select
              value={filterTrip}
              onChange={(e) => setFilterTrip(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Bookings</option>
              <option value="oneWay">One Way</option>
              <option value="roundTrip">Round Trip</option>
            </select>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Booking Form */}
          {isFormOpen && (
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 shadow-2xl rounded-2xl mt-6 border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Custom Booking
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    // Reset form when closing
                    setUserPickUp("");
                    setUserDrop("");
                    setDistance("");
                    setDuration("");
                    setDistanceError("");
                    setName("");
                    setEmail("");
                    setPhone("");
                    setCompanyName("");
                    setStartDate("");
                    setTime("");
                    setReturnDate("");
                    setAmount("");
                    setCollection("0");
                    setTripType("oneWay");
                    setPricingData(null);
                    setPricingError("");
                    setPackageName("4hrs/40km");
                    setIncludeDriverBhatta(false);
                    setIncludeServiceCharge(false);
                    setIncludeGST(false);
                    setDriverBhata(0);
                    setServiceCharge(0);
                    setGst(0);
                    setBaseAmount(0);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                >
                  <FaTimes size={22} />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Type */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Trip Type
                  </label>
                  <div className="flex items-center space-x-6">
                    {["oneWay", "roundTrip", "rental"].map((type) => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="tripType"
                          value={type}
                          checked={tripType === type}
                          onChange={() => handleTripTypeChange(type)}
                          className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                          {type === "oneWay" ? "One Way" : type === "roundTrip" ? "Round Trip" : "Rental"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
            
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
            
                {/* Trip Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Location
                      </label>
                      <input
                        ref={pickupRef}
                        type="text"
                        placeholder="Enter pickup location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userPickup}
                        onChange={(e) => {
                          setUserPickUp(e.target.value);
                          // Clear distance when manually typing
                          if (distance) {
                            setDistance('');
                            setDuration('');
                          }
                          // Clear pricing data when location changes
                          setPricingData(null);
                          setPricingError('');
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Drop Location
                      </label>
                      <input
                        ref={dropRef}
                        type="text"
                        placeholder="Enter drop location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userDrop}
                        onChange={(e) => {
                          setUserDrop(e.target.value);
                          // Clear distance when manually typing
                          if (distance) {
                            setDistance('');
                            setDuration('');
                          }
                          // Clear pricing data when location changes
                          setPricingData(null);
                          setPricingError('');
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Fetch Pricing Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (userPickup && userDrop) {
                          calculateDistance();
                        } else {
                          setDistanceError('Please enter both pickup and drop locations');
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Calculate Distance & Get Pricing
                    </button>
                  </div>

                  {/* Distance Display */}
                  {(distance || duration || loadingDistance || distanceError) && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">📍</span>
                        Distance Information
                      </h4>
                      
                      {loadingDistance && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-600">Calculating distance...</span>
                        </div>
                      )}

                      {distanceError && (
                        <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                          <span className="font-medium">⚠️ Error:</span> {distanceError}
                        </div>
                      )}

                      {distance && duration && !loadingDistance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">🛣️ Distance</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {pricingData?.distance ? `${pricingData.distance} km` : distance || 'Calculating...'}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-md shadow-sm border border-green-100">
                            <div className="text-sm text-gray-600 mb-1">⏱️ Estimated Time</div>
                            <div className="text-2xl font-bold text-green-600">{duration}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Display */}
                  {(loadingPricing || pricingData || pricingError) && (
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">💰</span>
                        Pricing Information
                      </h4>

                      {loadingPricing && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="text-green-600">Fetching pricing...</span>
                        </div>
                      )}

                      {pricingError && (
                        <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                          <span className="font-medium">⚠️ Error:</span> {pricingError}
                        </div>
                      )}

                      {pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0 && !loadingPricing && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-md shadow-sm border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">🚗 Hatchback</div>
                            <div className="text-xl font-bold text-blue-600">₹{pricingData.tripinfo[0].hatchback}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">🚙 Sedan</div>
                            <div className="text-xl font-bold text-blue-600">₹{pricingData.tripinfo[0].sedan}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm border border-purple-100">
                            <div className="text-sm text-gray-600 mb-1">🚙 Sedan Premium</div>
                            <div className="text-xl font-bold text-purple-600">₹{pricingData.tripinfo[0].sedanpremium}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                            <div className="text-sm text-gray-600 mb-1">🚐 SUV</div>
                            <div className="text-xl font-bold text-green-600">₹{pricingData.tripinfo[0].suv}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                            <div className="text-sm text-gray-600 mb-1">🚐 SUV Plus</div>
                            <div className="text-xl font-bold text-green-600">₹{pricingData.tripinfo[0].suvplus}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm border border-orange-100">
                            <div className="text-sm text-gray-600 mb-1">🚌 Ertiga</div>
                            <div className="text-xl font-bold text-orange-600">₹{pricingData.tripinfo[0].ertiga}</div>
                          </div>
                        </div>
                      )}

                      {pricingData && pricingData.selectedPackage && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                          <span className="font-medium text-blue-800">📦 Package:</span>
                          <span className="text-blue-700 ml-2">{pricingData.selectedPackage}</span>
                        </div>
                      )}

                      {pricingData && pricingData.estimatedTravelTime && (
                        <div className="mt-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                          <span className="font-medium text-yellow-800">⏱️ Estimated Travel Time:</span>
                          <span className="text-yellow-700 ml-2">{pricingData.estimatedTravelTime}</span>
                        </div>
                      )}

                      {/* Pricing Analysis for Round Trip */}
                      {pricingData && tripType === 'roundTrip' && (
                        <div className="mt-4 bg-orange-50 p-4 rounded-md border border-orange-200">
                          <div className="text-sm font-medium text-orange-800 mb-2">📊 Round Trip Pricing Analysis</div>
                          <div className="text-xs text-orange-700 space-y-1">
                            <div><strong>Distance:</strong> {pricingData?.distance || 'N/A'} km</div>
                            <div><strong>Days:</strong> {pricingData?.days || 'N/A'}</div>
                            <div><strong>Expected Rate per km:</strong> ~₹10-15 for sedan</div>
                            <div><strong>Expected Total:</strong> ~₹{pricingData?.distance ? (pricingData.distance * 12).toLocaleString() : 'N/A'} (approx)</div>
                            <div><strong>Actual Sedan Price:</strong> ₹{pricingData?.tripinfo?.[0]?.sedan?.toLocaleString() || 'N/A'}</div>
                            <div className="mt-2 p-2 bg-orange-100 rounded">
                              <strong>Analysis:</strong> {
                                pricingData?.distance && pricingData?.tripinfo?.[0]?.sedan && pricingData.tripinfo[0].sedan < (pricingData.distance * 10)
                                  ? "⚠️ Price seems low for this distance. Please verify backend calculation."
                                  : pricingData?.distance
                                    ? "✅ Price appears reasonable for this distance."
                                    : "⚠️ Distance data not available for analysis."
                              }
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Debug info - show what parameters will be sent */}
                      {userPickup && userDrop && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">📋 API Request Preview:</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="mb-2">
                              <strong>URL:</strong>
                              <div className="bg-white p-2 rounded border mt-1 font-mono text-xs break-all">
                                {`http://localhost:8085/api/cab1?tripType=${tripType}&pickupLocation=${encodeURIComponent(userPickup)}&dropLocation=${encodeURIComponent(userDrop)}&date=${startDate || new Date().toISOString().split('T')[0]}&time=${time || '10:00'}${distance ? `&distance=${distance.replace(/[^0-9.]/g, '')}` : ''}${tripType === 'roundTrip' && returnDate ? `&Returndate=${returnDate}` : ''}${tripType === 'rental' && packageName ? `&packageName=${packageName}` : ''}`}
                              </div>
                            </div>
                            <div><strong>Method:</strong> GET</div>
                            <div><strong>Parameters:</strong></div>
                            <div className="ml-4 space-y-1">
                              <div>• tripType: {tripType}</div>
                              <div>• pickupLocation: {userPickup}</div>
                              <div>• dropLocation: {userDrop}</div>
                              <div>• date: {startDate || 'Current date'}</div>
                              <div>• time: {time || '10:00'}</div>
                              {distance && <div>• distance: {distance.replace(/[^0-9.]/g, '')}</div>}
                              {tripType === 'roundTrip' && <div>• Returndate: {returnDate || 'Not set'}</div>}
                              {tripType === 'rental' && <div>• packageName: {packageName}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                    {tripType === "roundTrip" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Package Selection for Rental Trips */}
                    {tripType === "rental" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Package Type
                        </label>
                        <select
                          value={packageName}
                          onChange={(e) => handlePackageChange(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white"
                        >
                          <option value="4hrs/40km">4hrs/40km Package</option>
                          <option value="8hrs/80km">8hrs/80km Package</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Car Type
                      </label>
                      <select
                        value={car}
                        onChange={(e) => {
                          setCar(e.target.value);
                          // Auto-populate amount based on selected car type
                          if (pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0) {
                            const tripInfo = pricingData.tripinfo[0];
                            let price = 0;
                            switch(e.target.value) {
                              case 'Hatchback':
                                price = tripInfo.hatchback;
                                break;
                              case 'Sedan':
                                price = tripInfo.sedan;
                                break;
                              case 'SedanPremium':
                                price = tripInfo.sedanpremium;
                                break;
                              case 'SUV':
                                price = tripInfo.suv;
                                break;
                              case 'SUVPlus':
                                price = tripInfo.suvplus;
                                break;
                              case 'Ertiga':
                                price = tripInfo.ertiga;
                                break;
                              default:
                                price = 0;
                            }
                            // Calculate total with all charges
                            const totalData = calculateTotalAmount(price);

                            // Update individual state variables
                            setBaseAmount(price);
                            setDriverBhata(totalData.breakdown.driverBhata);
                            setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                            setGst(Math.round(totalData.breakdown.gst));
                            setAmount(totalData.total.toString());
                          }
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white"
                      >
                        {pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0 ? (
                          <>
                            <option value="Hatchback">
                              Hatchback - ₹{pricingData.tripinfo[0].hatchback || 'N/A'}
                            </option>
                            <option value="Sedan">
                              Sedan - ₹{pricingData.tripinfo[0].sedan || 'N/A'}
                            </option>
                            <option value="SedanPremium">
                              Sedan Premium - ₹{pricingData.tripinfo[0].sedanpremium || 'N/A'}
                            </option>
                            <option value="SUV">
                              SUV - ₹{pricingData.tripinfo[0].suv || 'N/A'}
                            </option>
                            <option value="SUVPlus">
                              SUV Plus - ₹{pricingData.tripinfo[0].suvplus || 'N/A'}
                            </option>
                            <option value="Ertiga">
                              Ertiga - ₹{pricingData.tripinfo[0].ertiga || 'N/A'}
                            </option>
                          </>
                        ) : (
                          <>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SedanPremium">Sedan Premium</option>
                            <option value="SUV">SUV</option>
                            <option value="SUVPlus">SUV Plus</option>
                            <option value="Ertiga">Ertiga</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Charges */}
                {pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      Additional Charges
                    </h3>

                    <div className="space-y-4">
                      {/* Driver Bhatta Toggle */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-lg font-medium text-gray-800">🚗 Driver Bhatta</span>
                            {pricingData?.days && (
                              <span className="ml-2 text-sm text-gray-600">
                                (₹300 × {pricingData.days} days = ₹{300 * pricingData.days})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Daily allowance for driver accommodation and meals
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={includeDriverBhatta}
                            onChange={(e) => setIncludeDriverBhatta(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Service Charge Toggle */}
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-lg font-medium text-gray-800">💼 Service Charge</span>
                            <span className="ml-2 text-sm text-gray-600">(10% of base price)</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Service fee for booking and customer support
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={includeServiceCharge}
                            onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      {/* GST Toggle */}
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-lg font-medium text-gray-800">📋 GST</span>
                            <span className="ml-2 text-sm text-gray-600">(5% of base price)</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Goods and Services Tax as per government regulations
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={includeGST}
                            onChange={(e) => setIncludeGST(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {car && pricingData?.tripinfo && pricingData.tripinfo.length > 0 && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">💰 Price Breakdown</h4>
                        {(() => {
                          const tripInfo = pricingData.tripinfo[0];
                          let basePrice = 0;
                          switch(car) {
                            case 'Hatchback': basePrice = tripInfo.hatchback; break;
                            case 'Sedan': basePrice = tripInfo.sedan; break;
                            case 'SedanPremium': basePrice = tripInfo.sedanpremium; break;
                            case 'SUV': basePrice = tripInfo.suv; break;
                            case 'SUVPlus': basePrice = tripInfo.suvplus; break;
                            case 'Ertiga': basePrice = tripInfo.ertiga; break;
                            default: basePrice = tripInfo.sedan;
                          }
                          const totalData = calculateTotalAmount(basePrice);
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Base Price ({car}):</span>
                                <span className="font-medium">₹{basePrice.toLocaleString()}</span>
                              </div>
                              {includeDriverBhatta && pricingData?.days && (
                                <div className="flex justify-between text-blue-700">
                                  <span>Driver Bhata ({pricingData.days} days):</span>
                                  <span className="font-medium">₹{totalData.breakdown.driverBhata.toLocaleString()}</span>
                                </div>
                              )}
                              {includeServiceCharge && (
                                <div className="flex justify-between text-green-700">
                                  <span>Service Charge (10%):</span>
                                  <span className="font-medium">₹{Math.round(totalData.breakdown.serviceCharge).toLocaleString()}</span>
                                </div>
                              )}
                              {includeGST && (
                                <div className="flex justify-between text-yellow-700">
                                  <span>GST (5%):</span>
                                  <span className="font-medium">₹{Math.round(totalData.breakdown.gst).toLocaleString()}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-800">
                                <span>Vendor Amount:</span>
                                <span>₹{totalData.total.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Financial Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vendor Amount
                        <span className="text-xs text-green-600 ml-2">(Auto-calculated)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Select car type to see amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Amount includes base price + selected additional charges
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                       Cash Collection
                      </label>
                      <input
                        type="number"
                        placeholder="Enter collection amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
            
                {/* Submit Button */}
                <div className="pt-4">
                  {/* Pricing Status Indicator */}
                  {pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0 && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-800">
                        <span className="mr-2">✅</span>
                        <span className="font-medium">Pricing calculated successfully!</span>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        Distance: {pricingData?.distance || 'N/A'} km | Selected: {car} - ₹{amount}
                        {pricingData?.days && <span> | Days: {pricingData.days}</span>}
                      </div>
                    </div>
                  )}

                  {!pricingData && (
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center text-yellow-800">
                        <span className="mr-2">⚠️</span>
                        <span className="font-medium">Please calculate pricing first</span>
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        Enter pickup/drop locations and click "Calculate Distance & Get Pricing"
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!pricingData || !pricingData.tripinfo || pricingData.tripinfo.length === 0}
                    className={`w-full font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
                      pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-[1.02] focus:ring-blue-300'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {pricingData && pricingData.tripinfo && pricingData.tripinfo.length > 0
                      ? 'Create Booking'
                      : 'Calculate Pricing First'
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Custom Bookings Overview
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Booking ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      PickUp Location
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Drop Location
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Date/Time
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Trip Type
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Car Type
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Return Date
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Collection
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Delete
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Invoice
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                       <span className="mr-3">{row.bookingId}</span>
                       <br/>
  <span className="font-bold">Name : {row.name}</span> <br/>
  <span className="font-bold">Email : {row.email}</span> <br/>
  <span className="font-bold">Phone : {row.phone}</span>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.userPickup}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.userDrop}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.startDate} {row.time}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.tripType
        ? row.tripType
            .replace(/[- ]/g, "") // Remove hyphens and spaces
            .replace(/^./, (match) => match.toUpperCase()) // Capitalize the first letter
        : ""}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.car}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.startDate}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.returnDate || "N/A"}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.amount}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.collection}
                      </td>
                      <td className=" p-2">
                        <span
                          className={`px-2 py-1 rounded ${
                            row.status === 0
                              ? "bg-yellow-500" // Pending
                              : row.status === 1
                              ? "bg-blue-500" // Ongoing
                              : row.status === 2
                              ? "bg-green-500" // Completed
                              : row.status === 3
                              ? "bg-red-500" // Cancelled
                              : "bg-gray-500" // Default color for invalid or undefined status
                          } text-white`}
                        >
                          {row.status === 0
                            ? "Pending"
                            : row.status === 1
                            ? "Ongoing"
                            : row.status === 2
                            ? "Completed"
                            : row.status === 3
                            ? "Cancelled"
                            : "Unknown"}
                        </span>
                      </td>

                      <td className="p-2 text-center">
                        <button
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                          onClick={() => deleteBooking(row.id)}
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                      <td className=" p-2 text-center">
                        <button
                          className={`${generatingInvoice && row.id === currentInvoiceId ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-1 rounded`}
                          onClick={() => generateInvoice(row.id)}
                          disabled={generatingInvoice && row.id === currentInvoiceId}
                        >
                          {generatingInvoice && row.id === currentInvoiceId ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : "Invoice"}
                        </button>
                      </td>
                      <td className=" p-2 text-center">
                        <button
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                          onClick={() =>
                            router.push(`/online/online-booking/vendor/${row.id}`)
                          }
                        >
                          Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No custom bookings found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;