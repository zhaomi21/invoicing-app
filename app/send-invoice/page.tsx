'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PreviewModal = dynamic(() => import('../components/PreviewModal'), { ssr: false });

export default function SendInvoice({ invoiceNumber, customerDetails = {}, userName, invoiceData }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Set the default subject line when the component mounts
  useEffect(() => {
    setEmailSubject(`New Invoice ${invoiceNumber} from ${userName}`);
  }, [invoiceNumber, userName]);

  const handleSendInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Sending invoice to:', emailTo);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    // Add your logic to send the invoice here
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-gray-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} className="h-8 w-auto" />
            </Link>
            <span className="text-sm font-medium text-gray-700">{invoiceNumber}</span>
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

      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Invoice {invoiceNumber}</h1>
          <div className="bg-yellow-100 text-yellow-800 text-lg font-medium px-4 py-2 rounded-full">
            Draft
          </div>
        </div>
        <h2 className="text-2xl text-gray-700 mb-8">
          Customer: {customerDetails.businessName || `${customerDetails.firstName} ${customerDetails.lastName}`}
        </h2>

        {/* Step-by-Step Flow UI */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between bg-green-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
              <span className="text-lg font-medium">Create Invoice</span>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded hover:bg-green-50">Edit</button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</div>
              <span className="text-lg font-medium">Send Invoice</span>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50">Edit</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>

        {/* Existing form */}
        <form onSubmit={handleSendInvoice} className="space-y-6">
          <div>
            <label htmlFor="emailTo" className="block text-sm font-medium text-gray-700">
              Send To
            </label>
            <input
              type="email"
              id="emailTo"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              id="emailSubject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="emailBody"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            ></textarea>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Invoice
            </button>
          </div>
        </form>
      </main>

      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invoiceData={invoiceData}
        />
      )}
    </div>
  );
}
