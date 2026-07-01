import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

// Todos os ícones necessários para o funcionamento do painel
import { 
  Users, Package, Wrench, Smartphone, Home,
  ShieldCheck, ShoppingCart, DollarSign, 
  ClipboardList, Monitor, LogOut, Upload, Loader2, X, Lock,
  Eye, EyeOff 
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
// 2. CLIENTES COMPLETO (COM CADASTRO E EDIÇÃO EXPANDIDO)
// ==========================================
const Clientes = () => {
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [clienteSendoEditado, setClienteSendoEditado] = React.useState(null);
  const [verSenha, setVerSenha] = React.useState(false);

  // Novos estados expandidos para o formulário robusto
  const [tipoCliente, setTipoCliente] = React.useState('consumidor');
  const [cpfCnpj, setCpfCnpj] = React.useState('');
  const [nome, setNome] = React.useState(''); 
  const [telefone, setTelefone] = React.useState('');
  const [celular, setCelular] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [cep, setCep] = React.useState('');
  const [rua, setRua] = React.useState('');
  const [numero, setNumero] = React.useState('');
  const [complemento, setComplemento] = React.useState('');
  const [bairro, setBairro] = React.useState('');
  const [cidade, setCidade] = React.useState('');
  const [estado, setEstado] = React.useState('');

  const buscarClientes = async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes(data || []);
    setLoading(false);
  };

  React.useEffect(() => { buscarClientes(); }, []);

  // Autofetch de endereço inteligente por CEP (ViaCEP)
  const handleCepChange = async (e) => {
    const valor = e.target.value;
    setCep(valor);
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dadosEndereco = await res.json();
        if (!dadosEndereco.erro) {
          setRua(dadosEndereco.logradouro || '');
          setBairro(dadosEndereco.bairro || '');
          setCidade(dadosEndereco.localidade || '');
          setEstado(dadosEndereco.uf || '');
        }
      } catch (err) {
        console.error("Erro ao autocompletar CEP:", err);
      }
    }
  };

  const fecharModal = () => {
    setTipoCliente('consumidor'); setCpfCnpj(''); setNome(''); setTelefone(''); 
    setCelular(''); setEmail(''); setSenha(''); setCep(''); setRua(''); 
    setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setEstado('');
    setClienteSendoEditado(null); setModalAberto(false);
  };

  const prepararEdicao = (cliente) => {
    setClienteSendoEditado(cliente);
    setTipoCliente(cliente.tipo_cliente || 'consumidor');
    setCpfCnpj(cliente.cpf_cnpj || '');
    setNome(cliente.nome || '');
    setTelefone(cliente.telefone || '');
    setCelular(cliente.celular || '');
    setEmail(cliente.email || '');
    setSenha(cliente.senha || '');
    setCep(cliente.cep || '');
    setRua(cliente.rua || '');
    setNumero(cliente.numero || '');
    setComplemento(cliente.complemento || '');
    setBairro(cliente.bairro || '');
    setCidade(cliente.cidade || '');
    setEstado(cliente.estado || '');
    setModalAberto(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    // Mapeamento exato de variáveis para colunas do banco Supabase
    const dados = { 
      tipo_cliente: tipoCliente, cpf_cnpj: cpfCnpj, nome, telefone, 
      celular, email, senha, cep, rua, numero, complemento, 
      bairro, city: cidade, cidade, estado 
    };

    if (clienteSendoEditado) {
      await supabase.from('clientes').update(dados).eq('id', clienteSendoEditado.id);
    } else {
      await supabase.from('clientes').insert([dados]);
    }
    
    fecharModal(); 
    buscarClientes();
    setEnviando(false);
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerenciamento completo da carteira de clientes corporativos e consumidores.</p>
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
                <th className="p-4">Nome / Razão Social</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Contato (Celular/Whats)</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Localidade</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4 font-semibold text-white">
                    {cliente.nome}
                    <span className="block text-[10px] text-zinc-500 font-mono">{cliente.cpf_cnpj || 'Sem CPF/CNPJ'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${cliente.tipo_cliente === 'fornecedor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {cliente.tipo_cliente || 'consumidor'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {cliente.celular || cliente.telefone || '---'}
                  </td>
                  <td className="p-4 text-zinc-400 text-xs">{cliente.email || '---'}</td>
                  <td className="p-4 text-zinc-400 text-xs">
                    {cliente.cidade ? `${cliente.cidade} - ${cliente.estado || ''}` : '---'}
                  </td>
                  <td className="p-4">
                    <button onClick={() => prepararEdicao(cliente)} className="text-[#f4bc06] font-semibold hover:underline cursor-pointer">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL EXPANDIDO COM GRID DE FORMULÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">
              {clienteSendoEditado ? 'Editar Ficha do Cliente' : 'Ficha de Novo Cliente'}
            </h2>
            
            <form onSubmit={salvarCliente} className="space-y-4 text-sm">
              
              {/* Bloco 1: Perfil de Identificação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800/60">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Tipo de Cliente *</label>
                  <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="consumidor">Consumidor</option>
                    <option value="fornecedor">Fornecedor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">CPF / CNPJ</label>
                  <input type="text" placeholder="000.000.000-00" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Nome / Razão Social *</label>
                  <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              {/* Bloco 2: Contatos e Acesso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Celular</label>
                  <input type="text" placeholder="(00) 0000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">E-mail</label>
                  <input type="email" placeholder="exemplo@jadel.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Senha </label>
                  <div className="relative">
                    <input 
                      type={verSenha ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={senha} 
                      onChange={(e) => setSenha(e.target.value)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-amber-500" 
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha(!verSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#f4bc06] transition-colors cursor-pointer"
                      title={verSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Endereço (Com AutoCEP integrado) */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60 space-y-4">
                <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase block">Dados de Endereço Residencial/Comercial</span>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">CEP</label>
                    <input type="text" placeholder="00000-000" value={cep} onChange={handleCepChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-xs" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Logradouro / Rua</label>
                    <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Número</label>
                    <input type="text" placeholder="S/N" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Complemento</label>
                    <input type="text" placeholder="Apto, Bloco, Fundos..." value={complemento} onChange={(e) => setComplemento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Bairro</label>
                    <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Cidade</label>
                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 tracking-wide">Estado (UF)</label>
                    <input type="text" placeholder="EX: SE" maxLength="2" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 uppercase font-mono" />
                  </div>
                </div>
              </div>

              {/* Botões do rodapé */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">
                  {enviando ? 'Salvando...' : 'Salvar Cadastro'}
                </button>
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
// 5. COMPONENTE DE ORDENS DE SERVIÇO (CORRIGIDO)
// ==========================================
const OrdensServico = () => {
  const [ordens, setOrdens] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [osSendoEditada, setOsSendoEditada] = React.useState(null);

  // 1. Estados de Identificação e Controle Básicos
  const [clienteId, setClienteId] = React.useState('');
  const [tecnicoResponsavel, setTecnicoResponsavel] = React.useState('');
  const [status, setStatus] = React.useState('orçamento');
  const [tipoSenha, setTipoSenha] = React.useState('');
  const [dataInicio, setDataInicio] = React.useState('');
  const [dataFim, setDataFim] = React.useState('');
  const [garantiaDias, setGarantiaDias] = React.useState('');
  const [termoGarantia, setTermoGarantia] = React.useState('');
  const [precoFechado, setPrecoFechado] = React.useState('');

  // 2. Estado de Upload de Arquivo do Laudo
  const [arquivoLaudo, setArquivoLaudo] = React.useState(null);
  const [laudoUrl, setLaudoUrl] = React.useState('');

  // 3. Estados de Texto Longo
  const [descricao, setDescricao] = React.useState('');
  const [defeito, setDefeito] = React.useState('');
  const [observacao, setObservacao] = React.useState('');
  const [laudoTecnico, setLaudoTecnico] = React.useState('');

  // 4. Estado Estruturado do Checklist Completo
  const checklistInicial = {
    alto_falante: 'Não Testado', auricular: 'Não Testado', bluetooth: 'Não Testado',
    camera_traseira: 'Não Testado', flash: 'Não Testado', botao_power: 'Não Testado',
    parafusos: 'Não Testado', wi_fi: 'Não Testado', microfone: 'Não Testado',
    carcaca: 'Não Testado', vibra_call: 'Não Testado', tela: 'Não Testado',
    bateria: 'Não Testado', camera_frontal: 'Não Testado', conector_carga: 'Não Testado',
    botao_home: 'Não Testado', botao_volume: 'Não Testado', sensor_proximidade: 'Não Testado',
    pegando_chip: 'Não Testado', biometria_faceid: 'Não Testado'
  };
  const [checklist, setChecklist] = React.useState(checklistInicial);

  const carregarDados = async () => {
    setLoading(true);
    const { data: listaOS } = await supabase.from('os').select('*, clientes(nome)').order('id', { ascending: false });
    const { data: listaClientes } = await supabase.from('clientes').select('id, nome').order('nome');
    setOrdens(listaOS || []);
    setClientes(listaClientes || []);
    setLoading(false);
  };

  React.useEffect(() => { carregarDados(); }, []);

  const handleChecklistChange = (campo, valor) => {
    setChecklist(prev => ({ ...prev, [campo]: valor }));
  };

  const fecharModal = () => {
    setClienteId(''); setTecnicoResponsavel(''); setStatus('orçamento'); setTipoSenha('');
    setDataInicio(''); setDataFim(''); setGarantiaDias(''); setTermoGarantia(''); setPrecoFechado('');
    setDescricao(''); setDefeito(''); setObservacao(''); setLaudoTecnico(''); setLaudoUrl('');
    setArquivoLaudo(null); setChecklist(checklistInicial);
    setOsSendoEditada(null); setModalAberto(false);
  };

  const prepararEdicao = (os) => {
    setOsSendoEditada(os);
    setClienteId(os.cliente_id || '');
    setTecnicoResponsavel(os.tecnico_responsavel || '');
    setStatus(os.status || 'orçamento');
    setTipoSenha(os.tipo_senha || '');
    setDataInicio(os.data_inicio || '');
    setDataFim(os.data_fim || '');
    setGarantiaDias(os.garantia_dias || '');
    setTermoGarantia(os.termo_garantia || '');
    setPrecoFechado(os.preco_fechado || '');
    setDescricao(os.descricao || '');
    setDefeito(os.defeito || '');
    setObservacao(os.observacao || '');
    setLaudoTecnico(os.laudo_tecnico || '');
    setLaudoUrl(os.laudo_url || '');
    setChecklist({ ...checklistInicial, ...(os.checklist || {}) });
    setModalAberto(true);
  };

  const salvarOS = async (e) => {
    e.preventDefault();
    setEnviando(true);

    let urlFinalDoArquivo = laudoUrl;

    if (arquivoLaudo) {
      const fileExt = arquivoLaudo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `laudos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('os-anexos')
        .upload(filePath, arquivoLaudo);

      if (!uploadError) {
        const { data } = supabase.storage.from('os-anexos').getPublicUrl(filePath);
        urlFinalDoArquivo = data.publicUrl;
      } else {
        console.error("Erro no upload do anexo:", uploadError.message);
      }
    }

    const dados = {
      cliente_id: clienteId, tecnico_responsavel: tecnicoResponsavel, status,
      tipo_senha: tipoSenha, data_inicio: dataInicio ? dataInicio : null,
      data_fim: dataFim ? dataFim : null, garantia_dias: garantiaDias,
      termo_garantia: termoGarantia, preco_fechado: precoFechado,
      descricao, defeito, observacao, laudo_tecnico: laudoTecnico,
      laudo_url: urlFinalDoArquivo, checklist
    };

    if (osSendoEditada) {
      await supabase.from('os').update(dados).eq('id', osSendoEditada.id);
    } else {
      await supabase.from('os').insert([dados]);
    }

    fecharModal();
    carregarDados();
    setEnviando(false);
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Ordens de Serviço</h1>
          <p className="text-zinc-500 text-sm mt-1">Controle técnico interno, triagem, checklists e emissão de laudos.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer">
          + Nova Ordem de Serviço
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">Carregando ordens de serviço...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs uppercase font-semibold">
                <th className="p-4">Nº O.S.</th>
                <th className="p-4">Cliente Requerente</th>
                <th className="p-4">Técnico</th>
                <th className="p-4">Status Atual</th>
                <th className="p-4">Data Início</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {ordens.map((os) => (
                <tr key={os.id} className="hover:bg-zinc-800/20 text-zinc-300">
                  <td className="p-4 font-mono text-white font-bold">#{os.id}</td>
                  <td className="p-4 font-semibold text-zinc-100">{os.clientes?.nome || 'Cliente não localizado'}</td>
                  <td className="p-4 text-xs">{os.tecnico_responsavel || 'Não atribuído'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {os.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono">{os.data_inicio || '---'}</td>
                  <td className="p-4">
                    <button onClick={() => prepararEdicao(os)} className="text-[#f4bc06] font-semibold hover:underline cursor-pointer">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
              {ordens.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-wider">
                    Nenhuma O.S. aberta no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl my-4 max-h-[95vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f4bc06] mb-5 uppercase tracking-wide text-center">
              {osSendoEditada ? `Gerenciar O.S. #${osSendoEditada.id}` : 'Abertura de Nova Ordem de Serviço'}
            </h2>

            <form onSubmit={salvarOS} className="space-y-6 text-sm">
              
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60">
                <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase block mb-3">Informações de Triagem Inicial</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Cliente Requerente *</label>
                    <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                      <option value="">Selecione o Cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Técnico Responsável</label>
                    <input type="text" placeholder="Nome do Técnico" value={tecnicoResponsavel} onChange={(e) => setTecnicoResponsavel(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status da O.S.</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none uppercase text-xs font-bold text-amber-400">
                      <option value="orçamento">Orçamento</option>
                      <option value="em andamento">Em Andamento</option>
                      <option value="aguardando autorização">Aguardando Autorização</option>
                      <option value="autorizado">Autorizado</option>
                      <option value="garantia">Garantia</option>
                      <option value="aguardando peças">Aguardando Peças</option>
                      <option value="serviço concluído">Serviço Concluído</option>
                      <option value="sem reparo">Sem Reparo</option>
                      <option value="abandonados">Abandonados</option>
                      <option value="faturados">Faturados</option>
                      <option value="faturado-externo">Faturado-Externo</option>
                      <option value="entregue-sem reparo">Entregue sem Reparo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tipo de Senha</label>
                    <input type="text" placeholder="Padrão, Numérica, PIN" value={tipoSenha} onChange={(e) => setTipoSenha(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data Início</label>
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data Fim</label>
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Garantia (Dias)</label>
                    <input type="number" placeholder="Ex: 90" value={garantiaDias} onChange={(e) => setGarantiaDias(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Preço Fechado O.S. (R$)</label>
                    <input type="text" placeholder="0.00" value={precoFechado} onChange={(e) => setPrecoFechado(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60">
                <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase block mb-3">Checklist Avançado de Entrada do Hardware</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Alto-Falante</label>
                    <select value={checklist.alto_falante} onChange={(e) => handleChecklistChange('alto_falante', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Ligando c/ Dificuldade">Ligando c/ Dificuldade</option>
                      <option value="Sem Som">Sem Som</option>
                      <option value="Trelando">Trelando</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Auricular</label>
                    <select value={checklist.auricular} onChange={(e) => handleChecklistChange('auricular', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Bluetooth</label>
                    <select value={checklist.bluetooth} onChange={(e) => handleChecklistChange('bluetooth', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Liga mas não encontra">Liga mas não encontra</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Câmera Traseira</label>
                    <select value={checklist.camera_traseira} onChange={(e) => handleChecklistChange('camera_traseira', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Embaçada">Embaçada</option>
                      <option value="Não Possui">Não Possui</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Flash</label>
                    <select value={checklist.flash} onChange={(e) => handleChecklistChange('flash', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Botão Power</label>
                    <select value={checklist.botao_power} onChange={(e) => handleChecklistChange('botao_power', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Parafusos</label>
                    <select value={checklist.parafusos} onChange={(e) => handleChecklistChange('parafusos', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Wi-Fi</label>
                    <select value={checklist.wi_fi} onChange={(e) => handleChecklistChange('wi_fi', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Não Funciona">Não Funciona</option>
                      <option value="Liga mas não encontra">Liga mas não encontra</option>
                      <option value="Sinal Fraco">Sinal Fraco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Microfone</label>
                    <select value={checklist.microfone} onChange={(e) => handleChecklistChange('microfone', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Baixo">Baixo</option>
                      <option value="Não Funciona">Não Funciona</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Situação da Carcaça</label>
                    <select value={checklist.carcaca} onChange={(e) => handleChecklistChange('carcaca', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Arranhada">Arranhada</option>
                      <option value="Amassada">Amassada</option>
                      <option value="Quebrada">Quebrada</option>
                      <option value="Empenada">Empenada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Vibra Call</label>
                    <select value={checklist.vibra_call} onChange={(e) => handleChecklistChange('vibra_call', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Não Possui">Não Possui</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Tela</label>
                    <select value={checklist.tela} onChange={(e) => handleChecklistChange('tela', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Quebrada">Quebrada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Bateria</label>
                    <select value={checklist.bateria} onChange={(e) => handleChecklistChange('bateria', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Funcionando">Funcionando</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Câmera Frontal</label>
                    <select value={checklist.camera_frontal} onChange={(e) => handleChecklistChange('camera_frontal', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Embaçada">Embaçada</option>
                      <option value="Não Possui">Não Possui</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Conector de Carga</label>
                    <select value={checklist.conector_carga} onChange={(e) => handleChecklistChange('conector_carga', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Botão Home</label>
                    <select value={checklist.botao_home} onChange={(e) => handleChecklistChange('botao_home', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Botão de Volume</label>
                    <select value={checklist.botao_volume} onChange={(e) => handleChecklistChange('botao_volume', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Sensor Proximidade</label>
                    <select value={checklist.sensor_proximidade} onChange={(e) => handleChecklistChange('sensor_proximidade', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Pegando Chip</label>
                    <select value={checklist.pegando_chip} onChange={(e) => handleChecklistChange('pegando_chip', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-semibold mb-0.5">Biometria / Face ID</label>
                    <select value={checklist.biometria_faceid} onChange={(e) => handleChecklistChange('biometria_faceid', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white focus:outline-none text-[11px]">
                      <option value="Não Testado">Não Testado</option>
                      <option value="Funcionando">Funcionando</option>
                      <option value="Com Defeito">Com Defeito</option>
                      <option value="Não Existe">Não Existe</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrição Detalhada do Aparelho</label>
                  <textarea rows="3" placeholder="Modelo, cor, marcas de uso externas..." value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Defeito Relatado / Constatado</label>
                  <textarea rows="3" placeholder="O que o cliente relatou e o que foi visto na triagem..." value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Observações Internas</label>
                  <textarea rows="3" placeholder="Notas internas para controle da bancada..." value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Termo de Garantia Customizado</label>
                  <textarea rows="3" placeholder="Regras específicas de garantia para esta O.S...." value={termoGarantia} onChange={(e) => setTermoGarantia(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none" />
                </div>

                <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1">Laudo Técnico Final</label>
                    <textarea rows="4" placeholder="Parecer técnico final detalhado sobre o conserto..." value={laudoTecnico} onChange={(e) => setLaudoTecnico(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800/60">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Anexar Documento / Imagem do Laudo</label>
                      <input type="file" onChange={(e) => setArquivoLaudo(e.target.files[0])} className="text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer" />
                    </div>
                    {laudoUrl && (
                      <a href={laudoUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline font-mono bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        📄 Ver Arquivo Anexado Atual
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={fecharModal} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="px-5 py-2.5 bg-[#f4bc06] hover:bg-amber-500 text-zinc-950 font-black rounded-xl transition-colors cursor-pointer">
                  {enviando ? 'Salvando Registro...' : 'Salvar Ordem de Serviço'}
                </button>
              </div>
            </form>
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