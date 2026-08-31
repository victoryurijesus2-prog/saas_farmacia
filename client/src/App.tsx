/**
 * Farma+ design reminder: shared chrome must feel like one coherent pharmacy
 * storefront across home and catalogue, with compact red actions and editorial spacing.
 */

import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartDrawer, Footer, Header, BackToHomeButton, ScrollTopButton, StoreActionsContext, WhatsAppButton, type CartLine, usePersistedState } from "./components/StoreComponents";
import { siteConfig } from "./lib/siteConfig";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StoreDataProvider, useStoreData } from "./contexts/StoreDataContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Account from "./pages/Account";

function StoreLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = usePersistedState<string>("farmais-location", siteConfig.location.defaultCity);
  const [favoriteIds, setFavoriteIds] = usePersistedState<string[]>("farmais-favorites", []);
  const [cartLines, setCartLines] = usePersistedState<CartLine[]>("farmais-cart", []);
  const [cartOpen, setCartOpen] = useState(false);
  const { products, user } = useStoreData();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("busca") ?? "");
  }, [location]);

  const searchProducts = () => {
    const trimmed = search.trim();
    navigate(trimmed ? `/produtos?busca=${encodeURIComponent(trimmed)}` : "/produtos");
  };

  const addToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setCartLines((current) => {
      const existing = current.find((line) => line.product.id === productId);
      return existing ? current.map((line) => line.product.id === productId ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }];
    });
    toast.success("Adicionado ao carrinho", { description: product.name });
  };

  const changeQuantity = (productId: string, delta: number) => setCartLines((current) => current.flatMap((line) => {
    if (line.product.id !== productId) return [line];
    const quantity = line.quantity + delta;
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));

  const toggleFavorite = (productId: string) => setFavoriteIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);

  return <div className="store-shell">
    <Header user={user} searchValue={search} onSearchChange={setSearch} onSearch={searchProducts} cartCount={cartLines.reduce((sum, line) => sum + line.quantity, 0)} favoriteCount={favoriteIds.length} location={selectedLocation} onLocationChange={setSelectedLocation} onOpenCart={() => setCartOpen(true)} />
    <StoreActionsContext.Provider value={{ favoriteIds, toggleFavorite, addToCart, openCart: () => setCartOpen(true) }}>
      {children}
    </StoreActionsContext.Provider>
    <Footer />
    <BackToHomeButton />
    <ScrollTopButton />
    <WhatsAppButton />
    <CartDrawer open={cartOpen} lines={cartLines} onClose={() => setCartOpen(false)} onIncrease={(id) => changeQuantity(id, 1)} onDecrease={(id) => changeQuantity(id, -1)} onRemove={(id) => setCartLines((current) => current.filter((line) => line.product.id !== id))} />
  </div>;
}

function Router() {
  return <StoreLayout><Switch><Route path="/" component={Home} /><Route path="/produtos" component={Products} /><Route path="/entrar" component={Auth} /><Route path="/minha-conta" component={Account} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></StoreLayout>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><StoreDataProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></StoreDataProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
