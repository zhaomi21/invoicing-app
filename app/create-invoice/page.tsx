'use client';
import { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface BusinessDetails {
  name: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

interface CustomerDetails {
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

interface LineItem {
  item: string;
  description: string;
  quantity: number;
  rate: number;
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.body)
    : null;
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
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    businessName: '',
    firstName: '',
    lastName: '',
    email: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: ''
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item: '', description: '', quantity: 1, rate: 0 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState<string>('');
  const [isDateOptionsVisible, setIsDateOptionsVisible] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateInputRef.current && !dateInputRef.current.contains(event.target as Node)) {
        setIsDateOptionsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.value = paymentDueDate;
    }
  }, [paymentDueDate]);

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

  const openCustomerModal = () => setIsCustomerModalOpen(true);
  const closeCustomerModal = () => setIsCustomerModalOpen(false);

  const handleBusinessDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (businessDetails.name.trim() !== '') {
      closeModal();
    } else {
      // Show an error message or handle empty business name
      alert('Please enter a business name');
    }
  };

  const handleCustomerDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customerDetails.firstName.trim() !== '' && customerDetails.lastName.trim() !== '') {
      closeCustomerModal();
    } else {
      alert('Please enter at least a first and last name');
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item: '', description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setLineItems(newLineItems);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const taxAmount = isTaxEnabled ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const generateInvoiceNumber = () => {
    const getRandomLetters = (str: string, count: number) => {
      const letters = (str || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
      let result = '';
      for (let i = 0; i < count; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length)) || 'X';
      }
      return result;
    };

    const businessLetters = getRandomLetters(businessDetails.name, 2);
    const customerLetters = getRandomLetters(customerDetails.businessName || `${customerDetails.firstName} ${customerDetails.lastName}`, 2);
    const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const newInvoiceNumber = `${businessLetters}${customerLetters}-${randomNumbers}`;
    setInvoiceNumber(newInvoiceNumber);
  };

  const handleQuickDateSelection = (days: number) => {
    const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + days);
    const formattedDate = dueDate.toISOString().split('T')[0];
    setPaymentDueDate(formattedDate);
    setIsDateOptionsVisible(false);
  };

  const QuickDateOptions = () => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (dateInputRef.current) {
        const rect = dateInputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.right + window.scrollX + 10 // Added 10px margin
        });
      }
    }, [isDateOptionsVisible]);

    return (
      <Portal>
        <div 
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
          className="bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <button onClick={() => handleQuickDateSelection(0)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">On Receipt</button>
          <button onClick={() => handleQuickDateSelection(15)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">Within 15 Days</button>
          <button onClick={() => handleQuickDateSelection(30)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">Within 30 Days</button>
          <button onClick={() => handleQuickDateSelection(45)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">Within 45 Days</button>
          <button onClick={() => handleQuickDateSelection(60)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">Within 60 Days</button>
          <button onClick={() => handleQuickDateSelection(90)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black text-xs">Within 90 Days</button>
        </div>
      </Portal>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-gray-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
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
        {/* Top section */}
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm mb-8">
          <div className="flex justify-between items-stretch">
            <div className="w-1/3 p-6">
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
              >
                {logoPreview ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={logoPreview} 
                      alt="Uploaded logo" 
                      width={100}
                      height={100}
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
            <div className="w-2/3 p-6 flex flex-col">
              <div className="flex justify-end items-start mb-4">
                <span className="text-4xl sm:text-5xl font-bold text-gray-700">Invoice</span>
              </div>
              <div className="flex justify-end">
                <div className="w-1/2">
                  <button 
                    onClick={openModal}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-gray-400 transition-colors relative group h-32"
                  >
                    {businessDetails.name ? (
                      <div className="text-black space-y-1">
                        <p className="font-bold text-right text-lg">
                          {businessDetails.name}
                        </p>
                        <div className="text-xs">
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
                        <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-500 text-center text-sm">
                          Click to enter your business details
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">Edit Details</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New bottom section */}
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-stretch">
              <div className="w-1/2 pr-3">
                <button 
                  onClick={openCustomerModal}
                  className="w-full h-auto border-2 border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-gray-400 transition-colors relative group"
                >
                  {customerDetails.businessName || customerDetails.firstName || customerDetails.lastName ? (
                    <div className="text-black text-left w-full">
                      {customerDetails.businessName && (
                        <p className="font-bold text-lg mb-1">{customerDetails.businessName}</p>
                      )}
                      <p className="text-base">
                        {`${customerDetails.firstName} ${customerDetails.lastName}`}
                      </p>
                      {customerDetails.email && (
                        <p className="text-sm">{customerDetails.email}</p>
                      )}
                      {customerDetails.streetAddress && (
                        <p className="text-sm">{customerDetails.streetAddress}</p>
                      )}
                      <p className="text-sm">
                        {[
                          customerDetails.city,
                          customerDetails.stateProvince,
                          customerDetails.postalCode,
                          customerDetails.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-center">Add Customer</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="text-blue-600 font-medium">
                      {customerDetails.businessName || customerDetails.firstName || customerDetails.lastName ? 'Edit Customer' : 'Add Customer'}
                    </span>
                  </div>
                </button>
              </div>
              <div className="w-1/2 pl-3 flex flex-col justify-start items-end">
                <div className="text-right">
                  <div className="mb-2">
                    <label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">Invoice Number:</label>
                    <input
                      type="text"
                      id="invoiceNumber"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="ml-2 p-1 border border-gray-300 rounded-md text-sm text-black"
                      placeholder="INV-001"
                    />
                    <div>
                      <button
                        onClick={generateInvoiceNumber}
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 focus:outline-none"
                      >
                        Auto-generate
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700">Invoice Date:</label>
                    <input
                      type="date"
                      id="invoiceDate"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="ml-2 p-1 border border-gray-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="paymentDue" className="text-sm font-medium text-gray-700">Payment Due:</label>
                    <div className="relative inline-block">
                      <input
                        type="date"
                        id="paymentDue"
                        ref={dateInputRef}
                        value={paymentDueDate}
                        onChange={(e) => setPaymentDueDate(e.target.value)}
                        onFocus={() => setIsDateOptionsVisible(true)}
                        className="ml-2 p-1 border border-gray-300 rounded-md text-sm text-black"
                      />
                      {isDateOptionsVisible && <QuickDateOptions />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoice Line Items Section */}
            <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left font-bold text-black">Item</th>
                    <th className="px-4 py-2 text-left font-bold text-black w-1/3">Description (optional)</th>
                    <th className="px-4 py-2 text-right font-bold text-black w-24">Quantity</th>
                    <th className="px-4 py-2 text-right font-bold text-black w-32">Rate/Price</th>
                    <th className="px-4 py-2 text-right font-bold text-black w-32">Amount</th>
                    <th className="px-4 py-2 font-bold text-black w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2 align-top">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleLineItemChange(index, 'item', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-black"
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <textarea
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded h-20 resize-none text-black"
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-right text-black"
                          min="1"
                          max="999"
                        />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-right text-black"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2 text-right align-top text-black">
                        {(item.quantity * item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 align-top">
                        {lineItems.length > 1 && (
                          <button onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700">
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-gray-50">
                <button
                  onClick={addLineItem}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Add Line Item
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-1/3">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="text-black">${calculateTotals().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="taxToggle"
                      checked={isTaxEnabled}
                      onChange={(e) => setIsTaxEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="taxToggle" className="mr-2 text-black">Add Tax</label>
                    {isTaxEnabled && (
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-16 p-1 border border-gray-300 rounded text-right text-black"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    )}
                    {isTaxEnabled && <span className="ml-1 text-black">%</span>}
                  </div>
                  {isTaxEnabled && (
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Tax:</span>
                      <span className="text-black">${calculateTotals().taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-black">${calculateTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">Enter Customer Details</h2>
            <form onSubmit={handleCustomerDetailsSubmit}>
              <div className="mb-4">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={customerDetails.businessName}
                  onChange={(e) => setCustomerDetails({...customerDetails, businessName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={customerDetails.firstName}
                  onChange={(e) => setCustomerDetails({...customerDetails, firstName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={customerDetails.lastName}
                  onChange={(e) => setCustomerDetails({...customerDetails, lastName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  value={customerDetails.streetAddress}
                  onChange={(e) => setCustomerDetails({...customerDetails, streetAddress: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
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
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails({...customerDetails, city: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <div>
                  <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="stateProvince"
                    value={customerDetails.stateProvince}
                    onChange={(e) => setCustomerDetails({...customerDetails, stateProvince: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
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
                    value={customerDetails.postalCode}
                    onChange={(e) => setCustomerDetails({...customerDetails, postalCode: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={customerDetails.country}
                    onChange={(e) => setCustomerDetails({...customerDetails, country: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeCustomerModal}
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
