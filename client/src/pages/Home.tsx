/**
 * Farma+ design reminder: mirror the supplied homepage composition with an
 * asymmetric hero, compact commercial cards, restrained red campaigns and generous white space.
 */

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { HeroSideCard, HomePromoBanner, BenefitsStrip, BrandRail, CategoryRail, ProductCard, SectionHeading, SupportBanner, TrustSection, useStoreActions } from "@/components/StoreComponents";
import { editorialBanners, heroSlides } from "@/lib/catalog";
import { useStoreData } from "@/contexts/StoreDataContext";

export default function Home() {
  const [, navigate] = useLocation();
  const [slide, setSlide] = useState(0);
  const { favoriteIds, toggleFavorite, addToCart } = useStoreActions();
  const { products } = useStoreData();
  const deals = products.slice(0, 6);
  const bestSellers = [...products].sort((a, b) => b.sales - a.sales).slice(0, 4);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % heroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  return <main className="home-page">
    <section className="hero shell" aria-label="Destaques Farma+">
      <div className="hero-main">
        <div className="hero-copy"><p className="eyebrow">{heroSlides[slide].eyebrow}</p><h1>{heroSlides[slide].title.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}{index < heroSlides[slide].title.split("\n").length - 1 ? <br /> : null}</span>)}</h1><p>{heroSlides[slide].description}</p><div className="hero-actions"><Link className="primary-button" href="/produtos">{heroSlides[slide].cta} <ArrowRight size={15} /></Link><button className="text-link" onClick={() => navigate("/produtos")}>Conheça todas as categorias <ArrowRight size={14} /></button></div></div>
        <div className="hero-photo"><img src="https://sspark.genspark.ai/cfimages?u1=0kkklBmUXDIKoGBTEJ1L5nNlMZ6zjdKX%2BKj%2BJy80Wr4sivW1I7OmG62prOxyq%2BNS%2BK9hcC%2FXwu9ly%2BSx1r3Rju3VdxAJqqN%2FdtiG8jFAa5nb1%2FW8hpzbdyk6K5xqcGZlgwqziFUWL1T9KlMLn7zfucUPeH7Svjm3rg%3D%3D&u2=1ZFIB5C6uPOFIfvF&width=2560" alt="Farmacêutica sorrindo em uma farmácia" fetchPriority="high" /></div>
        <div className="hero-dots" aria-label="Selecionar destaque">{heroSlides.map((_, index) => <button key={index} className={index === slide ? "is-active" : ""} onClick={() => setSlide(index)} aria-label={`Destaque ${index + 1}`} />)}</div>
        <button className="hero-arrow hero-arrow--left" onClick={() => setSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)} aria-label="Destaque anterior"><ChevronLeft size={16} /></button>
        <button className="hero-arrow hero-arrow--right" onClick={() => setSlide((current) => (current + 1) % heroSlides.length)} aria-label="Próximo destaque"><ChevronRight size={16} /></button>
      </div>
      <div className="hero-side"><HeroSideCard type="vitamins" /><HeroSideCard type="derma" /></div>
    </section>

    <BenefitsStrip />

    <section className="section shell category-section"><SectionHeading title="Compre por categoria" link="Ver todas" onLink={() => navigate("/produtos")} /><CategoryRail /></section>

    <section className="section shell product-showcase"><SectionHeading title="Ofertas do dia" link="Ver todas" onLink={() => navigate("/produtos?categoria=ofertas")} /><div className="product-row">{deals.map((product) => <ProductCard key={product.id} product={product} favorite={favoriteIds.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} />)}<button className="row-arrow row-arrow--right" onClick={() => navigate("/produtos")} aria-label="Ver mais produtos"><ChevronRight size={17} /></button></div></section>

    <HomePromoBanner />

    <section className="section shell product-showcase"><SectionHeading title="Mais vendidos" link="Ver todos" onLink={() => navigate("/produtos?ordenar=mais-vendidos")} /><div className="product-row">{bestSellers.map((product) => <ProductCard key={product.id} product={{ ...product, badge: "Mais vendido" }} favorite={favoriteIds.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} />)}</div></section>

    <section className="section shell editorial-section"><SectionHeading title="Encontre tudo para sua rotina" /><div className="editorial-grid">{editorialBanners.map((banner) => <button key={banner.title} className="editorial-card" onClick={() => navigate("/produtos?categoria=dermocosmeticos")}><img src={banner.image} alt="" loading="lazy" /><span className="editorial-card__shade"></span><span className="editorial-card__copy"><strong>{banner.title}</strong><small>{banner.description}</small><em>{banner.cta} <ArrowRight size={13} /></em></span></button>)}</div></section>

    <section className="section shell brands-section"><SectionHeading title="Marcas que você confia" /><BrandRail /></section>
    <TrustSection />
    <SupportBanner />
  </main>;
}
