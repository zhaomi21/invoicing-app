'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SendInvoice() {
  const [invoiceData, setInvoiceData] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const invoiceId = searchParams.get('id');
    if (invoiceId) {
      // Fetch the invoice data using this ID
      fetchInvoiceData(invoiceId).then(setInvoiceData);
    }
  }, [searchParams]);

  if (!invoiceData) {
    return <div>Loading invoice data...</div>;
  }

  return (
    <div>
      <h1>Send Invoice</h1>
      {/* Add your invoice sending UI here */}
    </div>
  );
}
