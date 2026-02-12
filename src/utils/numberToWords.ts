const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';

  let result = '';

  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }

  if (num >= 10 && num < 20) {
    result += teens[num - 10] + ' ';
  } else {
    result += tens[Math.floor(num / 10)] + ' ';
    result += ones[num % 10] + ' ';
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const numStr = Math.floor(num).toString();
  let result = '';

  if (numStr.length > 9) {
    return 'Number too large';
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = Math.floor(num % 1000);

  if (crore > 0) {
    result += convertLessThanThousand(crore) + ' Crore ';
  }

  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + ' Lakh ';
  }

  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + ' Thousand ';
  }

  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }

  return result.trim();
}

export function formatAmountInWords(amount: number, currency: string = 'INR'): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = numberToWords(rupees);

  if (currency === 'INR') {
    result += ' Rupees';
    if (paise > 0) {
      result += ' and ' + numberToWords(paise) + ' Paise';
    }
  } else if (currency === 'USD') {
    result += ' Dollars';
    if (paise > 0) {
      result += ' and ' + numberToWords(paise) + ' Cents';
    }
  } else if (currency === 'EUR') {
    result += ' Euros';
    if (paise > 0) {
      result += ' and ' + numberToWords(paise) + ' Cents';
    }
  } else if (currency === 'GBP') {
    result += ' Pounds';
    if (paise > 0) {
      result += ' and ' + numberToWords(paise) + ' Pence';
    }
  } else {
    result += ' ' + currency;
  }

  return result + ' Only';
}
