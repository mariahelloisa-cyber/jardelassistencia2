import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient"; // Adicionado os dois pontos // Apenas um ponto
import { ShieldCheck, Search, CheckCircle, XCircle } from 'lucide-react';

export default function Garantias() {
  const [dadosBrutos, setDadosBrutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');

  // 1. Busca os dados do Supabase removendo a coluna 'vendedor' que causava erro
  useEffect(() => {
    let ativo = true;

    const buscarDados = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('os')
          .select(`
            id,
            descricao_produto,
            data_final,
            garantia_dias,
            clientes ( nome, telefone )
          `) // 'vendedor' foi removido daqui para sanar o erro 400
          .order('id', { ascending: false });

        if (error) throw error;
        if (ativo) setDadosBrutos(data || []);
      } catch (error) {
        console.error('Erro ao buscar garantias no Supabase:', error.message);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    buscarDados();
    return () => { ativo = false; };
  }, []);

  // 2. Processa os prazos e datas na renderização de forma segura
  const garantiasProcessadas = dadosBrutos.map(item => {
    if (!item.data_final || !item.garantia_dias || parseInt(item.garantia_dias) <= 0) {
      return null;
    }

    try {
      const apenasDataStr = item.data_final.split('T')[0];
      const [ano, mes, dia] = apenasDataStr.split('-');
      
      const dataEntrega = new Date(ano, mes - 1, dia, 0, 0, 0);
      const diasGarantia = parseInt(item.garantia_dias) || 0;
      
      const dataVencimento = new Date(dataEntrega);
      dataVencimento.setDate(dataVencimento.getDate() + diasGarantia);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const diferencaTempo = dataVencimento.getTime() - hoje.getTime();
      const diasRestantes = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
      const ativa = diasRestantes >= 0;

      return {
        ...item,
        dataEntregaFormatada: dataEntrega,
        dataVencimento,
        diasRestantes: ativa ? diasRestantes : 0,
        statusGarantia: ativa ? 'Ativa' : 'Vencida'
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);

  // 3. Aplica os filtros de pesquisa por texto e status
  const garantiasFiltradas = garantiasProcessadas.filter(g => {
    const nomeCliente = g.clientes?.nome?.toLowerCase() || '';
    const aparelho = (g.descricao_produto || '').toLowerCase();
    const termo = busca.toLowerCase();
    
    const bateBusca = nomeCliente.includes(termo) || aparelho.includes(termo) || g.id.toString().includes(termo);
    
    if (filtroStatus === 'ativas') return bateBusca && g.statusGarantia === 'Ativa';
    if (filtroStatus === 'vencidas') return bateBusca && g.statusGarantia === 'Vencida';
    return bateBusca;
  });

  const totalAtivas = garantiasProcessadas.filter(g => g.statusGarantia === 'Ativa').length;
  const totalVencidas = garantiasProcessadas.filter(g => g.statusGarantia === 'Vencida').length;

  return (
    <div className="p-10">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-[#f4bc06]" size={36} />
          Módulo de Garantias
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Acompanhe os prazos de cobertura legal e comercial dos serviços prestados.</p>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-jadel-card border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between h-24 shadow-lg">
          <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Monitoradas</span>
          <span className="text-2xl font-bold text-white">{garantiasProcessadas.length} itens</span>
        </div>
        <div className="bg-jadel-card border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between h-24 shadow-lg border-l-4 border-l-emerald-500">
          <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Coberturas Ativas</span>
          <span className="text-2xl font-bold text-emerald-400">{totalAtivas} aparelhos</span>
        </div>
        <div className="bg-jadel-card border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between h-24 shadow-lg border-l-4 border-l-red-500">
          <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Prazos Expirados</span>
          <span className="text-2xl font-bold text-red-400">{totalVencidas} itens</span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={16} />
          </span>
          <input 
            type="text"
            placeholder="Buscar por cliente, OS ou aparelho..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-jadel-card border border-zinc-900 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full bg-jadel-card border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="todas">Todos os Status</option>
            <option value="ativas">Garantias Ativas (No prazo)</option>
            <option value="vencidas">Garantias Vencidas (Expiradas)</option>
          </select>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-900 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer"
        >
          Atualizar Prazos
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-zinc-500 text-xs col-span-2 text-center p-8">Calculando cronologia das ordens...</p>
        ) : garantiasFiltradas.length === 0 ? (
          <p className="text-zinc-600 text-xs font-medium col-span-2 text-center p-8 bg-jadel-card rounded-2xl border border-zinc-900/60">Nenhum registro de garantia encontrado com os critérios selecionados.</p>
        ) : (
          garantiasFiltradas.map((item) => (
            <div 
              key={item.id} 
              className={`bg-jadel-card border rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all duration-200 ${
                item.statusGarantia === 'Ativa' ? 'border-zinc-900/80 hover:border-emerald-500/40' : 'border-zinc-900/40 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-zinc-900 border border-zinc-900 px-2 py-0.5 rounded font-mono text-zinc-400 font-bold">
                    OS #{item.id}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase mt-2">
                    {item.descricao_produto || 'Sem descrição do produto'}
                  </h3>
                  <p className="text-xs text-zinc-400 uppercase font-semibold mt-1">Cliente: {item.clientes?.nome || 'Não Informado'}</p>
                  {item.clientes?.telefone && (
                    <p className="text-zinc-500 text-[11px] mt-0.5">Contato: {item.clientes.telefone}</p>
                  )}
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.statusGarantia === 'Ativa' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.statusGarantia === 'Ativa' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {item.statusGarantia}
                </div>
              </div>

              <div className="border-t border-zinc-900/60 mt-4 pt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-zinc-400 font-medium">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Entregue em</span>
                  <span className="font-mono text-white">
                    {item.dataEntregaFormatada ? item.dataEntregaFormatada.toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Vencimento</span>
                  <span className="font-mono text-white">
                    {item.dataVencimento ? item.dataVencimento.toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-1 text-right md:text-left">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Tempo Restante</span>
                  {item.statusGarantia === 'Ativa' ? (
                    <span className="text-emerald-400 font-bold font-mono">
                      {item.diasRestantes === 0 ? 'Último dia hoje!' : `${item.diasRestantes} dias vigentes`}
                    </span>
                  ) : (
                    <span className="text-zinc-600 line-through font-bold">Prazo Esgotado</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}