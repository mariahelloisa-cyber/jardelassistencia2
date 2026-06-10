import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ShoppingCart, Wrench, Search, MessageCircle, Clock, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

// IMPORTAÇÃO DAS IMAGENS ORIGINAIS
import logoJadel from './assets/logo-jadel.png';
import fundoHero from './assets/fundo-hero.png'; // A imagem com o celular

export default function AppPublico() {
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Ref para controlar o scroll horizontal dos produtos via setas
  const produtosContainerRef = useRef(null);
  const servicosContainerRef = useRef(null);

  // Carregamento dos dados do Supabase
  useEffect(() => {
    const carregarVitrine = async () => {
      try {
        setLoading(true);
        const [resProdutos, resServicos] = await Promise.all([
          supabase.from('produtos').select('*').order('nome'),
          supabase.from('servicos').select('*').order('nome')
        ]);
        setProdutos(resProdutos.data || []);
        setServicos(resServicos.data || []);
      } catch (err) {
        console.error('Erro geral na vitrine:', err);
      } finally {
        setLoading(false);
      }
    };
    carregarVitrine();
  }, []);

  // Filtros de busca em tempo real para ambas as seções simultaneamente
  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  const servicosFiltrados = servicos.filter(s =>
    s.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    s.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  // Função para rolar o carrossel de produtos para o lado
  const navegarCarrossel = (direcao) => {
    if (produtosContainerRef.current) {
      const valorScroll = 340; // Largura aproximada de um card + gap
      produtosContainerRef.current.scrollBy({
        left: direcao === 'esquerda' ? -valorScroll : valorScroll,
        behavior: 'smooth'
      });
    }
  };

  const iniciarContato = (item, tipo) => {
    const numeroWhatsApp = "5575998386831"; // Substitua pelo seu número real se necessário
    const texto = `Olá! Vi no site o ${tipo} *${item.nome}* e gostaria de fazer um orçamento.`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // Estilo do gradiente dourado premium para os botões e destaques
  const estiloBotaoDourado = {
    backgroundImage: "linear-gradient(135deg, #F5D061 0%, #E6B830 50%, #C4961B 100%)"
  };

  // FUNÇÃO AUXILIAR PARA FORMATAR O PREÇO DE FORMA INTELIGENTE (USADA APENAS NOS PRODUTOS)
  const formatarPrecoSeguro = (item) => {
    let valorOriginal = item.preco ?? item.preço ?? item.valor ?? item.preco_venda;
    if (valorOriginal === undefined || valorOriginal === null || valorOriginal === '') {
      return "Sob Consulta";
    }
    let textoLimpo = String(valorOriginal).trim();
    if (textoLimpo.includes('.') && textoLimpo.includes(',')) {
      textoLimpo = textoLimpo.replace(/\./g, '');
    }
    textoLimpo = textoLimpo.replace(',', '.');
    textoLimpo = textoLimpo.replace(/[^0-9.]/g, '');
    
    const numero = parseFloat(textoLimpo);
    if (isNaN(numero) || numero <= 0) {
      return "Sob Consulta";
    }
    return `R$ ${numero.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased">
      
      {/* =========================================================================
          HEADER - PREMIUM LIGHT COM BLUR E DIVISOR SUAVE
         ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 h-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          {/* Logo no Canto Esquerdo */}
          <a href="#inicio" className="flex items-center gap-2">
            <img src={logoJadel} alt="Jadel Assistência Técnica" className="h-12 w-auto object-contain" />
          </a>

          {/* Links Centrais */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#inicio" className="text-sm font-semibold uppercase tracking-wide text-zinc-700 hover:text-[#C4961B] transition-colors">Início</a>
            <a href="#produtos-vitrine" className="text-sm font-semibold uppercase tracking-wide text-zinc-700 hover:text-[#C4961B] transition-colors">Produtos</a>
            <a href="#servicos-vitrine" className="text-sm font-semibold uppercase tracking-wide text-zinc-700 hover:text-[#C4961B] transition-colors">Serviços</a>
            <a href="#quem-somos" className="text-sm font-semibold uppercase tracking-wide text-zinc-700 hover:text-[#C4961B] transition-colors">Quem Somos</a>
          </nav>

          {/* Botões da Direita */}
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/5575998386831"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wider text-black shadow-md hover:scale-105 transition-transform text-center"
              style={estiloBotaoDourado}
            >
              WhatsApp
            </a>
            {/* ANTES: <a href="/admin" className="..."> */}
<Link
  to="/admin"
  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition-colors"
>
  <Lock className="size-4" />
  Admin
</Link>
          </div>
        </div>
      </header>

      {/* =====================================================================================
          HERO SECTION - DIRETRIZ CLEAR PREMIUM BRANCA
         ===================================================================================== */}
      <section id="inicio" className="relative min-h-[100vh] pt-20 overflow-hidden flex items-center bg-white">
        <img
          src={fundoHero}
          alt="Celular de elite na bancada"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Degradê branco suave integrado na direita para legibilidade premium */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.98) 85%)",
          }}
        />

        <div className="relative z-10 w-full flex items-center justify-end pb-12 px-4 sm:px-8 lg:pr-6 xl:pr-10">
          <div className="w-full lg:w-[46%] text-center flex flex-col items-center lg:ml-auto lg:mr-0">
            <img
              src={logoJadel}
              alt="Jadel Logo"
              className="h-36 w-auto mb-2 object-contain drop-shadow-md mx-auto"
            />

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase leading-[0.90] tracking-tighter text-zinc-950 text-center w-full">
              <span className="whitespace-nowrap">Reparo Especialista</span>
              <br />
              para o seu Celular em boas mãos
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg uppercase tracking-wide text-zinc-800 max-w-xl leading-relaxed text-center mx-auto">
              Serviço rápido e confiável para todas
              <br className="hidden sm:block" /> as marcas. Volte a conectar-se hoje.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <a
                href="https://wa.me/5575998386831"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-black shadow-md hover:scale-105 transition-transform text-center"
                style={estiloBotaoDourado}
              >
                Solicite um Orçamento
              </a>
              <a
                href="#servicos-vitrine"
                className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-black shadow-md hover:scale-105 transition-transform text-center"
                style={estiloBotaoDourado}
              >
                Nossos Serviços
              </a>
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold text-center">
              Assistência Técnica para Celular
            </p>
          </div>
        </div>
      </section>

      {/* BARRA DE PESQUISA UNIFICADA PARA TODA A VITRINE */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 bg-zinc-50">
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Buscar produtos ou serviços..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-full pl-12 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#C4961B] text-zinc-900 placeholder:text-zinc-400 shadow-sm"
          />
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO 1: PRODUTOS (VITRINE COM CARROSSEL HORIZONTAL E SETAS NO CANTO)
         ========================================================================= */}
      <main id="produtos-vitrine" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-zinc-50 overflow-hidden">
        
        {/* TÍTULO DA SEÇÃO E SETAS DE NAVEGAÇÃO LADO A LADO */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#C4961B] uppercase mb-1">Catálogo</p>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Nossos Produtos</h2>
          </div>

          {/* SETAS DE NAVEGAÇÃO DO CANTO SUPERIOR DIREITO */}
          <div className="flex gap-2">
            <button
              onClick={() => navegarCarrossel('esquerda')}
              className="p-2.5 bg-white border border-zinc-200 hover:border-[#C4961B] rounded-full text-zinc-700 hover:text-[#C4961B] shadow-sm transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              title="Anterior"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navegarCarrossel('direita')}
              className="p-2.5 bg-white border border-zinc-200 hover:border-[#C4961B] rounded-full text-zinc-700 hover:text-[#C4961B] shadow-sm transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              title="Próximo"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 text-zinc-400 gap-3">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Carregando produtos...</p>
          </div>
        ) : (
          /* Slider horizontal controlado pelas setas e por scroll gestual fluído */
          <div 
            ref={produtosContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {produtosFiltrados.map(item => {
              // DETECTA SE EXISTE IMAGEM CADASTRADA, SENÃO COLOCA UMA RESERVA DE ALTA QUALIDADE
              const urlImagem = item.imagem_url || item.foto_url || item.imagem || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60";

              return (
                <div 
                  key={item.id} 
                  className="w-[290px] sm:w-[320px] shrink-0 snap-start bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#C4961B] hover:shadow-md transition-all shadow-sm"
                >
                  <div>
                    <div className="aspect-square bg-zinc-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-zinc-100 relative">
                      <img 
                        src={urlImagem} 
                        alt={item.nome} 
                        className="object-cover w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 rounded-lg"
                        onError={(e) => {
                          // Se o link do banco quebrar ou falhar, aplica a imagem padrão imediatamente
                          e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60";
                          e.target.className = "object-cover w-full h-full p-1 rounded-lg";
                        }}
                      />
                      {item.estoque <= 0 && (
                        <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Esgotado</span>
                      )}
                    </div>
                    <h3 className="font-bold text-zinc-900 text-[14px] line-clamp-1 group-hover:text-[#C4961B] transition-colors">{item.nome}</h3>
                    <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed font-medium">{item.descricao || 'Dispositivo premium com total garantia homologada.'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 border-t border-zinc-100 pt-4">
                    <span className="text-base font-bold text-[#C4961B] font-mono">
                      {formatarPrecoSeguro(item)}
                    </span>
                    <button
                      onClick={() => iniciarContato(item, 'produto')}
                      className="p-2.5 bg-zinc-50 hover:bg-[#C4961B] border border-zinc-200 hover:border-amber-500/50 text-zinc-600 hover:text-black rounded-xl transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {produtosFiltrados.length === 0 && (
              <p className="text-sm text-zinc-400 font-medium py-4">Nenhum produto encontrado.</p>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          SEÇÃO 2: SERVIÇOS (GRID FIXO PREMIUM - APENAS OPÇÃO DE ORÇAMENTO)
         ========================================================================= */}
      <section id="servicos-vitrine" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-zinc-50 border-t border-zinc-200/60">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#C4961B] uppercase mb-1">Assistência Especializada</p>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Nossos Serviços</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 text-zinc-400 gap-3">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Carregando serviços...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicosFiltrados.map(item => (
              <div 
                key={item.id} 
                className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between group hover:border-[#C4961B] hover:shadow-md transition-all shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-[#C4961B] mb-4 shadow-inner">
                    <Wrench size={22} />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-base group-hover:text-[#C4961B] transition-colors">{item.nome}</h3>
                  <p className="text-zinc-500 text-xs mt-2 leading-relaxed font-medium">{item.descricao || 'Manutenção corretiva com peças de alto padrão e agilidade.'}</p>
                </div>
                
                {/* BOTÃO INTEGRADO SEM EXIBIÇÃO DE PREÇOS */}
                <div className="flex items-center justify-end mt-6 border-t border-zinc-100 pt-4">
                  <button
                    onClick={() => iniciarContato(item, 'serviço')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-50 hover:bg-[#C4961B] border border-zinc-200 hover:border-[#C4961B] text-zinc-700 hover:text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    Solicitar Orçamento
                  </button>
                </div>
              </div>
            ))}
            {servicosFiltrados.length === 0 && (
              <p className="text-sm text-zinc-400 font-medium py-4 col-span-full">Nenhum serviço encontrado.</p>
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          SEÇÃO QUEM SOMOS
         ========================================================================= */}
      <section id="quem-somos" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-zinc-200 bg-white">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#C4961B] mb-3 uppercase">Quem Somos</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-6">
              A JADEL é referência em reparo de celulares de elite
            </h2>
            <div className="h-1 w-20 rounded-full mb-6" style={estiloBotaoDourado} />
            <p className="text-zinc-600 text-sm leading-relaxed mb-4 font-medium">
              Há mais de uma decade oferecendo serviços premium de assistência técnica.
              Trabalhamos com peças selecionadas, profissionais certificados e atendimento
              personalizado para garantir a melhor experiência ao nosso cliente.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-8 font-medium">
              Nossa missão é devolver seu aparelho como novo — com agilidade,
              transparência e garantia de qualidade em cada serviço.
            </p>
            <a 
              href="https://wa.me/5575998386831" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold text-black shadow-lg hover:scale-105 transition-transform uppercase"
              style={estiloBotaoDourado}
            >
              <MessageCircle size={16} /> Fale Conosco
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 text-center shadow-sm">
              <Clock size={32} className="text-[#C4961B] mx-auto mb-3" strokeWidth={1.5} />
              <div className="text-3xl font-extrabold text-zinc-900 mb-1">24h</div>
              <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Reparo Expresso</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 text-center shadow-sm">
              <Wrench size={32} className="text-[#C4961B] mx-auto mb-3" strokeWidth={1.5} />
              <div className="text-3xl font-extrabold text-zinc-900 mb-1">10 Anos</div>
              <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">De Experiência</div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-10 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        &copy; {new Date().getFullYear()} Jadel Store • Todos os direitos reservados.
      </footer>
    </div>
  );
}