import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient"; // Adicionado os dois pontos // Apenas um ponto
import { ShoppingCart, Trash2, Plus, Search, DollarSign, User, Tag } from 'lucide-react';

export default function Vendas() {
  const [produtosBanco, setProdutosBanco] = useState([]);
  const [clientesBanco, setClientesBanco] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dados Globais da Venda
  const [clienteId, setClienteId] = useState('');
  const [vendedor, setVendedor] = useState('jadelson santana souza');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [desconto, setDesconto] = useState('0.00');

  // Seleção do Produto Atual
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('0.00');
  const [quantidadeItem, setQuantidadeItem] = useState('1');

  // Itens no Carrinho / Venda Atual
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    const carregarDadosDeSuporte = async () => {
      // Buscar produtos para o select/busca
      const { data: prods } = await supabase.from('produtos').select('*').order('nome');
      setProdutosBanco(prods || []);

      // Buscar clientes para associar à venda
      const { data: clis } = await supabase.from('clientes').select('id, nome').order('nome');
      setClientesBanco(clis || []);
    };
    carregarDadosDeSuporte();
  }, []);

  // Quando o usuário muda o produto no select, atualiza o preço padrão dele automaticamente
  const handleProdutoChange = (id) => {
    setProdutoSelecionadoId(id);
    const prod = produtosBanco.find(p => p.id.toString() === id.toString());
    if (prod) {
      setPrecoUnitario(prod.preco_venda.toFixed(2));
    } else {
      setPrecoUnitario('0.00');
    }
  };

  const adicionarAoCarrinho = (e) => {
    e.preventDefault();
    if (!produtoSelecionadoId) return alert('Selecione um produto válido!');
    
    const prod = produtosBanco.find(p => p.id.toString() === produtoSelecionadoId.toString());
    const qtd = parseInt(quantidadeItem);

    if (!prod) return;
    if (qtd <= 0) return alert('A quantidade deve ser maior que zero!');
    if (prod.estoque < qtd) {
      return alert(`Estoque insuficiente! Você só possui ${prod.estoque} unidades deste produto.`);
    }

    // Verificar se o item já está no carrinho para somar a quantidade
    const itemExistenteIndex = carrinho.findIndex(item => item.produto_id === prod.id);

    if (itemExistenteIndex > -1) {
      const novoCarrinho = [...carrinho];
      const novaQtd = novoCarrinho[itemExistenteIndex].quantidade + qtd;
      if (prod.estoque < novaQtd) {
        return alert(`Estoque insuficiente ao somar itens! Limite máximo: ${prod.estoque} un.`);
      }
      novoCarrinho[itemExistenteIndex].quantidade = novaQtd;
      novoCarrinho[itemExistenteIndex].subtotal = novaQtd * novoCarrinho[itemExistenteIndex].preco_unitario;
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([...carrinho, {
        produto_id: prod.id,
        nome: prod.nome,
        quantidade: qtd,
        preco_unitario: parseFloat(precoUnitario),
        subtotal: qtd * parseFloat(precoUnitario)
      }]);
    }

    // Resetar campos de inserção de item
    setProdutoSelecionadoId('');
    setPrecoUnitario('0.00');
    setQuantidadeItem('1');
  };

  const removerDoCarrinho = (index) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
  };

  // Cálculos Financeiros
  const subtotalVenda = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const valorDescontoNum = parseFloat(desconto) || 0;
  const totalFaturadoVenda = Math.max(0, subtotalVenda - valorDescontoNum);

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return alert('Adicione pelo menos um produto para efetuar a venda!');
    
    try {
      setLoading(true);

      // 1. Inserir registro principal na tabela 'vendas'
      const { data: novaVenda, error: erroVenda } = await supabase
        .from('vendas')
        .insert([{
          valor_total: totalFaturadoVenda,
          forma_pagamento: formaPagamento,
          vendedor: vendedor, 
          cliente_id: clienteId ? clienteId : null // UUID aceito como String pura aqui
        }])
        .select()
        .single();

      if (erroVenda) throw erroVenda;

      // 2. Inserir os itens e atualizar o estoque físico de cada um
      for (const item of carrinho) {
        const { error: erroItem } = await supabase
          .from('vendas_itens')
          .insert([{
            venda_id: novaVenda.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
          }]);

        if (erroItem) throw erroItem;

        // Recupera o estoque atualizado para subtrair com precisão
        const produtoOriginal = produtosBanco.find(p => p.id === item.produto_id);
        const novoEstoque = produtoOriginal.estoque - item.quantidade;

        // Dá a baixa matemática no banco de dados de produtos
        const { error: erroEstoque } = await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id', item.produto_id);

        if (erroEstoque) throw erroEstoque;
      }

      alert('Venda de balcão concluída e estoque atualizado com sucesso!');
      
      // Limpar formulário para a próxima venda
      setCarrinho([]);
      setClienteId('');
      setDesconto('0.00');
      
      // Recarregar lista local de estoques após a transação concluída
      const { data: prodsAtualizados } = await supabase.from('produtos').select('*').order('nome');
      setProdutosBanco(prodsAtualizados || []);

    } catch (error) {
      alert('Erro ao processar venda: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShoppingCart className="text-[#f4bc06]" size={36} />
          Registrar Venda de Balcão
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Efetue vendas diretas de peças e acessórios com baixa automática de estoque.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA DA ESQUERDA: CONFIGURAÇÕES E PRODUTOS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Aba de Detalhes da Venda (Cliente e Vendedor) */}
          <div className="bg-jadel-card border border-zinc-900/80 p-6 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-base font-bold text-[#f4bc06] uppercase tracking-wider border-b border-zinc-900 pb-2">Detalhes da Venda</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Cliente (Opcional)</label>
                <select 
                  value={clienteId} 
                  onChange={(e) => setClienteId(e.target.value)} 
                  className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Venda Consumidor (Não Identificado)</option>
                  {clientesBanco.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Vendedor / Responsável *</label>
                <input 
                  type="text" 
                  required 
                  value={vendedor} 
                  onChange={(e) => setVendedor(e.target.value)} 
                  className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Seção Adicionar Produtos */}
          <div className="bg-jadel-card border border-zinc-900/80 p-6 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-[#f4bc06] uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">Produtos</h2>
            
            <form onSubmit={adicionarAoCarrinho} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-sm">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Produto *</label>
                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => handleProdutoChange(e.target.value)}
                  className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Selecione o produto...</option>
                  {produtosBanco.map(p => (
                    <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                      {p.nome.toUpperCase()} ({p.estoque} un em estoque)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Preço Unitário (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={precoUnitario} 
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Qtd</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantidadeItem} 
                  onChange={(e) => setQuantidadeItem(e.target.value)}
                  className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-center"
                />
              </div>

              <div className="md:col-span-1">
                <button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2.5 rounded-xl transition-colors flex items-center justify-center cursor-pointer h-[42px]"
                  title="Adicionar Produto"
                >
                  <Plus size={18} />
                </button>
              </div>
            </form>

            {/* Listagem de Itens Inseridos */}
            <div className="mt-6 overflow-hidden border border-zinc-900/60 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 tracking-wider uppercase font-semibold">
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-center">Quantidade</th>
                    <th className="p-3">Preço Unitário</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {carrinho.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-zinc-600 font-medium">Nenhum produto adicionado ao carrinho de vendas.</td>
                    </tr>
                  ) : (
                    carrinho.map((item, index) => (
                      <tr key={index} className="hover:bg-zinc-900/10">
                        <td className="p-3 font-medium text-white uppercase">{item.nome}</td>
                        <td className="p-3 text-center font-mono font-bold text-zinc-400">{item.quantidade} un</td>
                        <td className="p-3 text-zinc-400">R$ {item.preco_unitario.toFixed(2)}</td>
                        <td className="p-3 text-white font-semibold">R$ {item.subtotal.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => removerDoCarrinho(index)}
                            className="text-red-500 hover:text-red-400 transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: FECHAMENTO FINANCEIRO */}
        <div className="space-y-6">
          <div className="bg-jadel-card border border-zinc-900/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-full space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#f4bc06] uppercase tracking-wider border-b border-zinc-900 pb-2 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Meio de Pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full bg-jadel-black border border-zinc-900 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                    <option value="Prazo / Boleto">Crediário da Loja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Desconto Aplicado (R$)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                      className="w-full bg-jadel-black border border-zinc-900 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtotais em Destaque Visual */}
            <div className="bg-jadel-black border border-zinc-900 p-4 rounded-xl space-y-2 font-medium">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>SUBTOTAL DOS ITENS:</span>
                <span className="font-mono">R$ {subtotalVenda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-red-400">
                <span>DESCONTO TOTAL:</span>
                <span className="font-mono">- R$ {valorDescontoNum.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-900/80 my-2 pt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#f4bc06]">TOTAL A PAGAR:</span>
                <span className="text-2xl font-extrabold text-[#f4bc06] font-mono">R$ {totalFaturadoVenda.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={finalizarVenda}
              disabled={loading || carrinho.length === 0}
              className="w-full bg-[#f4bc06] disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-3 rounded-xl tracking-wide uppercase transition-all duration-150 hover:bg-amber-400 shadow-lg cursor-pointer text-sm"
            >
              {loading ? 'Processando...' : 'Finalizar e Baixar Estoque'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}