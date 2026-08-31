/**
 * Farma+ design reminder: catalogue fidelity depends on a calm white canvas,
 * compact red controls, stable card heights and a real sidebar-to-drawer responsive flow.
 */

import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Filter, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BenefitsStrip, DesktopProductControls, FilterPanel, ProductBanner, ProductCard, ActiveChips, Pagination, SearchEmptyState, SimpleBreadcrumb, SupportBanner, useStoreActions } from "@/components/StoreComponents";
import { useStoreData } from "@/contexts/StoreDataContext";

const PAGE_SIZE = 8;

export default function Products() {
  const [location, navigate] = useLocation();
  const { favoriteIds, toggleFavorite, addToCart } = useStoreActions();
  const { products, categories } = useStoreData();
  const ALL_BRANDS = useMemo(() => Array.from(new Set(products.map((product) => product.brand))).sort(), [products]);
  const [search, setSearch] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(150);
  const [discount, setDiscount] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [sort, setSort] = useState("relevantes");
  const [page, setPage] = useState(1);
  const [listView, setListView] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredBrands = useMemo(() => {
    const query = brandQuery.trim().toLocaleLowerCase("pt-BR");
    if (!query) return ALL_BRANDS;
    return ALL_BRANDS.filter((brand) => brand.toLocaleLowerCase("pt-BR").includes(query));
  }, [brandQuery]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") setFilterOpen(false); };
    document.body.classList.add("no-scroll");
    window.addEventListener("keydown", handler);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", handler);
    };
  }, [filterOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("categoria");
    setSearch(params.get("busca") ?? "");
    setCategoryIds(category && category !== "ofertas" ? [category] : []);
    setDiscount(category === "ofertas" ? "10" : "all");
    setSort(params.get("ordenar") === "mais-vendidos" ? "mais-vendidos" : "relevantes");
    setPage(1);
  }, [location]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const result = products.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.categoryLabel} ${product.brand}`.toLocaleLowerCase("pt-BR").includes(query);
      const matchesCategory = !categoryIds.length || categoryIds.includes(product.categoryId);
      const matchesBrand = !brandIds.length || brandIds.includes(product.brand);
      const matchesPrice = product.price <= priceMax;
      const matchesDiscount = discount === "all" || (product.discount ?? 0) >= Number(discount);
      const matchesAvailability = availability === "all" || product.stock === availability;
      const matchesRating = minRating === "all" || (product.rating ?? 0) >= Number(minRating);
      return matchesQuery && matchesCategory && matchesBrand && matchesPrice && matchesDiscount && matchesAvailability && matchesRating;
    });
    return [...result].sort((a, b) => {
      if (sort === "menor-preco") return a.price - b.price;
      if (sort === "maior-preco") return b.price - a.price;
      if (sort === "mais-vendidos") return b.sales - a.sales;
      if (sort === "descontos") return (b.discount ?? 0) - (a.discount ?? 0);
      if (sort === "melhor-avaliados") return (b.reviewCount - a.reviewCount) || a.id.localeCompare(b.id);
      return b.sales - a.sales;
    });
  }, [availability, brandIds, categoryIds, discount, minRating, priceMax, search, sort]);

  const pages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const clearFilters = () => {
    setCategoryIds([]); setBrandIds([]); setPriceMax(150); setDiscount("all"); setAvailability("all"); setMinRating("all"); setSearch(""); setPage(1); navigate("/produtos");
  };

  const activeChips = [
    ...categoryIds.map((id) => ({ id: `category-${id}`, label: categories.find((category) => category.id === id)?.shortLabel ?? id })),
    ...brandIds.map((brand) => ({ id: `brand-${brand}`, label: brand })),
    ...(discount !== "all" ? [{ id: "discount", label: `${discount}% ou mais` }] : []),
    ...(availability !== "all" ? [{ id: "availability", label: availability }] : []),
    ...(search ? [{ id: "search", label: `Busca: ${search}` }] : []),
  ];

  const removeChip = (id: string) => {
    if (id.startsWith("category-")) setCategoryIds(categoryIds.filter((item) => item !== id.replace("category-", "")));
    if (id.startsWith("brand-")) setBrandIds(brandIds.filter((item) => item !== id.replace("brand-", "")));
    if (id === "discount") setDiscount("all");
    if (id === "availability") setAvailability("all");
    if (id === "search") setSearch("");
    setPage(1);
  };

  return <main className="products-page">
    <SimpleBreadcrumb current="Produtos" />
    <section className="catalog-intro shell"><Link className="back-link page-back" href="/"><ArrowLeft size={14} /> Voltar para a página inicial</Link><p className="eyebrow">Catálogo Farma+</p><h1>Todos os produtos</h1><p>Encontre medicamentos, cuidados e bem-estar em um só lugar.</p></section>
    <section className="shell catalogue-categories"><div className="catalogue-categories__head"><h2>Explore por categoria</h2><span>Arraste para ver mais</span></div><div className="category-rail category-rail--compact">{categories.slice(0, 8).map((category) => <button key={category.id} className="category-tile" onClick={() => { setCategoryIds([category.id]); setPage(1); navigate(`/produtos?categoria=${category.id}`); }}><span className="category-tile__image"><img src={category.image} alt="" loading="lazy" /></span><span>{category.shortLabel}</span></button>)}</div></section>
    <section className="shell"><ProductBanner /></section>

    <div className="mobile-filter-bar shell"><button onClick={() => setFilterOpen(true)}><Filter size={16} /> Filtrar</button><span>{filteredProducts.length.toLocaleString("pt-BR")} produtos</span></div>
    <section className="catalog-layout shell">
      <aside className="catalog-sidebar"><FilterPanel categoryIds={categoryIds} setCategoryIds={setCategoryIds} brandIds={brandIds} setBrandIds={setBrandIds} brandQuery={brandQuery} setBrandQuery={setBrandQuery} filteredBrands={filteredBrands} priceMax={priceMax} setPriceMax={setPriceMax} discount={discount} setDiscount={setDiscount} availability={availability} setAvailability={setAvailability} minRating={minRating} setMinRating={setMinRating} onClear={clearFilters} onApply={() => setPage(1)} /></aside>
      <div className="catalog-results"><DesktopProductControls count={filteredProducts.length} sort={sort} setSort={(value) => { setSort(value); setPage(1); }} list={listView} setList={setListView} /><ActiveChips chips={activeChips} onRemove={removeChip} />{visibleProducts.length ? <div className={listView ? "catalog-grid catalog-grid--list" : "catalog-grid"}>{visibleProducts.map((product, index) => <Fragment key={product.id}><span className="catalog-grid__item"><ProductCard product={product} list={listView} favorite={favoriteIds.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} /></span>{index === 3 && !listView && <div className="inline-banner"><ProductBanner compact /></div>}</Fragment>)}</div> : <SearchEmptyState onClear={clearFilters} />}<Pagination page={page} pages={pages} onChange={setPage} /></div>
    </section>

    {filterOpen && <div className="mobile-filter-backdrop" onClick={() => setFilterOpen(false)}><aside className="mobile-filter-drawer" onClick={(event) => event.stopPropagation()}><div className="mobile-filter-head"><h2>Filtrar por</h2><button onClick={() => setFilterOpen(false)} aria-label="Fechar filtros"><X size={19} /></button></div><FilterPanel categoryIds={categoryIds} setCategoryIds={setCategoryIds} brandIds={brandIds} setBrandIds={setBrandIds} brandQuery={brandQuery} setBrandQuery={setBrandQuery} filteredBrands={filteredBrands} priceMax={priceMax} setPriceMax={setPriceMax} discount={discount} setDiscount={setDiscount} availability={availability} setAvailability={setAvailability} minRating={minRating} setMinRating={setMinRating} onClear={clearFilters} onApply={() => setFilterOpen(false)} /></aside></div>}

    <BenefitsStrip />
    <SupportBanner />
  </main>;
}
