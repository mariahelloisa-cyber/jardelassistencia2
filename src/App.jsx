import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

// Todos os ícones necessários para o funcionamento do painel
import { 
  Users, Package, Wrench, Smartphone, Home,
  ShieldCheck, ShoppingCart, DollarSign, 
  ClipboardList, Monitor, LogOut, Upload, Loader2, X, Lock
} from 'lucide-react';

// Páginas externas importadas
import Vendas from './Pages/vendas';
import HistoricoVendas from './Pages/HistoricoVendas';
import Garantias from './Pages/Garantias';

// =========================================================================
// TELA DE LOGIN PREMIUM DO ADMINISTRADOR
// =========================================================================
const LoginAdmin = () => {
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
    } catch (err) {
      setErro(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl text-[#f4bc06] mb-3 border border-amber-500/20">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Painel de Controle</h2>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mt-1 font-semibold">Jadel Assistência Técnica</p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold mb-5 text-center uppercase tracking-wide">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-sm">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">E-mail Corporativo</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@jadel.com" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Senha de Acesso</label>
            <input 
              type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg text-xs uppercase tracking-widest cursor-pointer mt-2 disabled:opacity-50">
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider">
            ← Voltar para o Site Público
          </Link>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para os botões do Menu Lateral
const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-4 px-5 py-3 rounded-xl font-medium text-sm transition-all ${active ? 'bg-amber-500/10 text-[#f4bc06] border-l-2 border-[#f4bc06]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
    <Icon size={16} />
    <span>{label}</span>
  </Link>
);

// ==========================================
// 1. DASHBOARD COMPLETO
// ==========================================
const Dashboard = () => {
  const [totalClientes, setTotalClientes] = React.useState(0);
  const [totalProdutos, setTotalProdutos] = React.useState(0);
  const [totalOS, setTotalOS] = React.useState(0);
  const [totalServicos, setTotalServicos] = React.useState(0);
  
  const [vendasHojeQtd, setVendasHojeQtd] = React.useState(0);
  const [receitaHoje, setReceitaHoje] = React.useState(0);
  const [garantiasAtivasQtd, setGarantiasAtivasQtd] = React.useState(0);

  React.useEffect(() => {
    const carregarContadores = async () => {
      const { count: cCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
      const { count: osCount } = await supabase.from('os').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('servicos').select('*', { count: 'exact', head: true });

      setTotalClientes(cCount || 0);
      setTotalProdutos(pCount || 0);
      setTotalOS(osCount || 0);
      setTotalServicos(sCount || 0);

      const hojeLocal = new Date();
      const ano = hojeLocal.getFullYear();
      const mes = String(hojeLocal.getMonth() + 1).padStart(2, '0');
      const dia = String(hojeLocal.getDate()).padStart(2, '0');
      
      const inicioDia = `${ano}-${mes}-${dia}T00:00:00.000Z`;
      const fimDia = `${ano}-${mes}-${dia}T23:59:59.999Z`;

      try {
        const { data: vendasDeHoje } = await supabase.from('vendas').select('valor_total').gte('created_at', inicioDia).lte('created_at', fimDia);
        if (vendasDeHoje) {
          setVendasHojeQtd(vendasDeHoje.length);
          const totalSoma = vendasDeHoje.reduce((acc, venda) => acc + parseFloat(venda.valor_total || 0), 0);
          setReceitaHoje(totalSoma);
        }
      } catch (err) { console.error(err); }

      try {
        const { data: todasOSGarantia } = await supabase.from('os').select('data_final, garantia_dias').not('data_final', 'is', null);
        if (todasOSGarantia) {
          const ativas = todasOSGarantia.filter(item => {
            if (!item.data_final || !item.garantia_dias) return false;
            const apenasDataStr = item.data_final.split('T')[0];
            const [anoOS, mesOS, diaOS] = apenasDataStr.split('-');
            const entrega = new Date(anoOS, mesOS - 1, diaOS, 0, 0, 0);
            const dias = parseInt(item.garantia_dias) || 0;
            entrega.setDate(entrega.getDate() + dias);
            const hojeZeroHoras = new Date();
            hojeZeroHoras.setHours(0, 0, 0, 0);
            return entrega >= hojeZeroHoras;
          });
          setGarantiasAtivasQtd(ativas.length);
        }
      } catch (err) { console.error(err); }
    };
    carregarContadores();
  }, []);

  const cards = [
    { title: "Clientes Cadastrados", value: totalClientes, icon: Users },
    { title: "Produtos no Catálogo", value: totalProdutos, icon: Package },
    { title: "Serviços Mapeados", value: totalServicos, icon: Wrench },
    { title: "OS em Aberto", value: totalOS, icon: Smartphone },
    { title: "Garantias Ativas", value: garantiasAtivasQtd, icon: ShieldCheck },
    { title: "Vendas Realizadas Hoje", value: vendasHojeQtd, icon: ShoppingCart },
  ];

  return (
    <div className="p-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Visão geral do ecossistema em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-zinc-900 border border-zinc-800/60 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">{card.title}</span>
                <Icon size={18} className="text-[#f4bc06]" />
              </div>
              <span className="text-3xl font-black text-white font-mono">{card.value}</span>
            </div>
          );
        })}
        <div className="bg-gradient-to-br from-[#f4bc06] to-amber-500 p-6 rounded-2xl flex flex-col justify-between h-32 shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-zinc-950 text-[10px] font-bold tracking-wider uppercase">Faturamento de Hoje</span>
            <DollarSign size={18} className="text-zinc-950" />
          </div>
          <span className="text-2xl font-black text-zinc-950 font-mono">
            R$ {receitaHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CLIENTES COMPLETO (COM CADASTRO E EDIÇÃO)
// ==========================================
const Clientes = () => {
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [clienteSendoEditado, setClienteSendoEditado] = React.useState(null);

  const [nome, setNome] = React.useState('');
  const [telefone, setTelefone] = React.useState('');
  const [email, setEmail] = React.useState('');

  const buscarClientes = async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes(data || []);
    setLoading(false);
  };

  React.useEffect(() => { buscarClientes(); }, []);

  const fecharModal = () => {
    setNome(''); setTelefone(''); setEmail('');
    setClienteSendoEditado(null); setModalAberto(false);
  };

  const prepararEdicao = (cliente) => {
    setClienteSendoEditado(cliente); setNome(cliente.nome || ''); setTelefone(cliente.telefone || cliente.celular || ''); setEmail(cliente.email || '');
    setModalAberto(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const dados = { nome, telefone, celular: telefone, email };
    if (clienteSendoEditado) {
      await supabase.from('clientes').update(dados).eq('id', clienteSendoEditado.id);
    } else {
      await supabase.from('clientes').insert([dados]);
    }
    fecharModal(); buscarClientes();
    setEnviando(false);
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerenciamento completo da carteira de clientes.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer">
          + Novo Cliente
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">Carregando carteira de clientes...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs uppercase font-semibold">
                <th className="p-4">Nome Completo</th><th className="p-4">WhatsApp / Telefone</th><th className="p-4">E-mail</th><th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4 font-semibold text-white">{cliente.nome}</td>
                  <td className="p-4 font-mono text-xs">{cliente.telefone || cliente.celular || '---'}</td>
                  <td className="p-4 text-zinc-400 text-xs">{cliente.email || '---'}</td>
                  <td className="p-4"><button onClick={() => prepararEdicao(cliente)} className="text-[#f4bc06] font-semibold hover:underline cursor-pointer">Editar</button></td>
                </tr>
              ))}
              {clientes.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">Nenhum cliente cadastrado.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">{clienteSendoEditado ? 'Editar Cadastro' : 'Novo Cliente'}</h2>
            <form onSubmit={salvarCliente} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Nome Completo *</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Telefone / WhatsApp</label>
                <input type="text" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">E-mail</label>
                <input type="email" placeholder="cliente@provedor.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">{enviando ? 'Salvando...' : 'Salvar Cadastro'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. PRODUTOS COMPLETO (COM FOTO E GERENCIADOR)
// ==========================================
const Produtos = () => {
  const [produtos, setProdutos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [uploading, setUploading] = React.useState(false); 
  const [produtoSendoEditado, setProdutoSendoEditado] = React.useState(null);

  const [nome, setNome] = React.useState('');
  const [precoVenda, setPrecoVenda] = React.useState('');
  const [estoque, setEstoque] = React.useState('');
  const [descricao, setDescricao] = React.useState('');
  const [imagemUrl, setImagemUrl] = React.useState(''); 

  const buscarProdutos = async () => {
    setLoading(true);
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
    setLoading(false);
  };

  React.useEffect(() => { buscarProdutos(); }, []);

  const fecharModal = () => {
    setNome(''); setPrecoVenda(''); setEstoque(''); setDescricao(''); setImagemUrl('');
    setProdutoSendoEditado(null); setModalAberto(false);
  };

  const prepararEdicao = (prod) => {
    setProdutoSendoEditado(prod);
    setNome(prod.nome || ''); setPrecoVenda(prod.preco_venda || prod.preco || ''); setEstoque(prod.estoque || ''); setDescricao(prod.descricao || ''); setImagemUrl(prod.imagem_url || ''); 
    setModalAberto(true);
  };

  const handleUploadFoto = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('produtos').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('produtos').getPublicUrl(fileName);
      setImagemUrl(data.publicUrl);
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const dados = { nome, preco_venda: parseFloat(precoVenda) || 0, preco: parseFloat(precoVenda) || 0, estoque: parseInt(estoque) || 0, descricao, imagem_url: imagemUrl };
    if (produtoSendoEditado) {
      await supabase.from('produtos').update(dados).eq('id', produtoSendoEditado.id);
    } else {
      await supabase.from('produtos').insert([dados]);
    }
    fecharModal(); buscarProdutos();
    setEnviando(false);
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Produtos & Estoque</h1>
          <p className="text-zinc-500 text-sm mt-1">Controle de peças de reposição e vitrine pública.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer">
          + Novo Produto
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">Atualizando catálogo...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase font-semibold"><tr className="border-b border-zinc-800"><th className="p-4 w-24">Miniatura</th><th className="p-4">Item</th><th className="p-4">Estoque Disponível</th><th className="p-4">Preço Venda</th><th className="p-4">Ações</th></tr></thead>
            <tbody className="divide-y divide-zinc-800/50">
              {produtos.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4"><div className="w-12 h-12 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">{prod.imagem_url ? <img src={prod.imagem_url} alt={prod.nome} className="w-full h-full object-cover" /> : <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Sem foto</span>}</div></td>
                  <td className="p-4 font-semibold text-white">{prod.nome}</td>
                  <td className="p-4 font-mono text-xs">{prod.estoque} unidades</td>
                  <td className="p-4 text-[#f4bc06] font-bold font-mono">R$ {parseFloat(prod.preco_venda || prod.preco || 0).toFixed(2)}</td>
                  <td className="p-4"><button onClick={() => prepararEdicao(prod)} className="text-[#f4bc06] font-semibold hover:underline cursor-pointer">Editar</button></td>
                </tr>
              ))}
              {produtos.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">Nenhum produto em estoque.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl my-8">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">{produtoSendoEditado ? 'Editar Item' : 'Cadastrar Item'}</h2>
            <form onSubmit={salvarProduto} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Imagem do Produto</label>
                <div className="relative w-full h-36 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center bg-zinc-950 overflow-hidden">
                  {imagemUrl ? (
                    <><img src={imagemUrl} className="w-full h-full object-contain p-2" /><button type="button" onClick={() => setImagemUrl('')} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors cursor-pointer"><X size={14}/></button></>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-900/40 transition-colors">
                      {uploading ? <Loader2 className="animate-spin text-amber-500" size={24} /> : <Upload className="text-zinc-500" size={24} />}
                      <span className="text-xs text-zinc-500 mt-2 font-medium">{uploading ? 'Fazendo upload...' : 'Clique para carregar foto'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadFoto} disabled={uploading} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Nome do Produto *</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Quantidade Estoque</label><input type="number" required value={estoque} onChange={(e) => setEstoque(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Preço Venda (R$)</label><input type="number" step="0.01" required value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Descrição / Aplicação</label><textarea rows="2" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white resize-none focus:outline-none focus:border-amber-500"></textarea></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6"><button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">Voltar</button><button type="submit" disabled={enviando || uploading} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">{enviando ? 'Salvando...' : 'Gravar Produto'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. SERVIÇOS COMPLETO (TABELA DE PREÇOS)
// ==========================================
const Servicos = () => {
  const [servicos, setServicos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [servicoSendoEditado, setServicoSendoEditado] = React.useState(null);

  const [nome, setNome] = React.useState('');
  const [preco, setPreco] = React.useState('');
  const [descricao, setDescricao] = React.useState('');

  const buscarServicos = async () => {
    setLoading(true);
    const { data } = await supabase.from('servicos').select('*').order('id', { ascending: false });
    setServicos(data || []);
    setLoading(false);
  };

  React.useEffect(() => { buscarServicos(); }, []);

  const fecharModal = () => {
    setNome(''); setPreco(''); setDescricao(''); setServicoSendoEditado(null); setModalAberto(false);
  };

  const prepararEdicao = (srv) => {
    setServicoSendoEditado(srv);
    setNome(srv.nome || ''); setPreco(srv.preco || ''); setDescricao(srv.descricao || '');
    setModalAberto(true);
  };

  const salvarServico = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return alert("O nome do serviço é obrigatório!");
    setEnviando(true);
    const dadosServico = { nome, preco: preco ? parseFloat(preco) : 0, descricao };

    if (servicoSendoEditado) {
      await supabase.from('servicos').update(dadosServico).eq('id', servicoSendoEditado.id);
    } else {
      await supabase.from('servicos').insert([dadosServico]);
    }
    fecharModal(); buscarServicos();
    setEnviando(false);
  };

  const excluirServico = async (id, nomeSrv) => {
    if (window.confirm(`Tem certeza que deseja remover "${nomeSrv}" da tabela de preços?`)) {
      await supabase.from('servicos').delete().eq('id', id);
      buscarServicos();
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Tabela de Serviços</h1>
          <p className="text-zinc-500 text-sm mt-1">Cadastro de mão de obra fixa de laboratório.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer">
          + Novo Serviço
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">Puxando tabela de preços...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs uppercase font-semibold">
                <th className="p-4 w-24">Cód Mão de Obra</th><th className="p-4">Especificação do Serviço</th><th className="p-4">Preço Base</th><th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {servicos.map((srv) => (
                <tr key={srv.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4 font-mono text-xs text-zinc-500">#00{srv.id}</td>
                  <td className="p-4 font-semibold text-white">{srv.nome}<br/><span className="text-xs font-normal text-zinc-500">{srv.descricao || 'Sem descrição cadastrada'}</span></td>
                  <td className="p-4 text-[#f4bc06] font-bold font-mono">R$ {parseFloat(srv.preco).toFixed(2)}</td>
                  <td className="p-4">
                    <button onClick={() => prepararEdicao(srv)} className="text-[#f4bc06] font-semibold hover:underline mr-4 cursor-pointer">Editar</button>
                    <button onClick={() => excluirServico(srv.id, srv.nome)} className="text-red-500 font-semibold hover:underline cursor-pointer">Remover</button>
                  </td>
                </tr>
              ))}
              {servicos.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">Nenhum serviço mapeado.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">{servicoSendoEditado ? 'Modificar Serviço' : 'Mapear Novo Serviço'}</h2>
            <form onSubmit={salvarServico} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Nome do Serviço *</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Troca de Tela Touchscreen iPhone 13" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Preço de Tabela (R$) *</label>
                <input type="number" step="0.01" required value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Detalhes Técnicos</label>
                <textarea rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white resize-none focus:outline-none focus:border-amber-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">Voltar</button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">{enviando ? 'Salvando...' : 'Gravar Serviço'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. ORDENS DE SERVIÇO COMPLETO (COM ARQUIVOS/FOTOS)
// ==========================================
const OrdensServico = () => {
  const [listaOS, setListaOS] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [osSendoEditada, setOsSendoEditada] = React.useState(null);

  // Estados da Galeria de Evidências da O.S.
  const [osParaGaleria, setOsParaGaleria] = React.useState(null);
  const [fotosOS, setFotosOS] = React.useState([]);
  const [carregandoFotos, setCarregandoFotos] = React.useState(false);
  const [subindoMidia, setSubindoMidia] = React.useState(false);

  // Campos do formulário de O.S.
  const [clienteId, setClienteId] = React.useState('');
  const [tecnico, setTecnico] = React.useState('jadelson santana souza');
  const [status, setStatus] = React.useState('Orçamento');
  const [dataInicial, setDataInicial] = React.useState(new Date().toISOString().split('T')[0]);
  const [dataFinal, setDataFinal] = React.useState('');
  const [garantiaDias, setGarantiaDias] = React.useState('0');
  const [termoGarantia, setTermoGarantia] = React.useState('');
  const [tipoSenha, setTipoSenha] = React.useState('Não existe');
  const [descricaoProduto, setDescricaoProduto] = React.useState('');
  const [defeito, setDefeito] = React.useState('');
  const [valorTotal, setValorTotal] = React.useState('0.00');

  const buscarDados = async () => {
    setLoading(true);
    const { data: osData } = await supabase.from('os').select('*, clientes(nome)').order('id', { ascending: false });
    setListaOS(osData || []);
    const { data: clientesData } = await supabase.from('clientes').select('id, nome').order('nome');
    setClientes(clientesData || []);
    setLoading(false);
  };

  React.useEffect(() => { buscarDados(); }, []);

  const fecharModal = () => {
    setClienteId(''); setStatus('Orçamento'); setTecnico('jadelson santana souza');
    setDataInicial(new Date().toISOString().split('T')[0]); setDataFinal('');
    setGarantiaDias('0'); setTermoGarantia(''); setTipoSenha('Não existe');
    setDescricaoProduto(''); setDefeito(''); setValorTotal('0.00');
    setOsSendoEditada(null); setModalAberto(false);
  };

  const prepararEdicao = (os) => {
    setOsSendoEditada(os); setClienteId(os.cliente_id || ''); setTecnico(os.tecnico || ''); setStatus(os.status || 'Orçamento'); setDataInicial(os.data_inicial || ''); setDataFinal(os.data_final || ''); setGarantiaDias(os.garantia_dias?.toString() || '0'); setTermoGarantia(os.termo_garantia || ''); setTipoSenha(os.tipo_senha || 'Não existe'); setDescricaoProduto(os.descricao_produto || ''); setDefeito(os.defeito || ''); setValorTotal(os.valor_total || '0.00');
    setModalAberto(true);
  };

  const abrirGaleria = async (os) => {
    setOsParaGaleria(os);
    setCarregandoFotos(true);
    const { data, error } = await supabase.storage.from('os-fotos').list(`os_${os.id}/`);
    if (error) {
      setFotosOS([]);
    } else {
      const urls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage.from('os-fotos').getPublicUrl(`os_${os.id}/${file.name}`);
        return { name: file.name, url: publicUrl };
      });
      setFotosOS(urls);
    }
    setCarregandoFotos(false);
  };

  const uploadFotoOS = async (e) => {
    const file = e.target.files[0];
    if (!file || !osParaGaleria) return;

    setSubindoMidia(true);
    const extensao = file.name.split('.').pop();
    const nomeArquivo = `${Date.now()}.${extensao}`;
    const caminhoCompleto = `os_${osParaGaleria.id}/${nomeArquivo}`;

    const { error } = await supabase.storage.from('os-fotos').upload(caminhoCompleto, file);
    if (!error) {
      abrirGaleria(osParaGaleria);
    }
    setSubindoMidia(false);
  };

  const deletarFotoOS = async (nomeFoto) => {
    if (!osParaGaleria) return;
    const caminhoCompleto = `os_${osParaGaleria.id}/${nomeFoto}`;
    const { error } = await supabase.storage.from('os-fotos').remove([caminhoCompleto]);
    if (!error) {
      abrirGaleria(osParaGaleria);
    }
  };

  const salvarOS = async (e) => {
    e.preventDefault();
    if (!clienteId) return alert("Selecione um cliente para prosseguir.");
    setEnviando(true);
    const dadosOS = { 
      cliente_id: clienteId, tecnico, status, data_inicial: dataInicial, 
      data_final: dataFinal || null, garantia_dias: parseInt(garantiaDias) || 0, 
      termo_garantia: termoGarantia, tipo_senha: tipoSenha, 
      descricao_produto: descricaoProduto, defeito, 
      valor_total: parseFloat(valorTotal) || 0, valor_faturado: parseFloat(valorTotal) || 0 
    };
    
    if (osSendoEditada) {
      await supabase.from('os').update(dadosOS).eq('id', osSendoEditada.id);
    } else {
      await supabase.from('os').insert([dadosOS]);
    }
    fecharModal(); buscarDados();
    setEnviando(false);
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Ordens de Serviço</h1>
          <p className="text-zinc-500 text-sm mt-1">Abertura de ordens, diagnósticos e controle de manutenções.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer">
          + Nova OS
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">Acessando banco de ordens...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs uppercase font-semibold">
                <th className="p-4 w-16">N° OS</th><th className="p-4">Cliente</th><th className="p-4">Equipamento / Defeito</th><th className="p-4">Preço Orçado</th><th className="p-4">Status Atual</th><th className="p-4">Fotos Lab</th><th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {listaOS.map((os) => (
                <tr key={os.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4 font-mono text-xs text-zinc-500">#00{os.id}</td>
                  <td className="p-4 font-semibold text-white">{os.clientes?.nome || 'Cliente não identificado'}</td>
                  <td className="p-4 text-xs text-zinc-400"><span className="font-bold text-zinc-300">{os.descricao_produto}</span><br/>{os.defeito}</td>
                  <td className="p-4 font-bold text-white font-mono">R$ {parseFloat(os.valor_total).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${os.status === 'Garantia' || os.status === 'Pronto' ? 'bg-[#f4bc06]/10 text-[#f4bc06] border border-amber-500/20' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}>
                      {os.status}
                    </span>
                  </td>
                  <td className="p-4"><button onClick={() => abrirGaleria(os)} className="text-xs bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Mídias</button></td>
                  <td className="p-4"><button onClick={() => prepararEdicao(os)} className="text-[#f4bc06] font-semibold hover:underline cursor-pointer">Editar</button></td>
                </tr>
              ))}
              {listaOS.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">Nenhuma ordem de serviço registrada.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PRINCIPAL: CADASTRAR OU EDITAR OS */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl my-8 animate-fade-in">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">{osSendoEditada ? `Ordem de Serviço Pro N° ${osSendoEditada.id}` : 'Abertura de Ordem de Serviço'}</h2>
            <form onSubmit={salvarOS} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Cliente Requerente *</label>
                  <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="">Selecione o titular...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Técnico Responsável *</label>
                  <input type="text" required value={tecnico} onChange={(e) => setTecnico(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Status Triagem</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="Orçamento">Orçamento</option><option value="Em Manutenção">Em Manutenção</option><option value="Pronto">Pronto</option><option value="Garantia">Garantia</option><option value="Faturado">Faturado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Data Entrada</label>
                  <input type="date" required value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Data Saída</label>
                  <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Garantia (Dias)</label>
                  <input type="number" value={garantiaDias} onChange={(e) => setGarantiaDias(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Aparelho / Acessórios Deixados</label>
                  <textarea rows="2" placeholder="Ex: Samsung S23 Ultra, cor preta, capa protetora, sem carregador." value={descricaoProduto} onChange={(e) => setDescricaoProduto(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white resize-none focus:outline-none focus:border-amber-500"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Defeito Relatado / Constatado</label>
                  <textarea rows="2" placeholder="Ex: Vidro quebrado, display piscando verde." value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white resize-none focus:outline-none focus:border-amber-500"></textarea>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Preço Fechado O.S. (R$)</label>
                  <input type="number" step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">{enviando ? 'Gravando dados...' : 'Salvar Ficha OS'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEGUNDO MODAL: ARQUIVOS E EVIDÊNCIAS VISUAIS DE LABORATÓRIO */}
      {osParaGaleria && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setOsParaGaleria(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#f4bc06]">Inspeção Visual da O.S. #{osParaGaleria.id}</h2>
            <p className="text-xs text-zinc-500 uppercase font-bold mt-1 tracking-wide">{osParaGaleria.descricao_produto} — {osParaGaleria.defeito}</p>
            
            <div className="my-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fazer upload de nova foto do aparelho desmontado ou defeito:</span>
              <label className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors">
                {subindoMidia ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                {subindoMidia ? 'Enviando...' : 'Adicionar Foto'}
                <input type="file" accept="image/*" onChange={uploadFotoOS} disabled={subindoMidia} className="hidden" />
              </label>
            </div>

            {carregandoFotos ? (
              <div className="py-20 text-center text-zinc-500 font-mono text-xs flex items-center justify-center"><Loader2 className="animate-spin text-amber-500 mr-2" size={16} /> INDEXANDO ARQUIVOS DA OS...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                {fotosOS.map((f, i) => (
                  <div key={i} className="group relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80 aspect-square">
                    <img src={f.url} alt="Evidência" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deletarFotoOS(f.name)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer">Deletar</button>
                    </div>
                  </div>
                ))}
                {fotosOS.length === 0 && <div className="col-span-full py-16 text-center text-zinc-600 uppercase font-bold text-xs tracking-widest">Nenhum registro de imagem anexado a esta ordem.</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// COMPONENTE PRINCIPAL COM GESTÃO DE SESSÃO E ROTAS ANINHADAS CORRETAS
// =========================================================================
export default function App() {
  const [session, setSession] = React.useState(null);
  const [carregandoAuth, setCarregandoAuth] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCarregandoAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (carregandoAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
        <Loader2 className="animate-spin text-amber-500 mr-2" size={16} />
        VERIFICANDO AUTENTICAÇÃO JADEL...
      </div>
    );
  }

  // BARREIRA DE PROTEÇÃO: Se não houver sessão ativa, exibe a tela de login corporativo
  if (!session) {
    return <LoginAdmin />;
  }

  // SE ESTIVER AUTENTICADO: Layout administrativo estruturado
  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans antialiased overflow-hidden selection:bg-amber-500 selection:text-black">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800/40 flex flex-col justify-between">
        <div className="p-6 border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#f4bc06]">JADEL ASSISTÊNCIA</div>
              <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">Painel Gestor Pro</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem to="/admin" icon={Home} label="Dashboard" active={location.pathname === "/admin" || location.pathname === "/admin/"} />
          <NavItem to="/admin/clientes" icon={Users} label="Clientes" active={location.pathname === "/admin/clientes"} />
          <NavItem to="/admin/produtos" icon={Package} label="Produtos" active={location.pathname === "/admin/produtos"} />
          <NavItem to="/admin/servicos" icon={Wrench} label="Serviços" active={location.pathname === "/admin/servicos"} />
          <NavItem to="/admin/os" icon={Smartphone} label="Ordens de Serviço" active={location.pathname === "/admin/os"} />
          <NavItem to="/admin/vendas" icon={ShoppingCart} label="Vendas" active={location.pathname === "/admin/vendas"} />
          <NavItem to="/admin/historico-vendas" icon={ClipboardList} label="Histórico" active={location.pathname === "/admin/historico-vendas"} />
          <NavItem to="/admin/garantias" icon={ShieldCheck} label="Garantias" active={location.pathname === "/admin/garantias"} />
        </nav>
         
        <Link to="/" className="flex items-center gap-4 px-5 mb-4 text-amber-500 hover:text-amber-400 transition-colors w-full text-left font-medium text-sm">
          <Monitor size={16} />
          <span>Ver site público</span>
        </Link>

        <div className="p-6 border-t border-zinc-800/40">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-4 px-5 text-zinc-500 hover:text-red-400 transition-colors w-full text-left font-medium text-sm cursor-pointer">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gradient-to-b from-zinc-900/10 to-transparent overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="os" element={<OrdensServico />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="historico-vendas" element={<HistoricoVendas />} />
          <Route path="garantias" element={<Garantias />} />
          
          {/* Redireciona qualquer rota interna inválida de volta ao dashboard do admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}