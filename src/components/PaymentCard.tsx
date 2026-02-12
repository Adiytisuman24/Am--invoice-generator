import { QRCodeSVG } from 'qrcode.react';
import { generateUPIUrl } from '../utils/upiQrCode';
import { BankDetailsType } from '../lib/supabase';

interface PaymentCardProps {
  amount: number;
  upiId?: string;
  businessName: string;
  quotationNo: string;
  bankDetails?: BankDetailsType[];
  currency: string;
  currencySymbol: string;
  advancePayment?: number;
}

export default function PaymentCard({
  amount,
  upiId,
  businessName,
  quotationNo,
  bankDetails = [],
  currency,
  currencySymbol,
  advancePayment = 0
}: PaymentCardProps) {
  const displayAmount = advancePayment > 0 ? advancePayment : amount;
  // Use current origin for the link to ensure it works locally and in production
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://grapepay.in';
  
  // Use optional VITE_BASE_PATH (set in environment) otherwise default to root
  const rawBase = import.meta.env.VITE_BASE_PATH ?? '';
  const basePath = rawBase ? (rawBase.startsWith('/') ? rawBase : `/${rawBase}`) : '';
  const trackingUrl = `${origin}${basePath}/${quotationNo}`;

  const upiUrl = upiId
    ? generateUPIUrl({
        pa: upiId,
        pn: businessName,
        tr: quotationNo,
        am: displayAmount,
        cu: currency,
        url: trackingUrl
      })
    : null;

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
        color: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(30, 64, 175, 0.2)'
      }}
    >
      {upiUrl && (
        <div className="flex-1 flex flex-col">
          <p
            className="text-center font-bold tracking-wider mb-2"
            style={{ fontSize: '10pt', letterSpacing: '0.1em' }}
          >
            {advancePayment > 0 ? 'SCAN TO PAY ADVANCE' : 'SCAN TO PAY'}
          </p>

          <div className="flex justify-center items-center flex-1 mb-2">
            <div
              className="bg-white"
              style={{ padding: '8px', borderRadius: '8px' }}
            >
              <QRCodeSVG
                value={upiUrl}
                size={100}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          <div className="space-y-1 text-center" style={{ fontSize: '8pt', color: '#E0E7FF' }}>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>Amount:</span>{' '}
              {currencySymbol}{displayAmount.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>UPI:</span>{' '}
              {upiId}
            </p>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>Ref:</span>{' '}
              {quotationNo}
            </p>
            <a 
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-100 underline mt-2 block font-medium"
              style={{ fontSize: '8pt' }}
            >
              Download Receipt / Track Status
            </a>
          </div>
        </div>
      )}

      {bankDetails.length > 0 && (
        <div
          className="mt-2 pt-2"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <p
            className="text-center mb-2 italic"
            style={{ fontSize: '7pt', color: '#C7D2FE' }}
          >
            Or transfer to:
          </p>
          <div className="space-y-2">
            {bankDetails.map((bank, index) => (
              <div key={index} className="space-y-1" style={{ fontSize: '8pt', color: '#E0E7FF' }}>
                {bankDetails.length > 1 && (
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                    Account {index + 1}
                  </p>
                )}
                <p>
                  <span className="font-medium" style={{ color: '#FFFFFF' }}>Bank:</span> {bank.bank_name}
                </p>
                <p>
                  <span className="font-medium" style={{ color: '#FFFFFF' }}>A/c:</span> {bank.account_number}
                </p>
                <p>
                  <span className="font-medium" style={{ color: '#FFFFFF' }}>IFSC:</span> {bank.ifsc_code}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
