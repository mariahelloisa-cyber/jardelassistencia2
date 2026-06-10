import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 👈 Adicionado os dois pontos (../) para subir um nível // Apenas um ponto
import { ClipboardList, Calendar, User, DollarSign, Eye, Search, X } from 'lucide-react';

export default function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Estado para o Modal de Detalhes da Venda
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [itensVenda, setItensVenda] = useState([]);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      // Busca as vendas trazendo também o nome do cliente associado (se houver)
      let query = supabase
        .from('vendas')
        .select(`
          id,
          created_at,
          valor_total,
          forma_pagamento,
          vendedor,
          clientes ( nome )
        `)
        .order('created_at', { ascending: false });

      if (filtroVendedor) {
        query = query.ilike('vendedor', `%${filtroVendedor}%`);
      }

      if (filtroData) {
        // Filtra pelo dia selecionado
        query = query.gte('created_at', `${filtroData}T00:00:00.000Z`)
                     .lte('created_at', `${filtroData}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      alert('Erro ao carregar histórico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, [filtroData]); // Recarrega automaticamente se mudar a data

  const abrirDetalhes = async (venda) => {
    setVendaSelecionada(venda);
    try {
      setLoadingDetalhes(true);
      // Busca os itens daquela venda específica trazendo o nome do produto
      const { data, error } = await supabase
        .from('vendas_itens')
        .select(`
          id,
          quantidade,
          preco_unitario,
          produtos ( nome )
        `)
        .eq('venda_id', venda.id);

      if (error) throw error;
      setItensVenda(data || []);
    } catch (error) {
      alert('Erro ao carregar itens da venda: ' + error.message);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Soma total do período filtrado
  const totalFaturadoPeriodo = vendas.reduce((acc, v) => acc + parseFloat(v.valor_total), 0);

  return (
    <div className="p-10">
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          <ClipboardList className="text-[#f4bc06]" size={36} />
          Histórico de Vendas
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Consulte e gerencie todas as vendas de balcão realizadas.</p>
      </div>

      {/* FILTROS E RESUMO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 items-end text-sm">
        <div className="lg:col-span-2 relative">
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Buscar por Vendedor</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input 
              type="text"
              placeholder="Digite o nome do vendedor..."
              value={filtroVendedor}
              onChange={(e) => setFiltroVendedor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && carregarHistorico()}
              className="w-full bg-jadel-card border border-zinc-900 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Filtrar por Data</label>
          <input 
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="w-full bg-jadel-card border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          />
        </div>

        <button 
          onClick={carregarHistorico}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer h-[42px]"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* CARD DE TOTALIZADOR */}
      <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl mb-6 flex justify-between items-center">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total faturado na listagem atual:</span>
        <span className="text-xl font-black text-[#f4bc06] font-mono">R$ {totalFaturadoPeriodo.toFixed(2)}</span>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="bg-jadel-card border border-zinc-900/80 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 tracking-wider uppercase font-semibold">
              <th className="p-4">Data / Hora</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Vendedor</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Valor Total</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-zinc-500">Buscando registros no banco...</td>
              </tr>
            ) : vendas.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-zinc-600 font-medium">Nenhuma venda encontrada para os filtros aplicados.</td>
              </tr>
            ) : (
              vendas.map((venda) => (
                <tr key={venda.id} className="hover:bg-zinc-900/10">
                  <td className="p-4 font-mono text-zinc-400">
                    {new Date(venda.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 font-medium text-white uppercase">
                    {venda.clientes?.nome || 'Consumidor Final'}
                  </td>
                  <td className="p-4 uppercase text-zinc-400">{venda.vendedor}</td>
                  <td className="p-4">
                    <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-900 text-zinc-400">
                      {venda.forma_pagamento}
                    </span>
                  </td>
                  <td className="p-4 text-white font-bold font-mono">R$ {venda.valor_total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => abrirDetalhes(venda)}
                      className="text-amber-500 hover:text-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                    >
                      <Eye size={14} /> Detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALHES DA VENDA */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-jadel-card border border-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Cabeçalho do Modal */}
            <div className="p-6 bg-zinc-900/40 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Detalhes da Venda #{vendaSelecionada.id}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Realizada em {new Date(vendaSelecionada.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <button 
                onClick={() => setVendaSelecionada(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-jadel-black border border-zinc-900 p-4 rounded-xl">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Vendedor</span>
                  <span className="text-white font-medium uppercase">{vendaSelecionada.vendedor}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Cliente</span>
                  <span className="text-white font-medium uppercase">{vendaSelecionada.clientes?.nome || 'Consumidor Final'}</span>
                </div>
              </div>

              {/* Tabela de Produtos comprados */}
              <div>
                <h4 className="text-xs font-bold text-[#f4bc06] uppercase tracking-wider mb-3">Itens Comprados</h4>
                <div className="border border-zinc-900 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-900/50 border-b border-zinc-900 text-zinc-400 font-semibold uppercase">
                        <th className="p-3">Produto</th>
                        <th className="p-3 text-center">Qtd</th>
                        <th className="p-3">Preço Unit.</th>
                        <th className="p-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                      {loadingDetalhes ? (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-zinc-500">Carregando itens...</td>
                        </tr>
                      ) : (
                        itensVenda.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-medium text-white uppercase">{item.produtos?.nome}</td>
                            <td className="p-3 text-center font-mono">{item.quantidade} un</td>
                            <td className="p-3 font-mono">R$ {item.preco_unitario.toFixed(2)}</td>
                            <td className="p-3 font-mono text-white font-bold">
                              R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rodapé Financeiro do Modal */}
              <div className="flex justify-between items-center border-t border-zinc-900 pt-4 font-medium">
                <div className="text-zinc-500 text-xs">
                  FORMA DE PAGAMENTO: <span className="text-white font-bold ml-1">{vendaSelecionada.forma_pagamento}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block uppercase">Valor Total Pago</span>
                  <span className="text-xl font-black text-[#f4bc06] font-mono">R$ {vendaSelecionada.valor_total.toFixed(2)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}