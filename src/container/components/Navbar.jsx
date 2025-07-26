'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaBusinessTime,
  FaCheck,
  FaUsers,
  FaCar,
  FaChevronDown,
  FaGlobe,
  FaEdit,
  FaTimes,
  FaCarAlt,
  FaBars,
} from "react-icons/fa";
import {
  BsArrowRightCircle,
  BsArrowLeftCircle,
  BsArrowDownCircle,
} from "react-icons/bs";
import { FaPeopleGroup, FaChartPie } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const Layout = ({ children=null }) => {
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [openSubDropdown, setOpenSubDropdown] = useState(null); // Track which sub-dropdown is open
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Track if the sidebar is open on mobile
  const router = useRouter();

  // Check if the user is logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login"); // Redirect to login if user is not found
    } else {
      setIsLoggedIn(true); // Set logged-in state to true
    }
  }, [router]);

  const toggleDropdown = (dropdownKey) => {
    setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey);
    // Close sub-dropdown when main dropdown changes
    if (openDropdown !== dropdownKey) {
      setOpenSubDropdown(null);
    }
  };

  const toggleSubDropdown = (subDropdownKey) => {
    setOpenSubDropdown(openSubDropdown === subDropdownKey ? null : subDropdownKey);
  };

  const handleLogout = () => {
    console.log("Logging out..."); // Debugging
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // If the user is not logged in, don't render the layout
  if (!isLoggedIn) {
    return null; // Or you can return a loading spinner
  }

  // Render the layout only if the user is logged in
  return (
    <div className="flex h-screen md:h-auto bg-gray-100 z-10">
      {/* Hamburger Menu Icon for Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="text-blue-600 focus:outline-none"
        >
          <FaBars className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`w-64 bg-blue-600 h-auto text-white p-5 overflow-hidden fixed md:relative transform ${
          isSidebarOpen ? "translate-x-0 " : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-40 h-screen`} 
      >
        <img className="mx-auto" src="/images/wtlLogo.jpeg" alt="WTL Logo" />
        <ul>
          <li>
            <Link
              href="/dashboard"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              Dashboard
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => toggleDropdown("allBooking")}
              className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-500 rounded"
            >
              All Booking
              <FaChevronDown
                className={`ml-2 transform ${
                  openDropdown === "allBooking" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "allBooking" && (
              <ul className="mt-2 bg-white text-gray-700 rounded shadow-md w-full">
                <li>
                  <Link
                    href="/online/online-booking"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaGlobe className="mr-2" />
                    Online Booking
                  </Link>
                </li>
                <li className="relative">
                  <button
                    onClick={() => toggleSubDropdown("customBooking")}
                    className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-100 rounded text-left"
                  >
                    <div className="flex items-center">
                      <FaEdit className="mr-2" />
                      Custom Booking
                    </div>
                    <FaChevronDown
                      className={`ml-2 transform ${
                        openSubDropdown === "customBooking" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSubDropdown === "customBooking" && (
                    <ul className="mt-1 ml-4 bg-gray-50 text-gray-700 rounded shadow-sm">
                      <li>
                        <Link
                          href="/online/custom-booking"
                          className="flex items-center py-2 px-4 hover:bg-gray-200 rounded text-sm"
                        >
                          <FaEdit className="mr-2 text-xs" />
                          Booking Management
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/wtlinvoice"
                          className="flex items-center py-2 px-4 hover:bg-gray-200 rounded text-sm"
                        >
                          <FaBusinessTime className="mr-2 text-xs" />
                          WTL Invoice
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <Link
                    href="/online/visitor"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaUsers className="mr-2" />
                Visitor
                  </Link>
                </li>

                 <li>
                  <Link
                    href="/enquiry"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaUsers className="mr-2" />
                Enquiry
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* B2B Dropdown */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("b2b")}
              className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-500 rounded"
            >
              B2B
              <FaChevronDown
                className={`ml-2 transform ${
                  openDropdown === "b2b" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "b2b" && (
              <ul className="mt-2 bg-white text-gray-700 rounded shadow-md w-full">
                <li>
                  <Link
                    href="/B2B/All_B2B"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaBusinessTime className="mr-2" />
                    All B2B
                  </Link>
                </li>
                <li>
                  <Link
                    href="/B2B/B2B_Request"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaCheck className="mr-2" />
                    Request B2B
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/B2B/B2B_Report"
                    className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                  >
                    <FaUsers className="mr-2" />
                    B2B Report
                  </Link>
                </li> */}
              </ul>
            )}
          </li>

          {/* Fleet Section */}
          <button
            onClick={() => toggleDropdown("Fleet")}
            className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-500 rounded"
          >
            Fleet
            <FaChevronDown
              className={`ml-2 transform ${
                openDropdown === "allBooking" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdown === "Fleet" && (
            <ul className="mt-2 bg-white text-gray-700 rounded shadow-md w-full">
              <li>
                <Link
                  href="/fleet/cabs"
                  className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                >
                  <FaCarAlt className="mr-2 " />
                  _Cabs
                </Link>
              </li>
              <li>
                <Link
                  href="/fleet/drivers"
                  className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
                >
                  <FaPeopleGroup className="mr-2" />
                  _Drivers
                </Link>
              </li>
              <li>
                <Link
                  href="/fleet/outsource"
                  className="flex items-center py-2 px-4 hover:bg-blue-100 rounded "
                >
                  <FaChartPie className="mr-2" />
                  _Outsource
                </Link>
              </li>
            </ul>
          )}

          {/* Other Links */}
          <li>
            <Link
              href="/websiteDashboard"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              Website Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/update-root-rate"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              Update Root Rate
            </Link>
          </li>

          <li>
                  <Link
                    href="/analysis"
                    className="flex items-center py-2 px-4 hover:bg-gray-600 rounded"
                  >
                    <FaUsers className="mr-2" />
                    Analysis
                  </Link>
                </li>

          {/* Vendors Dropdown */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("vendors")}
              className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-500 rounded"
            >
              Vendors
              <FaChevronDown
                className={`ml-2 transform ${
                  openDropdown === "vendors" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "vendors" && (
              <ul className="mt-2 bg-gray-700 rounded shadow-md w-full">
                <li>
                  <Link
                    href="/vendors/all-vendors"
                    className="flex items-center py-2 px-4 hover:bg-gray-600 rounded"
                  >
                    <FaBusinessTime className="mr-2" />
                    All Vendors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/request-vendor"
                    className="flex items-center py-2 px-4 hover:bg-gray-600 rounded"
                  >
                    <FaCheck className="mr-2" />
                    Request Vendors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendor-report"
                    className="flex items-center py-2 px-4 hover:bg-gray-600 rounded"
                  >
                    <FaUsers className="mr-2" />
                    Vendor Report
                  </Link>
                </li>
                {/* <li>
                  <Link 
                  href="/vendor-registration"
                  classname="flex items-center py-2 px-4 hover:bg-gray-600 rounded"
                  >
                    <FaCheck className="mr-2" />
                    Vendor Registration 
                    </Link>
                  </li> */}
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/vendors/reset"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              Reset Password
            </Link>
          </li>

          <li>
            <Link
              href="/penalty"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              View Penalty
            </Link>
          </li>

           <li>
            <Link
              href="/ets"
              className="block py-2 px-4 hover:bg-blue-500 rounded"
            >
              ETS ADMIN PANEL
            </Link>
          </li>

          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className="block py-2 px-4 hover:bg-blue-500 rounded w-full text-left"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-16 md:mt-0 z-100 text-black">{children}</div>
    </div>
  );
};

export default Layout;