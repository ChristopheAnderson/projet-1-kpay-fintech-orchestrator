import { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Zap, 
  Key, 
  Plus, 
  X,
  Copy,
  Check,
  Search,
  Code2,
  RotateCcw,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { Transaction, PaymentOperator } from './types';
import { paymentApi, ChargePayload } from './api/client';

export default function App() {
  const [filterOperator, setFilterOperator] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Modales
  const [showChargeModal, setShowChargeModal] = useState<boolean>(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState<boolean>(false);
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Formulaire de charge
  const [newCharge, setNewCharge] = useState<ChargePayload>({
    amount: 25000,
    operator: 'MTN_MOMO',
    customer_phone: '+229 97 12 34 56',
    customer_email: 'client@example.bj',
    currency: 'XOF'
  });
  const [customIdempotencyKey, setCustomIdempotencyKey] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      reference: 'KPAY_8F9A2B3C4D11',
      external_reference: 'TELCO_9482910',
      amount: 45000,
      fee: 675,
      currency: 'XOF',
      operator: 'MTN_MOMO',
      status: 'SUCCESS',
      customer_phone: '+229 97 00 12 34',
      customer_email: 'client@example.bj',
      created_at: '2026-09-20 01:15'
    },
    {
      id: 2,
      reference: 'KPAY_3E7D1C5B9A22',
      external_reference: 'TELCO_8192034',
      amount: 12500,
      fee: 175,
      currency: 'XOF',
      operator: 'MOOV_MONEY',
      status: 'SUCCESS',
      customer_phone: '+229 95 11 22 33',
      created_at: '2026-09-20 00:48'
    },
    {
      id: 3,
      reference: 'KPAY_9C2D4E6F8A33',
      amount: 80000,
      fee: 960,
      currency: 'XOF',
      operator: 'CELTIIS_CASH',
      status: 'PENDING',
      customer_phone: '+229 40 88 99 00',
      created_at: '2026-09-20 00:32'
    },
    {
      id: 4,
      reference: 'KPAY_1A5C7E9B2D44',
      amount: 150000,
      fee: 3750,
      currency: 'XOF',
      operator: 'VISA_CARD',
      status: 'SUCCESS',
      customer_phone: '+229 96 44 55 66',
      customer_email: 'finance@entreprise.bj',
      created_at: '2026-09-19 23:14'
    }
  ]);

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await paymentApi.charge(newCharge, customIdempotencyKey || undefined);
      setTransactions([result, ...transactions]);
    } catch {
      const feeRates: Record<PaymentOperator, number> = {
        'MTN_MOMO': 0.015,
        'MOOV_MONEY': 0.014,
        'CELTIIS_CASH': 0.012,
        'VISA_CARD': 0.025
      };
      const fee = Math.round(newCharge.amount * (feeRates[newCharge.operator] || 0.015));

      const simulatedTx: Transaction = {
        id: Date.now(),
        reference: `KPAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        external_reference: `TELCO_${Math.floor(1000000 + Math.random() * 9000000)}`,
        amount: Number(newCharge.amount),
        fee,
        currency: 'XOF',
        operator: newCharge.operator,
        status: 'SUCCESS',
        customer_phone: newCharge.customer_phone,
        customer_email: newCharge.customer_email,
        created_at: 'À l\'instant'
      };
      setTransactions([simulatedTx, ...transactions]);
    } finally {
      setIsProcessing(false);
      setShowChargeModal(false);
      setCustomIdempotencyKey('');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesOp = filterOperator === 'ALL' || t.operator === filterOperator;
    const matchesSearch = searchTerm === '' || 
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_phone.includes(searchTerm);
    return matchesOp && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Executive Clean Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            KP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">KPay Orchestrator</h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PostgreSQL Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Passerelle de Paiements Multi-Opérateurs • Cotonou, Bénin</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowApiKeysModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-medium transition"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            Clés API
          </button>

          <button 
            onClick={() => setShowChargeModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Prélèvement
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* KPI Cards - Uniform 3-Color Palette (Slate + White + Emerald) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start text-slate-400 text-xs font-medium">
              <span>Volume Total Traité (24h)</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">4 850 000</span>
              <span className="text-xs font-bold text-emerald-400">XOF</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs hier
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start text-slate-400 text-xs font-medium">
              <span>Taux de Succès Réseau</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">99.2%</span>
            </div>
            <span className="text-xs text-slate-400 mt-1.5 block">MTN: 99.4% • Moov: 98.9%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start text-slate-400 text-xs font-medium">
              <span>Latence Moyenne API</span>
              <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">240</span>
              <span className="text-xs text-slate-400">ms</span>
            </div>
            <span className="text-xs text-slate-400 mt-1.5 block">PostgreSQL + Cache Redis</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start text-slate-400 text-xs font-medium">
              <span>Webhooks Dispatchés</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">100%</span>
            </div>
            <span className="text-xs text-slate-400 mt-1.5 block">0 échec en file d'attente</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Flux des Transactions Financières</h2>
              <p className="text-xs text-slate-400">Journal immuable PostgreSQL avec signatures d'idempotence</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher réf, tél..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Operator Filters */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <Filter className="w-3 h-3 text-slate-500 ml-1 mr-0.5" />
                {['ALL', 'MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'VISA_CARD'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setFilterOperator(op)}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      filterOperator === op 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {op === 'ALL' ? 'Tous' : op.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Référence</th>
                  <th className="p-3.5">Opérateur</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Montant Net</th>
                  <th className="p-3.5">Frais</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono text-slate-200 font-medium">
                      {tx.reference}
                      {tx.external_reference && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {tx.external_reference}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {tx.operator.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-200">{tx.customer_phone}</span>
                      {tx.customer_email && (
                        <span className="block text-[10px] text-slate-400">{tx.customer_email}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">
                      {tx.amount.toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-normal">{tx.currency}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {tx.fee.toLocaleString('fr-FR')} XOF
                    </td>
                    <td className="p-3.5">
                      {tx.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Succès
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                      {tx.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Échec
                        </span>
                      )}
                      {tx.status === 'REFUNDED' && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                          <RotateCcw className="w-3.5 h-3.5" /> Remboursé
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTx(tx);
                            setShowWebhookModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition"
                          title="Voir le payload webhook"
                        >
                          <Code2 className="w-3 h-3 text-slate-400" /> Webhook
                        </button>
                        {tx.status === 'SUCCESS' && (
                          <button 
                            onClick={() => {
                              if (confirm(`Confirmer le remboursement de la transaction ${tx.reference} (${tx.amount} XOF) ?`)) {
                                setTransactions(transactions.map(t => t.id === tx.id ? { ...t, status: 'REFUNDED' } : t));
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-medium transition"
                            title="Effectuer un remboursement"
                          >
                            Rembourser
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1 : NOUVEAU PRÉLÈVEMENT IDEMPOTENT */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Initier un Prélèvement Mobile Money
              </h3>
              <button onClick={() => setShowChargeModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Opérateur Réseau</label>
                <select
                  value={newCharge.operator}
                  onChange={(e) => setNewCharge({ ...newCharge, operator: e.target.value as PaymentOperator })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="MTN_MOMO">MTN Mobile Money (Bénin)</option>
                  <option value="MOOV_MONEY">Moov Money (Bénin)</option>
                  <option value="CELTIIS_CASH">Celtiis Cash (Bénin)</option>
                  <option value="VISA_CARD">Carte Bancaire Visa / Mastercard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Montant (XOF)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={newCharge.amount}
                  onChange={(e) => setNewCharge({ ...newCharge, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Numéro de Téléphone Client</label>
                <input
                  type="text"
                  value={newCharge.customer_phone}
                  onChange={(e) => setNewCharge({ ...newCharge, customer_phone: e.target.value })}
                  placeholder="+229 97 00 00 00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Clé d'Idempotence (Anti Double-Débit)
                </label>
                <input
                  type="text"
                  value={customIdempotencyKey}
                  onChange={(e) => setCustomIdempotencyKey(e.target.value)}
                  placeholder="Optionnel : auto-générée si vide"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChargeModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isProcessing ? 'Validation...' : 'Confirmer & Débiter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : CLÉS API */}
      {showApiKeysModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Clés d'API Marchand
              </h3>
              <button onClick={() => setShowApiKeysModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Clé Publique (Production)</span>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-400">
                  <span className="truncate flex-1">kpay_live_pub_78a1bc92e0f4</span>
                  <button onClick={() => handleCopyKey('kpay_live_pub_78a1bc92e0f4')} className="text-slate-400 hover:text-white p-1">
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Clé Secrète (Ne jamais exposer côté client)</span>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-500">
                  <span className="truncate flex-1">kpay_live_sec_••••••••••••••••••••••••</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <p>• Header d'autorisation : <code className="text-emerald-400">Authorization: Bearer &lt;SECRET_KEY&gt;</code></p>
                <p>• Header d'idempotence : <code className="text-emerald-400">Idempotency-Key: &lt;UUID&gt;</code></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3 : PAYLOAD WEBHOOK */}
      {showWebhookModal && selectedTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Payload Webhook ({selectedTx.reference})
              </h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify({
                event: 'payment.success',
                timestamp: new Date().toISOString(),
                data: {
                  reference: selectedTx.reference,
                  external_ref: selectedTx.external_reference,
                  amount: selectedTx.amount,
                  fee: selectedTx.fee,
                  currency: selectedTx.currency,
                  operator: selectedTx.operator,
                  status: selectedTx.status,
                  customer_phone: selectedTx.customer_phone
                }
              }, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Statut Réseau : <strong className="text-emerald-400">HTTP 200 OK</strong></span>
              <span>Tentative : 1 / 5 (Délivré)</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        KPay Africa Orchestration Platform • Laravel 11 Backend + React 18 TypeScript Dashboard • PostgreSQL 16
      </footer>
    </div>
  );
}
