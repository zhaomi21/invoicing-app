'use client';
import { useState, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";

interface BusinessDetails {
  name: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

export default function CreateInvoice() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBusinessDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (businessDetails.name.trim() !== '') {
      closeModal();
    } else {
      // Show an error message or handle empty business name
      alert('Please enter a business name');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-gray-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold">Your App Name</span>
            </Link>
          </div>
          <Link 
            href="https://lavareach.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-lg text-blue-600 hover:text-blue-800 underline transition duration-150 ease-in-out"
          >
            4 min read: Why we created Track Invoicing
          </Link>
        </div>
      </div>

      <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-8 mt-8 max-w-7xl mx-auto w-full">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900">New Invoice</h1>
      </header>

      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          {/* Top section */}
          <div className="flex justify-between items-stretch border-b border-gray-300">
            <div className="w-1/2 p-6">
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
              >
                {logoPreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={logoPreview} 
                      alt="Uploaded logo" 
                      className="max-w-full max-h-full object-contain object-left absolute left-0 top-1/2 transform -translate-y-1/2"
                    />
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-medium text-gray-700 mb-2">Company Logo (optional)</span>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2 flex text-sm text-gray-600">
                      <label
                        htmlFor="logo-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
              {logoPreview && (
                <button
                  onClick={handleLogoDelete}
                  className="mt-2 bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition-colors text-sm"
                >
                  Remove Logo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div className="w-1/2 p-6 flex flex-col">
              <div className="text-right mb-4">
                <span className="text-4xl sm:text-5xl font-bold text-gray-700">Invoice</span>
              </div>
              <button 
                onClick={openModal}
                className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-gray-400 transition-colors relative group"
              >
                {businessDetails.name ? (
                  <div className="text-black space-y-2"> {/* Increased space between lines */}
                    <p className="font-bold text-right text-xl"> {/* Increased font size and weight */}
                      {businessDetails.name}
                    </p>
                    <div className="text-sm"> {/* Slightly smaller text for address */}
                      {businessDetails.streetAddress && <p className="text-right">{businessDetails.streetAddress}</p>}
                      <p className="text-right">
                        {[
                          businessDetails.city,
                          businessDetails.stateProvince,
                          businessDetails.postalCode,
                          businessDetails.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-500 text-center">
                      Click to enter your business details
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-blue-600 font-medium">Edit Details</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="p-6">
            <p className="text-lg text-gray-700">Invoice details will go here...</p>
          </div>
        </div>
      </main>

      {/* Modal for business details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">Enter Business Details</h2>
            <form onSubmit={handleBusinessDetailsSubmit}>
              <div className="mb-4">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={businessDetails.name}
                  onChange={(e) => setBusinessDetails({...businessDetails, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  value={businessDetails.streetAddress}
                  onChange={(e) => setBusinessDetails({...businessDetails, streetAddress: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={businessDetails.city}
                    onChange={(e) => setBusinessDetails({...businessDetails, city: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                  />
                </div>
                <div>
                  <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="stateProvince"
                    value={businessDetails.stateProvince}
                    onChange={(e) => setBusinessDetails({...businessDetails, stateProvince: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={businessDetails.postalCode}
                    onChange={(e) => setBusinessDetails({...businessDetails, postalCode: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={businessDetails.country}
                    onChange={(e) => setBusinessDetails({...businessDetails, country: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black" // Added text-black
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2023 Track Invoicing. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
