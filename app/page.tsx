'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push('/create-invoice');  // Replace with your desired path
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="logo flex items-center">
          <Image
            src="/logo.svg"
            alt="Company Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-1.5 text-xl font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-150 ease-in-out h-10">
            Log in
          </button>
          <button 
            onClick={handleNavigation}
            className="px-4 py-1.5 text-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out h-10"
          >
            Start free
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal mb-6 text-black max-w-[85%] leading-tight">
          Simple Invoicing for Canadian Businesses
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-10 max-w-3xl font-normal">
          Set recurring invoices, track time, and automate reminders to get paid fast!
        </h2>
        <button 
          onClick={handleNavigation}
          className="px-6 py-3 text-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out inline-flex items-center justify-center"
        >
          <span className="flex-grow text-center">Send your first invoice</span>
          <Image
            src="/invoice-icon.svg"
            alt="Invoice icon"
            width={24}
            height={24}
            className="ml-2 flex-shrink-0"
          />
        </button>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500">
        {/* You can add footer content here if needed */}
      </footer>
    </div>
  );
}
