import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, X, UserCircle } from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";
import { productsService } from "../../services/api";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { NotificationsDropdown } from "./NotificationsDropdown";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formatCurrency = useCurrencyFormatter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await productsService.getProducts({ search: query, limit: 5 });
        if (res.success && res.data) {
          setResults(res.data.slice(0, 5));
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EAE5E0] bg-[#FFFFFF] px-[32px]">
      <div className="relative w-full max-w-[480px]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[16px]">
            <Search className="h-[18px] w-[18px] text-[#77706D]" strokeWidth={2} />
          </div>
          <input
            type="text"
            placeholder="Search products, sales, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="block h-[44px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FEFCF8] py-[10px] pl-[44px] pr-[36px] text-[14px] text-[#242124] placeholder:text-[#77706D] focus:border-[#781529] focus:outline-none focus:ring-1 focus:ring-[#781529] transition-colors"
          />
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-[12px] text-[#77706D] hover:text-[#242124]"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
            >
              <X className="h-[16px] w-[16px]" strokeWidth={2} />
            </button>
          )}
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-[#EAE5E0] py-2 z-50">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-[#77706D]">Searching...</div>
            ) : results.length > 0 ? (
              results.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2 hover:bg-[#FAF5EE] cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing before click
                  onClick={() => {
                     setIsOpen(false);
                     navigate(`/products?search=${encodeURIComponent(product.name)}`);
                  }}
                >
                  <div className="text-[14px] font-medium text-[#242124] truncate">{product.name}</div>
                  <div className="text-[12px] text-[#77706D] mt-1">{product.category?.name || "Product"} • {formatCurrency(product.price)}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#77706D]">No products found for "{query}"</div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-[24px]">
        <div className="hidden items-center justify-center gap-[8px] text-[13px] font-medium text-[#242124] sm:flex h-[40px] px-[16px] border border-[#EAE5E0] rounded-[8px]">
          <Calendar className="h-[16px] w-[16px] text-[#77706D]" strokeWidth={2} />
          <span>{formattedDate}</span>
        </div>
        
        <NotificationsDropdown />
        
        <Link to="/profile" className="flex items-center gap-[12px] cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-[36px] w-[36px] rounded-full overflow-hidden bg-[#FEF7F0] flex items-center justify-center border border-[#EAE5E0]">
            {user?.avatar ? (
              <img src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-[24px] w-[24px] text-[#781529]" strokeWidth={1.5} />
            )}
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-[14px] font-medium text-[#242124] leading-tight">{user?.name || "Tanveer Mansuri"}</span>
            <span className="text-[11px] text-[#77706D] leading-tight mt-[2px]">{user?.role || "Admin"}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
