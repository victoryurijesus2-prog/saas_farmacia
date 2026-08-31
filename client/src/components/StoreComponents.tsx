/**
 * Farma+ design reminder: this shared layer follows the supplied references
 * with compact commerce controls, white surfaces, graphite type and Farma Red actions.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Banknote,
  CreditCard,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Facebook,
  Heart,
  House,
  Instagram,
  MapPin,
  Grid3X3,
  QrCode,
  MessageCircle,
  Music2,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  UserRound,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import type { Category, Product } from "@/lib/catalog";
import { buildWhatsAppLink, siteConfig } from "@/lib/siteConfig";
import type { User } from "@supabase/supabase-js";
import { createOrder } from "@/lib/supabase";
import { useStoreData } from "@/contexts/StoreDataContext";

export type CartLine = { product: Product; quantity: number };

export const StoreActionsContext = createContext<{
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  addToCart: (id: string) => void;
  openCart: () => void;
} | null>(null);

export function useStoreActions() {
  const context = useContext(StoreActionsContext);
  if (!context) throw new Error("useStoreActions precisa estar dentro de StoreLayout");
  return context;
}

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private browsing; the in-memory state still works.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const { settings } = useStoreData();
  const name = settings?.name || siteConfig.brand.name;
  return (
    <Link href="/" className="brand-lockup" aria-label={`Ir para a página inicial da ${name}`}>
      <span className="brand-mark" aria-hidden="true">
        <img src={settings?.logo || siteConfig.brand.logoMark} alt="" />
      </span>
      <span className={compact ? "brand-wordmark brand-wordmark--compact" : "brand-wordmark"}>
        {name}
      </span>
    </Link>
  );
}

export function Header({
  user,
  searchValue,
  onSearchChange,
  onSearch,
  cartCount,
  favoriteCount,
  location,
  onLocationChange,
  onOpenCart,
}: {
  user: User | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  cartCount: number;
  favoriteCount: number;
  location: string;
  onLocationChange: (value: string) => void;
  onOpenCart: () => void;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { categories } = useStoreData();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!mobileMenu) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false);
    };
    document.body.classList.add("no-scroll");
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileMenu]);

  const closeMobileMenu = () => setMobileMenu(false);

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="shell utility-bar__inner">
          <nav className="utility-links" aria-label="Links de atendimento">
            <button onClick={() => toast.info("Nosso atendimento funciona de segunda a sábado.")}><CircleHelp size={12} /> Atendimento</button>
            <button onClick={() => toast.info("Acompanhe seu pedido pelo WhatsApp da farmácia.")}><PackageCheck size={12} /> Acompanhar pedido</button>
            <button onClick={() => toast.info(siteConfig.contact.address)}><Store size={12} /> Encontre uma loja</button>
          </nav>
          <a className="utility-login" href="/admin/index.html">Área administrativa <ChevronDown size={11} /></a>
        </div>
      </div>

      <div className="header-main shell">
        <button className="mobile-menu-trigger" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={22} /></button>
        <Logo />
        <form className="header-search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
          <label className="sr-only" htmlFor="global-search">Buscar produtos</label>
          <input id="global-search" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="O que você está procurando?" />
          <button type="submit" aria-label="Buscar"><Search size={18} /></button>
        </form>
        <div className="header-actions">
          <label className="location-control">
            <MapPin size={21} strokeWidth={1.7} />
            <span><small>Entregar em</small><select value={location} onChange={(event) => onLocationChange(event.target.value)} aria-label="Selecionar localização">{siteConfig.location.options.map((option) => <option key={option}>{option}</option>)}</select></span>
          </label>
          <Link className="header-action" href={user ? "/minha-conta" : "/entrar"}><UserRound size={20} /><span>{user ? "Olá" : "Entrar"}<br /><b>{user ? String(user.user_metadata?.full_name || user.email || "Minha conta").split(" ")[0] : "Conta"}</b></span></Link>
          <button className="header-action header-action--icon" onClick={() => toast.info(favoriteCount ? `${favoriteCount} item(ns) salvo(s) nos favoritos.` : "Você ainda não tem favoritos.")} aria-label="Favoritos"><Heart size={20} /><span>Favoritos</span>{favoriteCount > 0 && <em>{favoriteCount}</em>}</button>
          <button className="header-action header-action--icon cart-trigger" onClick={onOpenCart} aria-label="Abrir carrinho"><ShoppingCart size={21} /><span>Carrinho</span>{cartCount > 0 && <em>{cartCount}</em>}</button>
        </div>
      </div>

      <nav className="category-nav" aria-label="Categorias principais">
        <div className="shell category-nav__inner">
          <button className="category-nav__mobile" onClick={() => setMobileMenu(true)}><Menu size={17} /> Categorias</button>
          <div className="category-nav__links">
            {categories.slice(0,6).map((item) => <Link key={item.id} href={`/produtos?categoria=${item.id}`}>{item.label}</Link>)}
          </div>
          <Link className="all-categories" href="/produtos"><span>Ver todas as categorias</span><Grid3X3 size={14} aria-hidden="true" /></Link>
        </div>
      </nav>

      {mobileMenu && <div className="mobile-menu-backdrop" onClick={closeMobileMenu} role="dialog" aria-modal="true" aria-label="Menu lateral">
        <aside className="mobile-menu" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-menu__head"><Logo compact /><button onClick={closeMobileMenu} aria-label="Fechar menu"><X size={20} /></button></div>
          <p className="eyebrow">Comprar por categoria</p>
          {categories.map((item) => <Link key={item.id} href={`/produtos?categoria=${item.id}`} onClick={closeMobileMenu}>{item.label}<ArrowRight size={14} /></Link>)}
          <div className="mobile-menu__section">
            <p className="eyebrow">Atendimento</p>
            <a href={buildWhatsAppLink("Olá! Quero falar com a farmácia.")} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Falar no WhatsApp</a>
            <Link href={user ? "/minha-conta" : "/entrar"} onClick={closeMobileMenu}><UserRound size={14} /> {user ? "Minha conta" : "Entrar ou cadastrar"}</Link>
            <Link href="/" onClick={closeMobileMenu}><House size={14} /> Página inicial</Link>
          </div>
          <div className="mobile-menu__foot"><MapPin size={16} /> {location}</div>
        </aside>
      </div>}
    </header>
  );
}

export function BenefitsStrip() {
  const benefits = [
    { icon: Truck, title: "Entrega rápida", text: "Receba em casa ou retire na loja." },
    { icon: Store, title: "Retire na loja", text: "Compre online e retire com facilidade." },
    { icon: ShieldCheck, title: "Compra segura", text: "Ambiente 100% seguro e confiável." },
    { icon: UserRound, title: "Farmacêutico disponível", text: "Tire suas dúvidas com especialistas." },
  ];
  return <section className="benefits-strip shell" aria-label="Benefícios Farma+">{benefits.map(({ icon: Icon, title, text }) => <div className="benefit-item" key={title}><Icon size={26} strokeWidth={1.45} /><span><strong>{title}</strong><small>{text}</small></span></div>)}</section>;
}

export function CategoryRail({ compact = false, onChoose }: { compact?: boolean; onChoose?: (id: string) => void }) {
  const { categories } = useStoreData();
  return <div className={compact ? "category-rail category-rail--compact" : "category-rail"}>
    {categories.slice(0, 8).map((category) => <Link key={category.id} href={`/produtos?categoria=${category.id}`} className="category-tile" onClick={() => onChoose?.(category.id)}>
      <span className="category-tile__image"><img src={category.image} alt="" loading="lazy" /></span>
      <span>{category.shortLabel}</span>
    </Link>)}
    <Link href="/produtos" className="category-rail__next" aria-label="Ver mais categorias"><ChevronRight size={16} /></Link>
  </div>;
}

export function ProductCard({ product, favorite, onFavorite, onAdd, list = false }: { product: Product; favorite: boolean; onFavorite: () => void; onAdd: () => void; list?: boolean }) {
  return <article className={list ? "product-card product-card--list" : "product-card"}>
    <div className="product-card__visual">
      {product.discount && <span className="discount-badge">-{product.discount}%</span>}
      <button className={favorite ? "favorite-button is-active" : "favorite-button"} onClick={onFavorite} aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}><Heart size={17} fill={favorite ? "currentColor" : "none"} /></button>
      <img src={product.image} alt={product.name} loading="lazy" />
    </div>
    <div className="product-card__content">
      <p className="product-category">{product.categoryLabel}</p>
      <h3>{product.name}</h3>
      <div className="product-rating" aria-label="Avaliação demonstrativa"><span aria-hidden="true">☆ ☆ ☆ ☆ ☆</span><small>{product.reviewCount ? `${product.reviewCount} avaliações` : "Avaliação demonstrativa"}</small></div>
      {product.oldPrice && <del>{formatBRL(product.oldPrice)}</del>}
      <strong className="product-price">{formatBRL(product.price)}</strong>
      <small className="product-installment">{product.installment}</small>
      <div className="product-card__bottom"><span className={product.stock === "Em estoque" ? "stock-label" : "stock-label stock-label--pickup"}>{product.stock}</span><button className="add-button" onClick={onAdd} aria-label={`Adicionar ${product.name} ao carrinho`}><ShoppingCart size={17} /></button></div>
    </div>
  </article>;
}

export function CartDrawer({ open, lines, onClose, onIncrease, onDecrease, onRemove }: { open: boolean; lines: CartLine[]; onClose: () => void; onIncrease: (id: string) => void; onDecrease: (id: string) => void; onRemove: (id: string) => void }) {
  const { user, zones, databaseOnline } = useStoreData();
  const [step, setStep] = useState<"cart" | "fulfillment" | "payment" | "review">("cart");
  const [fulfillment, setFulfillment] = useState<"entrega" | "retirada" | "">("");
  const [payment, setPayment] = useState<"cartao" | "pix" | "dinheiro" | "">("");
  const [address, setAddress] = useState({ street: "", number: "", district: "", reference: "" });
  const [customer, setCustomer] = useState({ name: String(user?.user_metadata?.full_name || ""), phone: String(user?.user_metadata?.phone || ""), email: user?.email || "" });
  const [zoneId, setZoneId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (user) setCustomer({ name: String(user.user_metadata?.full_name || ""), phone: String(user.user_metadata?.phone || ""), email: user.email || "" }); }, [user]);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const closeDrawer = () => { setStep("cart"); setFulfillment(""); setPayment(""); setAddress({ street: "", number: "", district: "", reference: "" }); setZoneId(""); onClose(); };
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.body.classList.add("no-scroll");
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  if (!open) return null;
  const customerValid = customer.name.trim().length >= 2 && customer.phone.replace(/\D/g, "").length >= 10;
  const canGoToPayment = customerValid && (fulfillment === "retirada" || (fulfillment === "entrega" && zoneId && address.street.trim() && address.number.trim() && address.district.trim()));
  const itemsText = lines.map((line) => `${line.quantity}x ${line.product.name} — ${formatBRL(line.product.price * line.quantity)}`).join("\n");
  const checkoutMessage = `Olá! Gostaria de finalizar um pedido na Farma+\n\nItens:\n${itemsText}\n\nSubtotal: ${formatBRL(subtotal)}\nModalidade: ${fulfillment === "entrega" ? "Entrega" : "Retirada na loja"}${fulfillment === "entrega" ? `\nEndereço: ${address.street}, ${address.number} — ${address.district}${address.reference ? ` (${address.reference})` : ""}` : ""}\nPagamento: ${payment === "cartao" ? "Cartão" : payment === "pix" ? "Pix" : "Dinheiro"}\n\nPodem me ajudar?`;
  const finishOrder = async () => {
    if (!databaseOnline) return toast.error("O banco de dados está indisponível. O pedido não foi enviado.");
    setSubmitting(true);
    try {
      const receipt: any = await createOrder({ name: customer.name, phone: customer.phone, email: customer.email, address: `${address.street}, ${address.number} — ${address.district}${address.reference ? ` (${address.reference})` : ""}`, deliveryMode: fulfillment === "entrega" ? "delivery" : "pickup", deliveryZoneId: zoneId || null, paymentMethod: payment === "cartao" ? "Cartão de crédito" : payment === "pix" ? "PIX" : "Dinheiro", couponCode, items: lines.map((line) => ({ id: line.product.id, qty: line.quantity })) });
      lines.forEach((line) => onRemove(line.product.id));
      const number = receipt?.order_number ? `NF-${String(receipt.order_number).padStart(6, "0")}` : "registrado";
      window.open(buildWhatsAppLink(`${checkoutMessage}\n\nPedido ${number} registrado no sistema.`), "_blank", "noopener,noreferrer");
      toast.success(`Pedido ${number} criado com sucesso.`); closeDrawer();
    } catch (error: any) { toast.error(error.message || "Não foi possível criar o pedido."); }
    finally { setSubmitting(false); }
  };
  const goBack = () => {
    if (step === "payment") setStep(fulfillment === "entrega" ? "fulfillment" : "fulfillment");
    else if (step === "review") setStep("payment");
    else if (step === "fulfillment") setStep("cart");
  };
  return <div className="drawer-backdrop" onClick={closeDrawer}>
    <aside className="cart-drawer" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Carrinho de compras">
      <div className="drawer-head"><div><p className="eyebrow">{step === "cart" ? "Seu carrinho" : step === "fulfillment" ? "Passo 1 de 3" : step === "payment" ? "Passo 2 de 3" : "Passo 3 de 3"}</p><h2>{step === "cart" ? (lines.length ? `${lines.length} item${lines.length > 1 ? "s" : ""}` : "Carrinho vazio") : step === "fulfillment" ? "Entrega ou retirada?" : step === "payment" ? "Como vai pagar?" : "Revise seu pedido"}</h2></div><button onClick={closeDrawer} aria-label="Fechar carrinho"><X size={20} /></button></div>
      <ol className="checkout-progress" aria-label="Etapas do pedido">
        <li className={step === "cart" || step === "fulfillment" || step === "payment" || step === "review" ? "is-on" : ""}><span>1</span> Carrinho</li>
        <li className={step === "fulfillment" || step === "payment" || step === "review" ? "is-on" : ""}><span>2</span> Recebimento</li>
        <li className={step === "payment" || step === "review" ? "is-on" : ""}><span>3</span> Pagamento</li>
      </ol>
      {lines.length ? (
        <>
          {step === "cart" && (
            <div className="checkout-step">
              <div className="cart-lines">{lines.map(({ product, quantity }) => <div className="cart-line" key={product.id}><img src={product.image} alt="" /><div className="cart-line__info"><h3>{product.name}</h3><strong>{formatBRL(product.price)}</strong><div className="quantity-stepper"><button onClick={() => onDecrease(product.id)} aria-label="Diminuir quantidade"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => onIncrease(product.id)} aria-label="Aumentar quantidade"><Plus size={13} /></button></div></div><button className="cart-line__remove" onClick={() => onRemove(product.id)} aria-label={`Remover ${product.name}`}><X size={15} /></button></div>)}</div>
              <div className="cart-summary"><span>Subtotal</span><strong>{formatBRL(subtotal)}</strong></div>
              <p className="cart-note">Em seguida você escolhe entrega ou retirada e a forma de pagamento.</p>
              <button className="primary-button cart-checkout" onClick={() => setStep("fulfillment")}>Continuar <ArrowRight size={16} /></button>
              <button className="secondary-button cart-continue" onClick={closeDrawer}>Continuar comprando</button>
            </div>
          )}
          {step === "fulfillment" && (
            <div className="checkout-step">
              <button className="back-link" onClick={goBack}><ArrowLeft size={14} /> Voltar ao carrinho</button>
              <fieldset><legend>Recebimento</legend>
                <label className={fulfillment === "entrega" ? "choice-card is-selected" : "choice-card"}>
                  <input type="radio" name="fulfillment" checked={fulfillment === "entrega"} onChange={() => setFulfillment("entrega")} />
                  <Truck size={18} />
                  <span><strong>Entrega</strong><small>Receba no endereço informado.</small></span>
                </label>
                <label className={fulfillment === "retirada" ? "choice-card is-selected" : "choice-card"}>
                  <input type="radio" name="fulfillment" checked={fulfillment === "retirada"} onChange={() => setFulfillment("retirada")} />
                  <Store size={18} />
                  <span><strong>Retirada na loja</strong><small>Combinaremos a unidade no atendimento.</small></span>
                </label>
              </fieldset>
              {fulfillment === "entrega" && (
                <fieldset className="address-fields">
                  <legend>Endereço de entrega</legend>
                  <label><span>Região de entrega</span><select value={zoneId} onChange={(event) => setZoneId(event.target.value)}><option value="">Selecione sua região</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name} — {formatBRL(zone.fee)}</option>)}</select></label>
                  <label><span>Rua / avenida</span><input value={address.street} onChange={(event) => setAddress((current) => ({ ...current, street: event.target.value }))} placeholder="Ex.: Av. Brasil" /></label>
                  <div className="address-row">
                    <label><span>Número</span><input value={address.number} onChange={(event) => setAddress((current) => ({ ...current, number: event.target.value }))} placeholder="123" /></label>
                    <label><span>Bairro</span><input value={address.district} onChange={(event) => setAddress((current) => ({ ...current, district: event.target.value }))} placeholder="Centro" /></label>
                  </div>
                  <label><span>Referência (opcional)</span><input value={address.reference} onChange={(event) => setAddress((current) => ({ ...current, reference: event.target.value }))} placeholder="Próximo à padaria" /></label>
                </fieldset>
              )}
              <fieldset className="address-fields"><legend>Seus dados</legend><label><span>Nome completo</span><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} /></label><div className="address-row"><label><span>WhatsApp</span><input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} inputMode="tel" /></label><label><span>E-mail (opcional)</span><input value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} type="email" /></label></div><label><span>Cupom (opcional)</span><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="FARMA10" /></label></fieldset>
              <button className="primary-button cart-checkout" disabled={!fulfillment || !canGoToPayment} onClick={() => { if (!canGoToPayment) { toast.warning("Preencha o endereço para entrega."); return; } setStep("payment"); }}>Ir para pagamento <ArrowRight size={16} /></button>
            </div>
          )}
          {step === "payment" && (
            <div className="checkout-step">
              <button className="back-link" onClick={goBack}><ArrowLeft size={14} /> Voltar para recebimento</button>
              <fieldset><legend>Forma de pagamento</legend>
                <label className={payment === "cartao" ? "choice-card is-selected" : "choice-card"}>
                  <input type="radio" name="payment" checked={payment === "cartao"} onChange={() => setPayment("cartao")} />
                  <CreditCard size={18} />
                  <span><strong>Cartão</strong><small>Crédito ou débito no atendimento.</small></span>
                </label>
                <label className={payment === "pix" ? "choice-card is-selected" : "choice-card"}>
                  <input type="radio" name="payment" checked={payment === "pix"} onChange={() => setPayment("pix")} />
                  <QrCode size={18} />
                  <span><strong>Pix</strong><small>Pagamento rápido e seguro.</small></span>
                </label>
                <label className={payment === "dinheiro" ? "choice-card is-selected" : "choice-card"}>
                  <input type="radio" name="payment" checked={payment === "dinheiro"} onChange={() => setPayment("dinheiro")} />
                  <Banknote size={18} />
                  <span><strong>Dinheiro</strong><small>Combine o valor na retirada ou entrega.</small></span>
                </label>
              </fieldset>
              <button className="primary-button cart-checkout" disabled={!payment} onClick={() => { if (!payment) { toast.warning("Selecione uma forma de pagamento."); return; } setStep("review"); }}>Revisar pedido <ArrowRight size={16} /></button>
            </div>
          )}
          {step === "review" && (
            <div className="checkout-step">
              <button className="back-link" onClick={goBack}><ArrowLeft size={14} /> Voltar para pagamento</button>
              <div className="review-summary">
                <p className="eyebrow">Resumo</p>
                <ul className="review-lines">
                  {lines.map(({ product, quantity }) => <li key={product.id}><span>{quantity}× {product.name}</span><strong>{formatBRL(product.price * quantity)}</strong></li>)}
                </ul>
                <dl className="review-meta">
                  <div><dt>Modalidade</dt><dd>{fulfillment === "entrega" ? "Entrega" : "Retirada na loja"}</dd></div>
                  {fulfillment === "entrega" && <div><dt>Endereço</dt><dd>{address.street}, {address.number} — {address.district}{address.reference ? ` (${address.reference})` : ""}</dd></div>}
                  <div><dt>Pagamento</dt><dd>{payment === "cartao" ? "Cartão" : payment === "pix" ? "Pix" : "Dinheiro"}</dd></div>
                </dl>
                <div className="checkout-total"><span>Subtotal</span><strong>{formatBRL(subtotal)}</strong></div>
              </div>
              <button className="primary-button cart-checkout" disabled={submitting} onClick={finishOrder}><MessageCircle size={16} /> {submitting ? "Registrando pedido..." : "Confirmar e enviar pelo WhatsApp"}</button>
            </div>
          )}
        </>
      ) : (
        <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1.4} /><p>Adicione produtos para começar sua compra.</p><button className="primary-button" onClick={closeDrawer}>Ver produtos</button></div>
      )}
    </aside>
  </div>;
}

export function BackToHomeButton() {
  const location = useLocation()[0];
  const isHome = location === "/" || location === "";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  if (isHome) return null;
  return (
    <Link href="/" className={visible ? "back-to-home is-visible" : "back-to-home"} aria-label="Voltar para a página inicial">
      <ArrowLeft size={17} />
      <span>Início</span>
    </Link>
  );
}

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 800);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <button type="button" className={visible ? "scroll-top is-visible" : "scroll-top"} onClick={goTop} aria-label="Voltar ao topo da página">
      <ArrowUp size={17} />
    </button>
  );
}

export function WhatsAppButton() {
  const { settings } = useStoreData();
  return <a className="whatsapp-float" href={buildWhatsAppLink("Olá! Preciso de ajuda para comprar.",settings?.whatsapp)} target="_blank" rel="noreferrer" aria-label="Falar com a farmácia pelo WhatsApp"><MessageCircle size={22} strokeWidth={1.8} /></a>;
}

const PAYMENT_SEALS = [
  { name: "VISA", className: "payment-seal--visa" },
  { name: "Master", className: "payment-seal--master" },
  { name: "Elo", className: "payment-seal--elo" },
  { name: "Hiper", className: "payment-seal--hiper" },
  { name: "Amex", className: "payment-seal--amex" },
  { name: "PIX", className: "payment-seal--pix" },
  { name: "Boleto", className: "payment-seal--boleto" },
  { name: "Dinheiro", className: "payment-seal--cash" },
];

export function Footer() {
  return <footer className="site-footer">
    <div className="newsletter-band"><div className="shell newsletter-band__inner"><div><p className="eyebrow">Fique por dentro</p><h2>Receba ofertas e novidades</h2><p>Cadastre-se e aproveite descontos exclusivos.</p></div><form onSubmit={(event) => { event.preventDefault(); toast.success("Cadastro realizado. Obrigado!"); }}><label className="sr-only" htmlFor="newsletter-email">Seu melhor e-mail</label><input id="newsletter-email" type="email" required placeholder="Seu melhor e-mail" /><button type="submit">Cadastrar</button></form><div className="partner-note"><p className="eyebrow">Plataforma adaptável</p><p>Pronto para apresentar para qualquer farmácia interessada.</p><span>Compra simples, cuidado próximo.</span></div></div></div>
    <div className="footer-main shell"><div className="footer-column footer-brand"><Logo compact /><p>Mais cuidado, mais perto de você.</p><small>{siteConfig.contact.hours}</small></div><FooterColumn title="Institucional" links={["Quem somos", "Nossas lojas", "Trabalhe conosco", "Imprensa"]} /><FooterColumn title="Atendimento" links={["Central de ajuda", "Fale conosco", "Trocas e devoluções", "Acompanhar pedido"]} /><FooterColumn title="Políticas" links={["Política de privacidade", "Política de cookies", "Termos e condições", "LGPD"]} /><div className="footer-column footer-payments"><h3>Formas de pagamento</h3><p className="footer-payments__hint">Cartão, Pix e Dinheiro — escolha na finalização do pedido.</p><div className="payment-list payment-seals">{PAYMENT_SEALS.map((method) => <span className={`payment-seal ${method.className}`} key={method.name}>{method.name}</span>)}</div><div className="payment-methods-inline" aria-label="Resumo das opções de pagamento"><span><CreditCard size={13} /> Cartão</span><span><QrCode size={13} /> Pix</span><span><Banknote size={13} /> Dinheiro</span></div><h3 className="social-title">Redes sociais</h3><div className="social-list"><button aria-label="Instagram" onClick={() => toast.info("Instagram Farma+ em breve.")}><Instagram size={15} /></button><button aria-label="Facebook" onClick={() => toast.info("Facebook Farma+ em breve.")}><Facebook size={15} /></button><button aria-label="YouTube" onClick={() => toast.info("YouTube Farma+ em breve.")}><Youtube size={15} /></button><button aria-label="TikTok" onClick={() => toast.info("TikTok Farma+ em breve.")}><Music2 size={15} /></button></div></div></div>
    <div className="footer-bottom shell"><p>{siteConfig.legal.notice}</p><p>{siteConfig.legal.cnpj} · © {new Date().getFullYear()} Farma+. Todos os direitos reservados.</p></div>
  </footer>;
}

function FooterColumn({ title, links }: { title: string; links: string[] }) { return <div className="footer-column"><h3>{title}</h3>{links.map((link) => <button key={link} onClick={() => toast.info(`${link}: conteúdo demonstrativo.`)}>{link}</button>)}</div>; }

export function FilterPanel({ categoryIds, setCategoryIds, brandIds, setBrandIds, brandQuery, setBrandQuery, filteredBrands, priceMax, setPriceMax, discount, setDiscount, availability, setAvailability, minRating, setMinRating, onClear, onApply }: { categoryIds: string[]; setCategoryIds: (value: string[]) => void; brandIds: string[]; setBrandIds: (value: string[]) => void; brandQuery: string; setBrandQuery: (value: string) => void; filteredBrands: string[]; priceMax: number; setPriceMax: (value: number) => void; discount: string; setDiscount: (value: string) => void; availability: string; setAvailability: (value: string) => void; minRating: string; setMinRating: (value: string) => void; onClear: () => void; onApply?: () => void }) {
  const { categories } = useStoreData();
  const toggle = (list: string[], value: string, setter: (value: string[]) => void) => setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const visibleBrands = filteredBrands ?? brandsForFilter;
  return <div className="filter-panel"><div className="filter-panel__top"><h2>Filtrar por</h2><button onClick={onClear}>Limpar filtros</button></div><FilterGroup title="Categorias"><div className="filter-checks">{categories.slice(0, 7).map((category) => <label key={category.id}><input type="checkbox" checked={categoryIds.includes(category.id)} onChange={() => toggle(categoryIds, category.id, setCategoryIds)} /> <span>{category.label}</span></label>)}</div></FilterGroup><FilterGroup title="Marcas"><div className="brand-search"><Search size={14} /><input value={brandQuery} onChange={(event) => setBrandQuery(event.target.value)} placeholder="Buscar marca" /></div><div className="filter-checks filter-checks--brands">{visibleBrands.length ? visibleBrands.map((brand) => <label key={brand}><input type="checkbox" checked={brandIds.includes(brand)} onChange={() => toggle(brandIds, brand, setBrandIds)} /> <span>{brand}</span></label>) : <p className="filter-empty">Nenhuma marca encontrada.</p>}</div></FilterGroup><FilterGroup title="Faixa de preço"><div className="price-inputs"><input type="text" value="R$ 0" readOnly aria-label="Preço mínimo" /><input type="text" value={`R$ ${priceMax}`} readOnly aria-label="Preço máximo" /></div><input className="price-range" type="range" min="10" max="150" step="5" value={priceMax} onChange={(event) => setPriceMax(Number(event.target.value))} /><div className="range-labels"><span>R$ 0</span><span>R$ 150+</span></div></FilterGroup><FilterGroup title="Descontos"><div className="filter-checks">{[["all", "Todos"], ["10", "10% ou mais"], ["20", "20% ou mais"], ["30", "30% ou mais"], ["40", "40% ou mais"]].map(([value, label]) => <label key={value}><input type="radio" name="discount" checked={discount === value} onChange={() => setDiscount(value)} /> <span>{label}</span></label>)}</div></FilterGroup><FilterGroup title="Disponibilidade"><div className="filter-checks"><label><input type="radio" name="availability" checked={availability === "all"} onChange={() => setAvailability("all")} /> <span>Todos</span></label><label><input type="radio" name="availability" checked={availability === "Em estoque"} onChange={() => setAvailability("Em estoque")} /> <span>Entrega hoje</span></label><label><input type="radio" name="availability" checked={availability === "Retire hoje"} onChange={() => setAvailability("Retire hoje")} /> <span>Retire na loja</span></label></div></FilterGroup><FilterGroup title="Avaliação"><div className="filter-checks">{[["all", "Todas"], ["5", "★★★★★"], ["4", "★★★★☆ ou mais"], ["3", "★★★☆☆ ou mais"]].map(([value, label]) => <label key={value}><input type="radio" name="rating" checked={minRating === value} onChange={() => setMinRating(value)} /> <span>{label}</span></label>)}</div></FilterGroup>{onApply && <button className="primary-button filter-apply" onClick={onApply}>Aplicar filtros</button>}</div>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) { return <section className="filter-group"><h3>{title}<ChevronDown size={13} /></h3>{children}</section>; }

const brandsForFilter = ["Cimed", "Vichy", "Nivea", "Needs", "Bepantol", "Pampers"];

export function ProductBanner({ compact = false }: { compact?: boolean }) { return <div className={compact ? "product-banner product-banner--compact" : "product-banner"}><div><p className="eyebrow">Seleção Farma+</p><h2>Cuidado completo<br /><span>com até 30% OFF</span></h2><p>Ofertas selecionadas para cuidar de toda a família.</p><Link className="white-button" href="/produtos?categoria=ofertas">Aproveitar ofertas <ArrowRight size={14} /></Link></div><div className="product-banner__bottles" aria-hidden="true"><span className="bottle bottle--blue"></span><span className="bottle bottle--white"></span><span className="bottle bottle--green"></span><span className="bottle bottle--red"></span></div></div>; }

// Calcula contagem regressiva até a próxima meia-noite (horário local do usuário).
const computeSecondsUntilMidnight = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
};

export function SaleCountdown() {
  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window === "undefined") return 6 * 60 * 60;
    const now = Date.now();
    const stored = window.localStorage.getItem("farmais-countdown-target");
    if (stored) {
      const target = Number(stored);
      if (Number.isFinite(target) && target > now) return Math.floor((target - now) / 1000);
    }
    const target = now + computeSecondsUntilMidnight() * 1000;
    window.localStorage.setItem("farmais-countdown-target", String(target));
    return computeSecondsUntilMidnight();
  });
  const ended = remaining <= 0;
  useEffect(() => {
    const timer = window.setInterval(() => {
      const seconds = computeSecondsUntilMidnight();
      if (typeof window !== "undefined") window.localStorage.setItem("farmais-countdown-target", String(Date.now() + seconds * 1000));
      setRemaining(seconds);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  if (ended) return <div className="sale-countdown sale-countdown--ended" aria-live="polite"><small>O intervalo renova à meia-noite —</small><strong>veja as ofertas do dia seguinte</strong></div>;
  return <div className="sale-countdown" aria-label={`Oferta termina em ${hours} horas, ${minutes} minutos e ${seconds} segundos`} aria-live="polite"><small>Oferta termina em</small><strong><span>{hours}</span><i>:</i><span>{minutes}</span><i>:</i><span>{seconds}</span></strong></div>;
}

export function HomePromoBanner() { return <section className="home-promo shell"><div className="home-promo__copy"><p className="eyebrow">Clube Farma+</p><h2>Clube Farma+ — preços exclusivos para cuidar de você</h2><p>Descontos, ofertas especiais e benefícios para o ano todo.</p></div><SaleCountdown /><button className="outline-light-button" onClick={() => toast.success("Em breve você poderá participar do Clube Farma+.")}>Quero participar</button></section>; }

export function SupportBanner() { return <section className="support-banner shell"><div className="support-banner__copy"><p className="eyebrow">Atendimento próximo</p><h2>Precisa de ajuda para comprar?</h2><p>Fale com nossa equipe pelo WhatsApp.</p><a className="outline-button" href={buildWhatsAppLink("Olá! Preciso de ajuda para comprar na Farma+.")} target="_blank" rel="noreferrer"><Smartphone size={16} /> Falar com a farmácia</a></div><div className="support-banner__photo"><img src="https://images.unsplash.com/photo-1580281658628-526f91b34a38?auto=format&fit=crop&w=1200&q=85" alt="Farmacêutica pronta para atender" loading="lazy" /></div></section>; }

export function TrustSection() { return <section className="trust-section shell"><div className="trust-heading"><p className="eyebrow">Compromisso Farma+</p><h2>Sua saúde em boas mãos</h2></div><div className="trust-grid"><TrustItem icon={UserRound} title="Suporte de quem entende" text="Farmacêuticos prontos para te orientar sempre que precisar." /><TrustItem icon={ShieldCheck} title="Seus dados protegidos" text="Pagamentos seguros e privacidade garantida em todas as etapas." /><TrustItem icon={BadgeCheck} title="Farmácias parceiras licenciadas" text="Somente farmácias e drogarias confiáveis e regulamentadas." /></div></section>; }
function TrustItem({ icon: Icon, title, text }: { icon: typeof UserRound; title: string; text: string }) { return <div className="trust-item"><Icon size={27} strokeWidth={1.35} /><div><h3>{title}</h3><p>{text}</p></div></div>; }

export function SimpleBreadcrumb({ current }: { current: string }) { return <nav className="breadcrumb shell" aria-label="Breadcrumb"><Link href="/"><House size={13} /> Início</Link><span>/</span><span>{current}</span></nav>; }

export function HeroSideCard({ type }: { type: "vitamins" | "derma" }) { const [, navigate] = useLocation(); return type === "vitamins" ? <div className="hero-side-card hero-side-card--red"><div><p className="eyebrow">Até</p><strong>30% OFF</strong><span>em vitaminas</span><button onClick={() => navigate("/produtos?categoria=vitaminas")}>Ver ofertas <ArrowRight size={12} /></button></div><div className="vitamin-illustration" aria-hidden="true"><span></span><span></span><span></span></div></div> : <div className="hero-side-card hero-side-card--derma"><div><p className="eyebrow">Dermocosméticos</p><strong>selecionados</strong><span>Cuidados para todos os tipos de pele.</span><button onClick={() => navigate("/produtos?categoria=dermocosmeticos")}>Conheça <ArrowRight size={12} /></button></div><img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=85" alt="Produtos de dermocosméticos" loading="lazy" /></div>; }

export function BrandRail() { return <div className="brand-rail">{["LA ROCHE-POSAY", "VICHY", "NIVEA", "CIMED", "needs", "ACHÉ", "BAYER"].map((brand) => <span key={brand}>{brand}</span>)}<button aria-label="Avançar marcas" onClick={() => toast.info("Mais marcas parceiras em breve.")}><ChevronRight size={16} /></button></div>; }

export function SectionHeading({ eyebrow, title, link, onLink }: { eyebrow?: string; title: string; link?: string; onLink?: () => void }) { return <div className="section-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{link && <button onClick={onLink}>{link} <ArrowRight size={14} /></button>}</div>; }

export function DesktopProductControls({ count, sort, setSort, list, setList }: { count: number; sort: string; setSort: (value: string) => void; list: boolean; setList: (value: boolean) => void }) { return <div className="catalog-controls"><strong>{count.toLocaleString("pt-BR")} produtos encontrados</strong><div className="catalog-controls__right"><div className="view-toggle"><button className={!list ? "is-active" : ""} onClick={() => setList(false)} aria-label="Visualização em grade"><span className="grid-icon">▪▪<br />▪▪</span></button><button className={list ? "is-active" : ""} onClick={() => setList(true)} aria-label="Visualização em lista"><span className="list-icon">—<br />—<br />—</span></button></div><label>Ordenar por:<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="relevantes">Mais relevantes</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="mais-vendidos">Mais vendidos</option><option value="descontos">Maiores descontos</option><option value="melhor-avaliados">Melhor avaliados</option></select></label></div></div>; }

export function ActiveChips({ chips, onRemove }: { chips: { id: string; label: string }[]; onRemove: (id: string) => void }) { if (!chips.length) return null; return <div className="active-chips">{chips.map((chip) => <button key={chip.id} onClick={() => onRemove(chip.id)}>{chip.label} <X size={12} /></button>)}</div>; }

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (value: number) => void }) { return <nav className="pagination" aria-label="Paginação"><button disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={14} /> Anterior</button><div>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? "is-active" : ""} onClick={() => onChange(number)}>{number}</button>)}</div><button disabled={page === pages} onClick={() => onChange(page + 1)}>Próxima <ChevronRight size={14} /></button></nav>; }

export function SearchEmptyState({ onClear }: { onClear: () => void }) { return <div className="empty-state"><Search size={34} strokeWidth={1.3} /><h2>Nenhum produto encontrado</h2><p>Tente buscar por outro nome ou limpar os filtros aplicados.</p><button className="secondary-button" onClick={onClear}>Limpar filtros</button></div>; }
