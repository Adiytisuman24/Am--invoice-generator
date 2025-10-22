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
}

export default function PaymentCard({
  amount,
  upiId,
  businessName,
  quotationNo,
  bankDetails = [],
  currency,
  currencySymbol
}: PaymentCardProps) {
  const upiUrl = upiId
    ? generateUPIUrl({
        pa: upiId,
        pn: businessName,
        tr: quotationNo,
        am: amount,
        cu: currency
      })
    : null;

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(30, 64, 175, 0.2)'
      }}
    >
      {upiUrl && (
        <div className="flex-1 flex flex-col">
          <p
            className="text-center font-bold tracking-wider mb-4"
            style={{ fontSize: '11pt', letterSpacing: '0.1em' }}
          >
            SCAN TO PAY
          </p>

          <div className="flex justify-center items-center flex-1 mb-4">
            <div
              className="bg-white"
              style={{ padding: '12px', borderRadius: '12px' }}
            >
              <QRCodeSVG
                value={upiUrl}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          <div className="space-y-2 text-center" style={{ fontSize: '9pt', color: '#E0E7FF' }}>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>Amount:</span>{' '}
              {currencySymbol}{amount.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>UPI:</span>{' '}
              {upiId}
            </p>
            <p>
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>Ref:</span>{' '}
              {quotationNo}
            </p>
          </div>
        </div>
      )}

      {bankDetails.length > 0 && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <p
            className="text-center mb-3 italic"
            style={{ fontSize: '8pt', color: '#C7D2FE' }}
          >
            Or transfer to:
          </p>
          <div className="space-y-3">
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
