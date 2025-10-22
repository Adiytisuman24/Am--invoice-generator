export interface UPIPaymentParams {
  pa: string;
  pn: string;
  tr: string;
  am: number;
  cu?: string;
}

export function generateUPIUrl(params: UPIPaymentParams): string {
  const { pa, pn, tr, am, cu = 'INR' } = params;

  const encodedPn = encodeURIComponent(pn);
  const formattedAmount = am.toFixed(2);

  return `upi://pay?pa=${pa}&pn=${encodedPn}&tr=${tr}&am=${formattedAmount}&cu=${cu}`;
}

export function extractUPIParams(upiUrl: string): UPIPaymentParams | null {
  try {
    const url = new URL(upiUrl);
    if (url.protocol !== 'upi:' || url.pathname !== '//pay') {
      return null;
    }

    const params = url.searchParams;
    const pa = params.get('pa');
    const pn = params.get('pn');
    const tr = params.get('tr');
    const am = params.get('am');

    if (!pa || !pn || !tr || !am) {
      return null;
    }

    return {
      pa,
      pn,
      tr,
      am: parseFloat(am),
      cu: params.get('cu') || 'INR'
    };
  } catch {
    return null;
  }
}
