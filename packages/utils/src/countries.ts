export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export const COUNTRIES: CountryData[] = [
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧' },
  { code: 'EU', name: 'European Union', currency: 'EUR', currencySymbol: '€', flag: '🇪🇺' },
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', currencySymbol: '﷼', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', currencySymbol: '﷼', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', currencySymbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', currencySymbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', currency: 'OMR', currencySymbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', currencySymbol: 'R', flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya', currency: 'KES', currencySymbol: 'KSh', flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', currencySymbol: '₦', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', currencySymbol: 'E£', flag: '🇪🇬' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', currencySymbol: 'GH₵', flag: '🇬🇭' },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: '$', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: '$', flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: '$', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', currencySymbol: 'RM', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', currencySymbol: '₱', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', currencySymbol: 'Rp', flag: '🇮🇩' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', currencySymbol: 'Rs', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', currencySymbol: '৳', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', currencySymbol: 'Rs', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', currency: 'NPR', currencySymbol: 'Rs', flag: '🇳🇵' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: '$', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', flag: '🇯🇵' },
  { code: 'CN', name: 'China', currency: 'CNY', currencySymbol: '¥', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', currencySymbol: '₩', flag: '🇰🇷' },
  { code: 'TR', name: 'Turkey', currency: 'TRY', currencySymbol: '₺', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', currency: 'RUB', currencySymbol: '₽', flag: '🇷🇺' },
];

export function getCountryByCode(code: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
