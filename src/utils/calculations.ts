import { QuotationItemType } from '../lib/supabase';

export function calculateItemAmount(item: QuotationItemType) {
  const baseAmount = item.quantity * item.rate;
  const discountedAmount = baseAmount - item.discount;
  const withCharges = discountedAmount + (item.additional_charges || 0);
  return withCharges;
}

export function calculateItemGST(item: QuotationItemType) {
  const amount = calculateItemAmount(item);
  const gstAmount = (amount * item.gst_rate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return {
    cgst,
    sgst,
    total: gstAmount,
    totalWithGst: amount + gstAmount
  };
}

export function calculateQuotationTotals(
  items: QuotationItemType[],
  roundOff: string = 'none',
  discountType: string = 'none',
  discountValue: number = 0,
  additionalCharges: number = 0
) {
  let subtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalQuantity = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    subtotal += calculateItemAmount(item);
    const gst = calculateItemGST(item);
    totalCGST += gst.cgst;
    totalSGST += gst.sgst;
    totalQuantity += item.quantity;
    totalDiscount += item.discount;
  });

  const totalGST = totalCGST + totalSGST;
  let grandTotal = subtotal + totalGST;

  let quotationDiscount = 0;
  if (discountType === 'percentage') {
    quotationDiscount = (grandTotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    quotationDiscount = discountValue;
  }

  grandTotal -= quotationDiscount;
  grandTotal += additionalCharges;

  let roundOffAmount = 0;
  if (roundOff === 'up') {
    const rounded = Math.ceil(grandTotal);
    roundOffAmount = rounded - grandTotal;
    grandTotal = rounded;
  } else if (roundOff === 'down') {
    const rounded = Math.floor(grandTotal);
    roundOffAmount = rounded - grandTotal;
    grandTotal = rounded;
  }

  return {
    subtotal,
    totalCGST,
    totalSGST,
    totalGST,
    totalQuantity,
    totalDiscount,
    quotationDiscount,
    additionalCharges,
    roundOffAmount,
    grandTotal
  };
}

export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let result = '';

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }

    if (n > 0) {
      result += ones[n] + ' ';
    }

    return result;
  }

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  let words = '';

  if (crore > 0) {
    words += convertHundreds(crore) + 'Crore ';
  }
  if (lakh > 0) {
    words += convertHundreds(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    words += convertHundreds(thousand) + 'Thousand ';
  }
  if (remainder > 0) {
    words += convertHundreds(remainder);
  }

  return words.trim();
}

export function formatCurrency(amount: number, _currencyCode: string = 'INR', symbol: string = '₹'): string {
  return `${symbol}${amount.toFixed(2)}`;
}
