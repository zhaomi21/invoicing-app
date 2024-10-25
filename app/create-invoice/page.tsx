'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
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

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Add this new interface for the saved product/service
interface SavedItem {
  item: string;
  description: string;
  rate: number;
}

// Update the commonCurrencies array with CAD at the top and $ as the symbol
const commonCurrencies: Currency[] = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
];

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

function InvoicePreviewModal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: (style: string) => React.ReactNode }) {
  const [selectedStyle, setSelectedStyle] = useState('classic');

  if (!isOpen) return null;

  const applyStyle = (content: React.ReactNode) => {
    switch (selectedStyle) {
      case 'modern':
        return <div className="bg-gray-100 text-gray-800 font-sans">{content}</div>;
      case 'minimalist':
        return <div className="bg-white text-gray-900 font-mono">{content}</div>;
      case 'classic':
      default:
        return <div className="bg-white text-gray-800 font-serif">{content}</div>;
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white shadow-xl max-h-full overflow-auto relative">
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invoice Preview (A4)</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedStyle('classic')}
              className={`px-3 py-1 rounded ${selectedStyle === 'classic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Classic
            </button>
            <button
              onClick={() => setSelectedStyle('modern')}
              className={`px-3 py-1 rounded ${selectedStyle === 'modern' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Modern
            </button>
            <button
              onClick={() => setSelectedStyle('minimalist')}
              className={`px-3 py-1 rounded ${selectedStyle === 'minimalist' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Minimalist
            </button>
          </div>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden">
          <div className="w-full h-full p-[1cm] overflow-auto flex flex-col">
            {applyStyle(
              <>
                {children(selectedStyle)}
                <Link href="https://trackinvoicing.com" target="_blank" rel="noopener noreferrer" className="mt-auto">
                  <div className="h-16 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                    <div className="flex items-center justify-center h-full space-x-4">
                      <span className="text-lg font-semibold text-gray-700">Powered by</span>
                      <Image
                        src="/logo.svg"  // Make sure this path is correct
                        alt="Track Invoicing Logo"
                        width={150}
                        height={40}
                      />
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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
  const [footerContent, setFooterContent] = useState('');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(commonCurrencies[0]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentSaveItem, setCurrentSaveItem] = useState<SavedItem>({ item: '', description: '', rate: 0 });

  console.log('Component rendering');

  const openSaveModal = useCallback((item: LineItem) => {
    console.log('openSaveModal called with item:', item);
    setCurrentSaveItem({
      item: item.item,
      description: item.description,
      rate: item.rate
    });
    setIsSaveModalOpen(true);
  }, []);

  const closeSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
    setCurrentSaveItem({ item: '', description: '', rate: 0 });
  }, []);

  const handleSaveItem = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavedItems(prevItems => [...prevItems, currentSaveItem]);
    closeSaveModal();
  }, [currentSaveItem, closeSaveModal]);

  console.log('openSaveModal function:', openSaveModal);

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
    if (field === 'quantity' || field === 'rate') {
      // Convert to number and handle invalid input
      const numValue = parseFloat(value as string);
      newLineItems[index] = { 
        ...newLineItems[index], 
        [field]: isNaN(numValue) ? 0 : numValue 
      };
    } else {
      newLineItems[index] = { ...newLineItems[index], [field]: value };
    }
    setLineItems(newLineItems);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const discountAmount = isDiscountEnabled ? subtotal * (discountRate / 100) : 0;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = isTaxEnabled ? discountedSubtotal * (taxRate / 100) : 0;
    const total = discountedSubtotal + taxAmount;
    return { subtotal, discountAmount, discountedSubtotal, taxAmount, total };
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

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

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
                <div className="text-right w-full">
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
                  <div className="mb-2">
                    <label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency:</label>
                    <select
                      id="currency"
                      value={selectedCurrency.code}
                      onChange={(e) => setSelectedCurrency(commonCurrencies.find(c => c.code === e.target.value) || commonCurrencies[0])}
                      className="ml-2 p-1 border border-gray-300 rounded-md text-sm text-black"
                    >
                      {commonCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
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
                    <th className="px-4 py-2 text-right font-bold text-black w-32">Rate/Price ({selectedCurrency.symbol})</th>
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
                        <div className="flex items-center">
                          <span className="mr-1">{selectedCurrency.symbol}</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded text-right text-black"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right align-top text-black">
                        {selectedCurrency.symbol}{(item.quantity * item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              console.log('Save button clicked', item);
                              openSaveModal(item);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Save
                          </button>
                          {lineItems.length > 1 && (
                            <button 
                              onClick={() => removeLineItem(index)} 
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
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
              <div className="mt-6 flex justify-end px-4">
                <div className="w-1/3">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Subtotal:</span>
                      <span className="text-black">{selectedCurrency.symbol}{calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="discountToggle"
                        checked={isDiscountEnabled}
                        onChange={(e) => setIsDiscountEnabled(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="discountToggle" className="mr-2 text-black">Add Discount</label>
                      {isDiscountEnabled && (
                        <>
                          <input
                            type="number"
                            value={discountRate}
                            onChange={(e) => setDiscountRate(Number(e.target.value))}
                            className="w-16 p-1 border border-gray-300 rounded text-right text-black"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="ml-1 text-black">%</span>
                        </>
                      )}
                    </div>
                    {isDiscountEnabled && (
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Discount ({discountRate}%):</span>
                        <span className="text-black">-{selectedCurrency.symbol}{calculateTotals().discountAmount.toFixed(2)}</span>
                      </div>
                    )}
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
                        <span className="text-black">{selectedCurrency.symbol}{calculateTotals().taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-black">{selectedCurrency.symbol}{calculateTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add the invoice footer input here */}
              <div className="mt-8 px-4 pb-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Footer</h3>
                <textarea
                  value={footerContent}
                  onChange={(e) => setFooterContent(e.target.value)}
                  placeholder="Enter notes, terms, payment instructions, etc."
                  className="w-full p-3 border border-gray-300 rounded-md text-black min-h-[100px] focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add this new div for the Preview and Save and continue buttons */}
        <div className="mt-8 mb-16 flex justify-end space-x-4">
          <button
            onClick={openPreview}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full shadow-lg flex items-center transition-colors duration-300"
          >
            Preview
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center transition-colors duration-300"
          >
            Save and continue
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </main>

      <InvoicePreviewModal isOpen={isPreviewOpen} onClose={closePreview}>
        {(style) => (
          <div className={`flex flex-col h-full ${style === 'modern' ? 'bg-gray-100' : 'bg-white'}`}>
            {/* Top section */}
            <div className={`flex justify-between items-start mb-12 ${style === 'minimalist' ? '' : 'border-b pb-6'}`}>
              <div className="w-1/3">
                {logoPreview && (
                  <Image 
                    src={logoPreview} 
                    alt="Company Logo" 
                    width={100}
                    height={100}
                    className="max-w-full h-auto max-h-24"
                  />
                )}
              </div>
              <div className="w-2/3 text-right">
                <span className={`text-4xl font-extrabold ${style === 'modern' ? 'text-blue-600' : 'text-gray-700'} tracking-tight`}>INVOICE</span>
                <div className={`mt-2 ${style === 'minimalist' ? 'text-xs' : 'text-sm'}`}>
                  <p className="font-semibold">{businessDetails.name}</p>
                  <p>{businessDetails.streetAddress}</p>
                  <p>
                    {[
                      businessDetails.city,
                      businessDetails.stateProvince,
                      businessDetails.postalCode,
                      businessDetails.country
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer and Invoice Details */}
            <div className="flex justify-between mb-12">
              <div className="w-1/2">
                <h3 className={`${style === 'minimalist' ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Bill To:</h3>
                <div className={style === 'minimalist' ? 'text-xs' : 'text-sm'}>
                  {customerDetails.businessName && <p className="font-semibold">{customerDetails.businessName}</p>}
                  <p>{`${customerDetails.firstName} ${customerDetails.lastName}`}</p>
                  {customerDetails.email && <p>{customerDetails.email}</p>}
                  {customerDetails.streetAddress && <p>{customerDetails.streetAddress}</p>}
                  <p>
                    {[
                      customerDetails.city,
                      customerDetails.stateProvince,
                      customerDetails.postalCode,
                      customerDetails.country
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <div className="w-1/2 text-right">
                <div className={`${style === 'modern' ? 'bg-white' : 'bg-gray-100'} p-4 rounded-lg`}>
                  <p className="mb-2"><span className="font-semibold">Invoice Number:</span> {invoiceNumber}</p>
                  <p className="mb-2"><span className="font-semibold">Invoice Date:</span> {invoiceDate}</p>
                  <p className="mb-2"><span className="font-semibold">Payment Due:</span> {paymentDueDate}</p>
                  <p><span className="font-semibold">Currency:</span> {selectedCurrency.code} ({selectedCurrency.symbol})</p>
                </div>
              </div>
            </div>
            
            {/* Invoice Line Items */}
            <table className="w-full mb-12 text-xs">
              <thead>
                <tr className={`${style === 'modern' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                  <th className="px-3 py-2 text-left font-semibold w-2/5">Item</th>
                  <th className="px-3 py-2 text-left font-semibold w-2/5">Description</th>
                  <th className="px-3 py-2 text-right font-semibold w-16">Quantity</th>
                  <th className="px-3 py-2 text-right font-semibold w-24">Rate/Price ({selectedCurrency.code})</th>
                  <th className="px-3 py-2 text-right font-semibold w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2 align-top">{item.item}</td>
                    <td className="px-3 py-2 align-top">{item.description}</td>
                    <td className="px-3 py-2 text-right align-top">{item.quantity}</td>
                    <td className="px-3 py-2 text-right align-top">{selectedCurrency.symbol}{item.rate.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right align-top">{selectedCurrency.symbol}{(item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-1/3">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="font-medium">Subtotal:</span>
                    <span>{selectedCurrency.symbol}{calculateTotals().subtotal.toFixed(2)} {selectedCurrency.code}</span>
                  </div>
                  {isDiscountEnabled && (
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium">Discount ({discountRate}%):</span>
                      <span className="text-red-600">-{selectedCurrency.symbol}{calculateTotals().discountAmount.toFixed(2)} {selectedCurrency.code}</span>
                    </div>
                  )}
                  {isTaxEnabled && (
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium">Tax ({taxRate}%):</span>
                      <span>{selectedCurrency.symbol}{calculateTotals().taxAmount.toFixed(2)} {selectedCurrency.code}</span>
                    </div>
                  )}
                  <div className={`flex justify-between border-t border-gray-200 pt-2 mt-2 ${style === 'modern' ? 'text-blue-600' : ''}`}>
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg">{selectedCurrency.symbol}{calculateTotals().total.toFixed(2)} {selectedCurrency.code}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            {footerContent && (
              <div className={`mt-auto ${style === 'minimalist' ? '' : 'border-t'} border-gray-200 pt-6`}>
                <h3 className={`${style === 'minimalist' ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Notes:</h3>
                <p className={`whitespace-pre-wrap ${style === 'minimalist' ? 'text-xs' : 'text-sm'}`}>{footerContent}</p>
              </div>
            )}
          </div>
        )}
      </InvoicePreviewModal>

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

      {/* Add this new modal for saving items */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">Save product/service</h2>
            <form onSubmit={handleSaveItem}>
              <div className="mb-4">
                <label htmlFor="saveItem" className="block text-sm font-medium text-gray-700 mb-1">
                  Item
                </label>
                <input
                  type="text"
                  id="saveItem"
                  value={currentSaveItem.item}
                  onChange={(e) => setCurrentSaveItem({...currentSaveItem, item: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="saveDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="saveDescription"
                  value={currentSaveItem.description}
                  onChange={(e) => setCurrentSaveItem({...currentSaveItem, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="saveRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price ({selectedCurrency.symbol})
                </label>
                <input
                  type="number"
                  id="saveRate"
                  value={currentSaveItem.rate}
                  onChange={(e) => setCurrentSaveItem({...currentSaveItem, rate: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeSaveModal}
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
