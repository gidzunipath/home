"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { useAuthSystem, AUTH_TYPES } from "../../hooks/useAuthSystem";

export default function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisaDropdownOpen, setIsVisaDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileVisaOpen, setIsMobileVisaOpen] = useState(false);
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const visaDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null); // Use the comprehensive auth system
  const {
    type: authType,
    user,
    loading: authLoading,
    getNavConfig,
  } = useAuthSystem();
  // Get navigation configuration based on auth state
  const navConfig = getNavConfig();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle mobile visa dropdown
  const toggleMobileVisa = () => {
    setIsMobileVisaOpen(!isMobileVisaOpen);
  };

  // Toggle mobile admin dropdown
  const toggleMobileAdmin = () => {
    setIsMobileAdminOpen(!isMobileAdminOpen);
  };

  // Handle dropdown with delay
  const openDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsVisaDropdownOpen(true);
  };

  const closeDropdownWithDelay = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsVisaDropdownOpen(false);
    }, 150);
  };

  // Handle admin dropdown with delay
  const openAdminDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsAdminDropdownOpen(true);
  };

  const closeAdminDropdownWithDelay = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsAdminDropdownOpen(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        visaDropdownRef.current &&
        !visaDropdownRef.current.contains(event.target)
      ) {
        setIsVisaDropdownOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target)
      ) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled ? "pt-3" : "bg-white border-b border-appleGray-200/80"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out ${
          isScrolled
            ? "max-w-5xl px-6 glass-effect shadow-medium backdrop-blur-xl rounded-2xl"
            : "max-w-7xl px-4 sm:px-6 lg:px-8 bg-white"
        }`}
      >
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* <div className="w-10 h-10 bg-gradient-to-br from-german-red to-german-gold rounded-xl flex items-center justify-center shadow-soft transition-all duration-300 group-hover:scale-110"> */}
            <button className="flex items-center">
              <Image
                width={64}
                height={64}
                src="/gidz-transperant.png"
                alt="Gidzuni Education Pathways Logo"
                className="h-16 w-16 object-contain"
              />
            </button>
            {/* </div> */}
            <div className="montserrat text-2xl font-bold text-appleGray-800">
              GIDZ <span className="text-sky-500">UniPath</span>
            </div>
            {/* <div className="text-xs text-appleGray-500 -mt-1">
                German Excellence
              </div> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {" "}
            <Link
              href="/"
              className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>{" "}
            </Link>{" "}
            <Link
              href="/programs"
              className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
            >
              Programs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
            </Link>{" "}
            {/* Visa Dropdown - Show based on auth state */}
            {navConfig.showVisaServices && (
              <div
                className="relative"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdownWithDelay}
                ref={visaDropdownRef}
              >
                <Link
                  href="/apply-now"
                  onClick={() => setIsVisaDropdownOpen(!isVisaDropdownOpen)}
                  className="flex items-center space-x-1 text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
                  aria-haspopup="true"
                  aria-expanded={isVisaDropdownOpen}
                >
                  <span>Visa Apply</span>
                  <FaChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isVisaDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                {isVisaDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-large border border-appleGray-200 overflow-hidden animate-scale-in z-50"
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdownWithDelay}
                  >
                    <div className="p-2">
                      <Link
                        href="/apply-now/student"
                        className="block px-4 py-3 rounded-xl text-appleGray-700 hover:bg-sky-500/10 hover:text-sky-500 transition-colors duration-200"
                        onClick={() => setIsVisaDropdownOpen(false)}
                      >
                        <div className="font-medium">Student Visa</div>
                        <div className="text-sm text-appleGray-500">
                          For university applications
                        </div>
                      </Link>
                      <Link
                        href="/apply-now/work"
                        className="block px-4 py-3 rounded-xl text-appleGray-700 hover:bg-sky-500/10 hover:text-sky-500 transition-colors duration-200"
                        onClick={() => setIsVisaDropdownOpen(false)}
                      >
                        <div className="font-medium">Work Visa</div>
                        <div className="text-sm text-appleGray-500">
                          For professional opportunities
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}{" "}
            {/* Applications - Show based on auth state (Admin only) */}
            {/* {navConfig.showApplications && (
              <Link
                href="/applications"
                className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
              >
                Applications
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            )} */}
            {/* Application Status - Show based on auth state */}
            {/* {navConfig.showCheckStatus && (
              <Link
                href="/application"
                className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
              >
                Check Status
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            )} */}
            {/* Careers - Show based on auth state */}
            {navConfig.showCareers && (
              <Link
                href="/careers"
                className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
              >
                Careers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            )}
            {/* Contact - Show based on auth state */}
            {navConfig.showContact && (
              <Link
                href="/contact"
                className="text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            )}
            {/* Authentication - Dynamic based on auth state */}
            {navConfig.secondaryAction ? (
              <div className="flex items-center space-x-4">
                {navConfig.primaryAction.type === "admin-dropdown" ? (
                  <div
                    className="relative"
                    onMouseEnter={openAdminDropdown}
                    onMouseLeave={closeAdminDropdownWithDelay}
                    ref={adminDropdownRef}
                  >
                    <Link
                      href={navConfig.primaryAction.href}
                      onClick={() =>
                        setIsAdminDropdownOpen(!isAdminDropdownOpen)
                      }
                      className="flex items-center space-x-1 text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
                      aria-haspopup="true"
                      aria-expanded={isAdminDropdownOpen}
                    >
                      <span>{navConfig.primaryAction.label}</span>
                      <FaChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isAdminDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    {isAdminDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-large border border-appleGray-200 overflow-hidden animate-scale-in z-50"
                        onMouseEnter={openAdminDropdown}
                        onMouseLeave={closeAdminDropdownWithDelay}
                      >
                        <div className="p-2">
                          {navConfig.adminDropdownItems?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-3 rounded-xl text-appleGray-700 hover:bg-sky-500/10 hover:text-sky-500 transition-colors duration-200"
                              onClick={() => setIsAdminDropdownOpen(false)}
                            >
                              <div className="font-medium">{item.label}</div>
                              <div className="text-sm text-appleGray-500">
                                {item.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : navConfig.primaryAction.type === "link" ? (
                  <Link
                    href={navConfig.primaryAction.href}
                    className={navConfig.primaryAction.className}
                  >
                    {navConfig.primaryAction.label}
                  </Link>
                ) : (
                  <button
                    onClick={navConfig.primaryAction.onClick}
                    className={navConfig.primaryAction.className}
                  >
                    {navConfig.primaryAction.label}
                  </button>
                )}
                {navConfig.secondaryAction.type === "button" && (
                  <button
                    onClick={navConfig.secondaryAction.onClick}
                    className={navConfig.secondaryAction.className}
                  >
                    {navConfig.secondaryAction.label}
                  </button>
                )}
              </div>
            ) : navConfig.primaryAction.type === "admin-dropdown" ? (
              <div
                className="relative"
                onMouseEnter={openAdminDropdown}
                onMouseLeave={closeAdminDropdownWithDelay}
                ref={adminDropdownRef}
              >
                <Link
                  href={navConfig.primaryAction.href}
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className="flex items-center space-x-1 text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200 relative group"
                  aria-haspopup="true"
                  aria-expanded={isAdminDropdownOpen}
                >
                  <span>{navConfig.primaryAction.label}</span>
                  <FaChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isAdminDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                {isAdminDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-large border border-appleGray-200 overflow-hidden animate-scale-in z-50"
                    onMouseEnter={openAdminDropdown}
                    onMouseLeave={closeAdminDropdownWithDelay}
                  >
                    <div className="p-2">
                      {navConfig.adminDropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-3 rounded-xl text-appleGray-700 hover:bg-sky-500/10 hover:text-sky-500 transition-colors duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-appleGray-500">
                            {item.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : navConfig.primaryAction.type === "link" ? (
              <Link
                href={navConfig.primaryAction.href}
                className={navConfig.primaryAction.className}
              >
                {navConfig.primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={navConfig.primaryAction.onClick}
                className={navConfig.primaryAction.className}
              >
                {navConfig.primaryAction.label}
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-appleGray-100 text-appleGray-700 hover:bg-appleGray-200 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-appleGray-200 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-large animate-fade-in-up">
            <div className="px-4 py-6 space-y-4">
              {" "}
              <Link
                href="/"
                className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home{" "}
              </Link>{" "}
              <Link
                href="/programs"
                className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programs
              </Link>{" "}
              {/* Mobile Visa Dropdown - Show based on auth state */}
              {navConfig.showVisaServices && (
                <div>
                  {" "}
                  <button
                    onClick={toggleMobileVisa}
                    className="flex items-center justify-between w-full text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                  >
                    <span>Visa Apply</span>
                    <FaChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isMobileVisaOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isMobileVisaOpen && (
                    <div className="pl-4 mt-2 space-y-2 animate-fade-in-up">
                      {" "}
                      <Link
                        href="/apply-now/student"
                        className="block text-appleGray-600 hover:text-sky-500 py-2 transition-colors duration-200 text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Student Visa
                      </Link>
                      <Link
                        href="/apply-now/work"
                        className="block text-appleGray-600 hover:text-sky-500 py-2 transition-colors duration-200 text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Work Visa
                      </Link>
                    </div>
                  )}
                </div>
              )}{" "}
              {/* Applications - Show based on auth state (Admin only) */}
              {/* {navConfig.showApplications && (
                <Link
                  href="/applications"
                  className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications
                </Link>
              )} */}
              {/* Application Status - Show based on auth state */}
              {/* {navConfig.showCheckStatus && (
                <Link
                  href="/application"
                  className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Check Status
                </Link>
              )} */}
              {/* Careers - Show based on auth state */}
              {navConfig.showCareers && (
                <Link
                  href="/careers"
                  className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Careers
                </Link>
              )}
              {/* Contact - Show based on auth state */}
              {navConfig.showContact && (
                <Link
                  href="/contact"
                  className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              )}
              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-appleGray-200">
                {navConfig.secondaryAction ? (
                  <div className="space-y-2">
                    {navConfig.primaryAction.type === "admin-dropdown" ? (
                      <div>
                        <button
                          onClick={toggleMobileAdmin}
                          className="flex items-center justify-between w-full text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                        >
                          <span>{navConfig.primaryAction.label}</span>
                          <FaChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isMobileAdminOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isMobileAdminOpen && (
                          <div className="pl-4 space-y-1 mt-2">
                            {navConfig.adminDropdownItems?.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block text-appleGray-600 hover:text-sky-500 py-2 transition-colors duration-200 text-sm"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileAdminOpen(false);
                                }}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : navConfig.primaryAction.type === "link" ? (
                      <Link
                        href={navConfig.primaryAction.href}
                        className="block text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {navConfig.primaryAction.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          navConfig.primaryAction.onClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                      >
                        {navConfig.primaryAction.label}
                      </button>
                    )}
                    {navConfig.secondaryAction.type === "button" && (
                      <button
                        onClick={() => {
                          navConfig.secondaryAction.onClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left text-red-600 hover:text-red-700 font-medium py-2 transition-colors duration-200"
                      >
                        {navConfig.secondaryAction.label}
                      </button>
                    )}
                  </div>
                ) : navConfig.primaryAction.type === "admin-dropdown" ? (
                  <div>
                    <button
                      onClick={toggleMobileAdmin}
                      className="flex items-center justify-between w-full text-appleGray-700 hover:text-sky-500 font-medium py-2 transition-colors duration-200"
                    >
                      <span>{navConfig.primaryAction.label}</span>
                      <FaChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isMobileAdminOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isMobileAdminOpen && (
                      <div className="pl-4 space-y-1 mt-2">
                        {navConfig.adminDropdownItems?.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block text-appleGray-600 hover:text-sky-500 py-2 transition-colors duration-200 text-sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileAdminOpen(false);
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : navConfig.primaryAction.type === "link" ? (
                  <Link
                    href={navConfig.primaryAction.href}
                    className="block bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold text-center btn-apple-hover shadow-soft"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {navConfig.primaryAction.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      navConfig.primaryAction.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold text-center btn-apple-hover shadow-soft"
                  >
                    {navConfig.primaryAction.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
