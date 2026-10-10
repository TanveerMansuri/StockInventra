import { useSettings } from "./useSettings";
import { formatCurrency as formatUtility } from "@stock-inventra/utils";

export function useCurrencyFormatter() {
  const { data } = useSettings();
  const currencyCode = data?.currency?.currency || 'USD';
  
  return (amount: number) => formatUtility(amount, currencyCode);
}
