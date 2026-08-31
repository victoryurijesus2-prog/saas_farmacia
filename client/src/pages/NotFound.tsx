/**
 * Farma+ design reminder: fallback pages stay quiet, legible and red-led,
 * preserving an easy return to the storefront.
 */

import { Link } from "wouter";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page shell"><SearchX size={42} strokeWidth={1.2} /><p className="eyebrow">Farma+</p><h1>Não encontramos esta página.</h1><p>O conteúdo pode ter mudado de endereço. Volte à loja para continuar.</p><Link className="primary-button" href="/"><ArrowLeft size={15} /> Voltar para a página inicial</Link></main>;
}
