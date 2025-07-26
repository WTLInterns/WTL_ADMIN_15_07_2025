"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { X, User, Phone, Mail, Calendar, MapPin, Clock, Truck, UserCheck, Check } from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  adress: string;
  otherDetails: string;
  aadhaNo: string;
  drLicenseNo: string;
  pvcNo2: string;
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

// type MultiDateAssignmentResponse = {
//   overallSuccess: boolean;
//   message?: string;
// };

// ============================================================================
// VENDOR ASSIGNMENT MODAL COMPONENT
// ============================================================================

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  loading: boolean;
  onAssign: (vendorId: number) => void;
  assigningVendor: number | null;
  currentVendor?: Vendor | null;
}

const VendorAssignmentModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  vendors,
  loading,
  onAssign,
  assigningVendor,
  currentVendor
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {currentVendor ? 'Reassign Vendor' : 'Assign Vendor'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentVendor && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Currently Assigned Vendor
              </h4>
              <p className="text-blue-700 font-medium">{currentVendor.vendorCompanyName}</p>
              <p className="text-blue-600 text-sm">{currentVendor.vendorEmail} • {currentVendor.contactNo}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading vendors...</div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg">No vendors available</div>
              <div className="text-gray-400 text-sm mt-2">Please contact admin to add vendors</div>
            </div>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{vendor.vendorCompanyName}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>{vendor.vendorEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{vendor.contactNo}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onAssign(vendor.id)}
                      disabled={assigningVendor === vendor.id}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      {assigningVendor === vendor.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DRIVER ASSIGNMENT MODAL COMPONENT
// ============================================================================

interface AdminDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: AdminDriver[];
  loading: boolean;
  onAssign: (driverId: number) => void;
  assigningDriver: number | null;
  currentDriver?: AdminDriver | null;
}

const AdminDriverAssignmentModal: React.FC<AdminDriverModalProps> = ({
  isOpen,
  onClose,
  drivers,
  loading,
  onAssign,
  assigningDriver,
  currentDriver
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            {currentDriver ? 'Reassign Admin Driver' : 'Assign Admin Driver'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentDriver && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Currently Assigned Admin Driver
              </h4>
              <p className="text-green-700 font-medium">{currentDriver.driverName}</p>
              <p className="text-green-600 text-sm">{currentDriver.emailId} • {currentDriver.contactNo}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading drivers...</div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg">No admin drivers available</div>
              <div className="text-gray-400 text-sm mt-2">Please contact admin to add drivers</div>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{driver.driverName}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="truncate">{driver.emailId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{driver.contactNo}</span>
                        </div>
                        {driver.drLicenseNo && (
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <span className="font-medium text-gray-700">License:</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{driver.drLicenseNo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAssign(driver.id)}
                      disabled={assigningDriver === driver.id}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      {assigningDriver === driver.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN CAB ASSIGNMENT MODAL COMPONENT
// ============================================================================

interface AdminCabModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabs: AdminCab[];
  loading: boolean;
  onAssign: (cabId: number) => void;
  assigningCab: number | null;
  currentCab?: AdminCab | null;
}

const AdminCabAssignmentModal: React.FC<AdminCabModalProps> = ({
  isOpen,
  onClose,
  cabs,
  loading,
  onAssign,
  assigningCab,
  currentCab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {currentCab ? 'Reassign Admin Cab' : 'Assign Admin Cab'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentCab && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Currently Assigned Admin Cab
              </h4>
              <p className="text-purple-700 font-medium">{currentCab.vehicleNameAndRegNo}</p>
              <p className="text-purple-600 text-sm">RC: {currentCab.vehicleRcNo} • Status: {currentCab.status}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Loading cabs...</div>
            </div>
          ) : cabs.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg">No admin cabs available</div>
              <div className="text-gray-400 text-sm mt-2">Please contact admin to add cabs</div>
            </div>
          ) : (
            <div className="space-y-4">
              {cabs.map((cab) => (
                <div key={cab.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{cab.vehicleNameAndRegNo}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">RC No:</span>
                          <span>{cab.vehicleRcNo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cab.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cab.status}
                          </span>
                        </div>
                        {cab.carOtherDetails && (
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <span className="font-medium text-gray-700">Details:</span>
                            <span className="text-gray-600">{cab.carOtherDetails}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAssign(cab.id)}
                      disabled={assigningCab === cab.id}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                    
                      {assigningCab === cab.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN BOOKING DETAIL COMPONENT
// ============================================================================

export default function BookingDetailPage() {
  const params = useParams();
  
  // Main state
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showAdminDriverModal, setShowAdminDriverModal] = useState(false);
  const [showAdminCabModal, setShowAdminCabModal] = useState(false);

  // Vendor/Driver/Cab data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [adminDrivers, setAdminDrivers] = useState<AdminDriver[]>([]);
  const [adminCabs, setAdminCabs] = useState<AdminCab[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingAdminDrivers, setLoadingAdminDrivers] = useState(false);
  const [loadingAdminCabs, setLoadingAdminCabs] = useState(false);

  // Assignment loading states
  const [assigningVendor, setAssigningVendor] = useState<number | null>(null);
  const [assigningAdminDriver, setAssigningAdminDriver] = useState<number | null>(null);
  const [assigningAdminCab, setAssigningAdminCab] = useState<number | null>(null);

  // Note: Reassignment is allowed for all resources

  // ============================================================================
  // CHECK ALREADY ASSIGNED FUNCTIONS
  // ============================================================================

  const checkAndShowVendorModal = () => {
    // Always allow opening the modal - user can reassign to a different vendor
    setShowVendorModal(true);
    fetchVendors();
  };

  const checkAndShowAdminDriverModal = () => {
    // Always allow opening the modal - user can reassign to a different admin driver
    setShowAdminDriverModal(true);
    fetchAdminDrivers();
  };

  const checkAndShowAdminCabModal = () => {
    // Always allow opening the modal - user can reassign to a different admin cab
    setShowAdminCabModal(true);
    fetchAdminCabs();
  };

  // ============================================================================
  // FETCH BOOKING DATA
  // ============================================================================

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        // Try the specific booking endpoint first
        const response = await fetch(` http://localhost:8081/schedule/getId/${params.id}`);
        if (response.ok) {
          const booking = await response.json();
          setBooking(booking);
        } else {
          // Fallback to getting all bookings and finding the specific one
          const allBookingsResponse = await fetch(" http://localhost:8081/schedule/getAllBookings");
          if (!allBookingsResponse.ok) throw new Error("Failed to fetch booking");

          const bookings = await allBookingsResponse.json();
          const foundBooking = bookings.find((b: Booking) => b.id === parseInt(params.id as string));

          if (!foundBooking) {
            setError("Booking not found");
          } else {
            setBooking(foundBooking);
          }
        }
      } catch (err) {
        setError("Could not load booking details");
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  // ============================================================================
  // FETCH VENDORS
  // ============================================================================

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await fetch(" http://localhost:8085/vendors/allVendors");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      const vendorData = await response.json();
      setVendors(vendorData);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      alert("Failed to load vendors. Please try again.");
    } finally {
      setLoadingVendors(false);
    }
  };

  // ============================================================================
  // FETCH ADMIN DRIVERS
  // ============================================================================

  const fetchAdminDrivers = async () => {
    try {
      setLoadingAdminDrivers(true);
      const response = await fetch(" http://localhost:8085/driverAdmin/all");
      if (!response.ok) throw new Error("Failed to fetch admin drivers");
      const driverData = await response.json();
      setAdminDrivers(driverData);
    } catch (err) {
      console.error("Error fetching admin drivers:", err);
      alert("Failed to load admin drivers. Please try again.");
    } finally {
      setLoadingAdminDrivers(false);
    }
  };

  // ============================================================================
  // FETCH ADMIN CABS
  // ============================================================================

  const fetchAdminCabs = async () => {
    try {
      setLoadingAdminCabs(true);
      const response = await fetch(" http://localhost:8085/cabAdmin/all");
      if (!response.ok) throw new Error("Failed to fetch admin cabs");
      const cabData = await response.json();
      setAdminCabs(cabData);
    } catch (err) {
      console.error("Error fetching admin cabs:", err);
      alert("Failed to load admin cabs. Please try again.");
    } finally {
      setLoadingAdminCabs(false);
    }
  };

  // ============================================================================
  // ASSIGN VENDOR
  // ============================================================================

  const assignVendor = async (vendorId: number) => {
    if (!booking) return;
    
    try {
      setAssigningVendor(vendorId);
      const response = await fetch(
        ` http://localhost:8081/schedule/${booking.id}/assign-vendor/${vendorId}`,
        { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign vendor: ${errorText}`);
      }
      
      const updatedBooking = await response.json();
      setBooking(updatedBooking);
      setShowVendorModal(false);
      
      // Success notification
      alert("Vendor assigned successfully!");
      
    } catch (err) {
      console.error("Error assigning vendor:", err);
      alert(`Failed to assign vendor: ${err instanceof Error ? err.message : 'Please try again'}`);
    } finally {
      setAssigningVendor(null);
    }
  };

  // ============================================================================
  // ASSIGN ADMIN DRIVER
  // ============================================================================

  const assignAdminDriver = async (driverId: number) => {
    if (!booking) return;

    try {
      setAssigningAdminDriver(driverId);
      const response = await fetch(
        ` http://localhost:8085/${booking.id}/assignDriveAdmin/${driverId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign admin driver: ${errorText}`);
      }

      // Refresh booking data to get updated info
      const bookingResponse = await fetch(` http://localhost:8081/schedule/getId/${booking.id}`);
      if (bookingResponse.ok) {
        const updatedBooking = await bookingResponse.json();
        setBooking(updatedBooking);
      }

      setShowAdminDriverModal(false);
      alert("Admin driver assigned successfully!");

    } catch (err) {
      console.error("Error assigning admin driver:", err);
      alert(`Failed to assign admin driver: ${err instanceof Error ? err.message : 'Please try again'}`);
    } finally {
      setAssigningAdminDriver(null);
    }
  };

  // ============================================================================
  // ASSIGN ADMIN CAB
  // ============================================================================

  const assignAdminCab = async (cabId: number) => {
    if (!booking) return;

    try {
      setAssigningAdminCab(cabId);
      const response = await fetch(
        ` http://localhost:8085/${booking.id}/assignCabAdmin/${cabId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign admin cab: ${errorText}`);
      }

      // Refresh booking data to get updated info
      const bookingResponse = await fetch(` http://localhost:8081/schedule/getId/${booking.id}`);
      if (bookingResponse.ok) {
        const updatedBooking = await bookingResponse.json();
        setBooking(updatedBooking);
      }

      setShowAdminCabModal(false);
      alert("Admin cab assigned successfully!");

    } catch (err) {
      console.error("Error assigning admin cab:", err);
      alert(`Failed to assign admin cab: ${err instanceof Error ? err.message : 'Please try again'}`);
    } finally {
      setAssigningAdminCab(null);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading booking details...</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-xl text-red-500 mb-4">{error || "Booking not found"}</div>
          <Link href="/ets" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <Link 
              href="/ets" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Back to All Bookings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Booking Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              Booking ID: {booking.bookingId}
            </h2>
            <p className="text-sm text-blue-600 mt-1">Internal ID: {booking.id}</p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Location Details
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Pick Up Location</label>
                    <p className="text-gray-900 font-medium">{booking.pickUpLocation}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Drop Location</label>
                    <p className="text-gray-900 font-medium">{booking.dropLocation}</p>
                  </div>
                </div>
              </div>

              {/* Time Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Time Details
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Departure Time</label>
                    <p className="text-gray-900 font-medium">{booking.time}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Return Time</label>
                    <p className="text-gray-900 font-medium">{booking.returnTime}</p>
                  </div>
                  {booking.shiftTime && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Shift Time</label>
                      <p className="text-gray-900 font-medium">{booking.shiftTime}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Booking Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Booking Type</label>
                    <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {booking.bookingType}
                    </span>
                  </div>
                  {booking.dateOfList && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date of List</label>
                      <p className="text-gray-900 font-medium">{booking.dateOfList}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Customer Details
                </h3>
                {booking.user ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{booking.user.userName} {booking.user.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{booking.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{booking.user.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Gender</label>
                      <p className="text-gray-900">{booking.user.gender}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium">⚠️ Customer information not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Buttons Section */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  Assignment Control Center
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Assign Vendor Button */}
                  <div className="relative group">
                    <button
                      onClick={checkAndShowVendorModal}
                      className="w-full p-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center gap-4 font-semibold text-lg shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200"
                    >
                      <div className="p-4 rounded-full bg-white bg-opacity-20">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <div>{booking.vendor ? 'Reassign Vendor' : 'Assign Vendor'}</div>
                        <div className="text-sm opacity-80 mt-1">External Partner</div>
                      </div>
                      {booking.vendor && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Assign Admin Driver Button */}
                  <div className="relative group">
                    <button
                      onClick={checkAndShowAdminDriverModal}
                      className="w-full p-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center gap-4 font-semibold text-lg shadow-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200"
                    >
                      <div className="p-4 rounded-full bg-white bg-opacity-20">
                        <User className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <div>{booking.driverAdmin ? 'Reassign Admin Driver' : 'Assign Admin Driver'}</div>
                        <div className="text-sm opacity-80 mt-1">Internal Driver</div>
                      </div>
                      {booking.driverAdmin && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Assign Admin Cab Button */}
                  <div className="relative group">
                    <button
                      onClick={checkAndShowAdminCabModal}
                      className="w-full p-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center gap-4 font-semibold text-lg shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-200"
                    >
                      <div className="p-4 rounded-full bg-white bg-opacity-20">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <div>{booking.cabAdmin ? 'Reassign Admin Cab' : 'Assign Admin Cab'}</div>
                        <div className="text-sm opacity-80 mt-1">Internal Vehicle</div>
                      </div>
                      {booking.cabAdmin && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Assignment Status Summary */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-700">Assignment Status:</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className={`flex items-center gap-1 ${booking.vendor ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${booking.vendor ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Vendor {booking.vendor ? 'Assigned' : 'Pending'}
                      </div>
                      <div className={`flex items-center gap-1 ${booking.driverAdmin ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${booking.driverAdmin ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Admin Driver {booking.driverAdmin ? 'Assigned' : 'Pending'}
                      </div>
                      <div className={`flex items-center gap-1 ${booking.cabAdmin ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${booking.cabAdmin ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Admin Cab {booking.cabAdmin ? 'Assigned' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* Assignment Details Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                Assignment Details
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Vendor Details - Show only if vendor is assigned */}
                {booking.vendor && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-800 text-lg">Vendor Details</h4>
                          <p className="text-blue-600 text-sm">External Partner</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-700 text-sm">Successfully Assigned</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company Name</label>
                          <p className="text-gray-900 font-semibold text-lg">{booking.vendor.vendorCompanyName}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Email</label>
                              <p className="text-gray-900 font-medium">{booking.vendor.vendorEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Contact</label>
                              <p className="text-gray-900 font-medium">{booking.vendor.contactNo}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vendor Driver Details */}
                      {booking.vendorDriver && (
                        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-blue-800">Vendor Driver</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Driver Name</label>
                              <p className="text-gray-900 font-semibold">{booking.vendorDriver.driverName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-blue-500" />
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Email</label>
                                  <p className="text-gray-900 text-sm">{booking.vendorDriver.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-green-500" />
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Phone</label>
                                  <p className="text-gray-900 text-sm">{booking.vendorDriver.contactNo}</p>
                                </div>
                              </div>
                            </div>
                            {booking.vendorDriver.licenseNumber && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">License Number</label>
                                <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                  {booking.vendorDriver.licenseNumber}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Vendor Cab Details */}
                      {booking.vendorCab && (
                        <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-indigo-800">Vendor Cab</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Vehicle Name/Reg No</label>
                              <p className="text-gray-900 font-semibold">{booking.vendorCab.vehicleNameAndRegNo}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500">RC Number</label>
                                <p className="text-gray-900 text-sm">{booking.vendorCab.vehicleRcNo}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Status</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  booking.vendorCab.status === 'AVAILABLE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {booking.vendorCab.status}
                                </span>
                              </div>
                            </div>
                            {booking.vendorCab.carOtherDetails && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Other Details</label>
                                <p className="text-gray-900 text-sm">{booking.vendorCab.carOtherDetails}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Admin Driver Details - Show only if admin driver is assigned */}
              {booking.driverAdmin && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 text-lg">Admin Driver</h4>
                        <p className="text-green-600 text-sm">Internal Driver</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-700 text-sm">Successfully Assigned</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Driver Name</label>
                        <p className="text-gray-900 font-semibold text-lg">{booking.driverAdmin.driverName}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-500" />
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Email</label>
                            <p className="text-gray-900 font-medium">{booking.driverAdmin.emailId}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Primary Phone</label>
                              <p className="text-gray-900 font-medium">{booking.driverAdmin.contactNo}</p>
                            </div>
                          </div>
                          {booking.driverAdmin.altMobNum && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-500" />
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Alternate Phone</label>
                                <p className="text-gray-900 font-medium">{booking.driverAdmin.altMobNum}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {booking.driverAdmin.drLicenseNo && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">License Number</label>
                            <p className="text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg text-sm border">
                              {booking.driverAdmin.drLicenseNo}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.driverAdmin.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {booking.driverAdmin.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Cab Details - Show only if admin cab is assigned */}
              {booking.cabAdmin && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-800 text-lg">Admin Cab</h4>
                        <p className="text-purple-600 text-sm">Internal Vehicle</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <UserCheck className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-700 text-sm">Successfully Assigned</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Vehicle Name/Registration No</label>
                        <p className="text-gray-900 font-semibold text-lg">{booking.cabAdmin.vehicleNameAndRegNo}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">RC Number</label>
                            <p className="text-gray-900 font-medium">{booking.cabAdmin.vehicleRcNo}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              booking.cabAdmin.status === 'AVAILABLE'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {booking.cabAdmin.status}
                            </span>
                          </div>
                        </div>
                        {booking.cabAdmin.carOtherDetails && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Other Details</label>
                            <p className="text-gray-900 text-sm bg-gray-50 px-3 py-2 rounded-lg border">{booking.cabAdmin.carOtherDetails}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Scheduled Dates */}
            {booking.scheduledDates && booking.scheduledDates.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Scheduled Dates
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {booking.scheduledDates.map((date) => (
                        <tr key={date.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {date.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              date.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : date.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : date.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {date.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {date.slotId ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                Slot {date.slotId}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Not assigned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Assignment Modal */}
      <VendorAssignmentModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        vendors={vendors}
        loading={loadingVendors}
        onAssign={assignVendor}
        assigningVendor={assigningVendor}
        currentVendor={booking?.vendor}
      />

      {/* Admin Driver Assignment Modal */}
      <AdminDriverAssignmentModal
        isOpen={showAdminDriverModal}
        onClose={() => setShowAdminDriverModal(false)}
        drivers={adminDrivers}
        loading={loadingAdminDrivers}
        onAssign={assignAdminDriver}
        assigningDriver={assigningAdminDriver}
        currentDriver={booking?.driverAdmin}
      />

      {/* Admin Cab Assignment Modal */}
      <AdminCabAssignmentModal
        isOpen={showAdminCabModal}
        onClose={() => setShowAdminCabModal(false)}
        cabs={adminCabs}
        loading={loadingAdminCabs}
        onAssign={assignAdminCab}
        assigningCab={assigningAdminCab}
        currentCab={booking?.cabAdmin}
      />
    </div>
  );
}