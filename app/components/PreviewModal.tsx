import React from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any; // Replace with your actual invoice data type
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Invoice Preview</h2>
        {/* Add your invoice preview content here */}
        <pre>{JSON.stringify(invoiceData, null, 2)}</pre>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PreviewModal;
