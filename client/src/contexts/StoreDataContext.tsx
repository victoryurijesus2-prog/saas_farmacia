import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { categories as fallbackCategories, products as fallbackProducts, type Category, type Product } from "@/lib/catalog";
import { getUser, loadStore, supabase, type DeliveryZone, type StoreSettings } from "@/lib/supabase";

type StoreData = { products: Product[]; categories: Category[]; zones: DeliveryZone[]; settings: StoreSettings | null; user: User | null; loading: boolean; databaseOnline: boolean; refresh: () => Promise<void> };
const Context = createContext<StoreData | null>(null);

export function StoreDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseOnline, setDatabaseOnline] = useState(false);
  const refresh = async () => { const store = await loadStore(); setProducts(store.products); setCategories(store.categories.length ? store.categories : fallbackCategories); setSettings(store.settings); setZones(store.zones); setDatabaseOnline(true); };
  useEffect(() => {
    Promise.all([refresh(), getUser().then(setUser)]).catch((error) => { console.error("Supabase indisponível:", error); setDatabaseOnline(false); }).finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);
  const value = useMemo(() => ({ products, categories, zones, settings, user, loading, databaseOnline, refresh }), [products, categories, zones, settings, user, loading, databaseOnline]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useStoreData() { const value = useContext(Context); if (!value) throw new Error("StoreDataProvider ausente"); return value; }
