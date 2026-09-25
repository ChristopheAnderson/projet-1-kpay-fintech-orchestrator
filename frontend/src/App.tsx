import { useState, useMemo } from 'react';
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
  RotateCcw, 
  ShieldCheck, 
  Filter,
  BarChart3,
  ListOrdered,
  Radio,
  Send,
  Download,
  AlertTriangle,
  Eye,
  EyeOff,
  Server,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export type PaymentOperator = 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'VISA_CARD';
export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: number;
  reference: string;
  external_reference?: string;
  idempotency_key: string;
  amount: number;
  fee: number;
  currency: string;
  operator: PaymentOperator;
  status: PaymentStatus;
  customer_phone: string;
  customer_email: string;
  failure_reason?: string;
  created_at: string;
  latency_ms: number;
}

export interface WebhookLog {
  id: number;
  transaction_ref: string;
  event: string;
  url: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  attempts: number;
  max_attempts: number;
  response_code: number;
  latency_ms: number;
  signature: string;
  created_at: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  secret: string;
  environment: 'LIVE' | 'TEST';
  scopes: string[];
  created_at: string;
  last_used_at: string;
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'analytics' | 'ledger' | 'simulator' | 'webhooks' | 'apikeys'>('analytics');
  const [environment, setEnvironment] = useState<'LIVE' | 'TEST'>('LIVE');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      reference: 'KPAY_8F9A2B3C4D11',
      external_reference: 'MTN_MOMO_9482910',
      idempotency_key: 'idemp_live_9a8b7c6d5e01',
      amount: 45000,
      fee: 675,
      currency: 'XOF',
      operator: 'MTN_MOMO',
      status: 'SUCCESS',
      customer_phone: '+229 97 00 12 34',
      customer_email: 'a.mensah@cotonou-tech.bj',
      created_at: '2026-09-25 16:42',
      latency_ms: 380,
    },
    {
      id: 2,
      reference: 'KPAY_7E8D1C2B3A09',
      external_reference: 'MOOV_FLOOZ_5829102',
      idempotency_key: 'idemp_live_7e8d1c2b3a02',
      amount: 120000,
      fee: 1800,
      currency: 'XOF',
      operator: 'MOOV_MONEY',
      status: 'SUCCESS',
      customer_phone: '+229 95 11 22 33',
      customer_email: 'finance@afri-import.bj',
      created_at: '2026-09-25 15:30',
      latency_ms: 410,
    },
    {
      id: 3,
      reference: 'KPAY_5A6B7C8D9E04',
      external_reference: 'CELTIIS_CASH_1029384',
      idempotency_key: 'idemp_live_5a6b7c8d9e03',
      amount: 15000,
      fee: 225,
      currency: 'XOF',
      operator: 'CELTIIS_CASH',
      status: 'PENDING',
      customer_phone: '+229 40 88 99 00',
      customer_email: 'contact@boutique-haie-vive.com',
      created_at: '2026-09-25 15:12',
      latency_ms: 620,
    },
    {
      id: 4,
      reference: 'KPAY_3C4D5E6F7A8B',
      external_reference: 'MTN_ERR_TIMEOUT',
      idempotency_key: 'idemp_live_3c4d5e6f7a04',
      amount: 85000,
      fee: 1275,
      currency: 'XOF',
      operator: 'MTN_MOMO',
      status: 'FAILED',
      failure_reason: 'Délai de validation USSD dépassé par l abonné (Timeout)',
      customer_phone: '+229 96 44 55 66',
      customer_email: 's.dossou@gmail.com',
      created_at: '2026-09-25 14:05',
      latency_ms: 2950,
    },
    {
      id: 5,
      reference: 'KPAY_1F2E3D4C5B6A',
      external_reference: 'VISA_AUTH_902819',
      idempotency_key: 'idemp_live_1f2e3d4c5b05',
      amount: 250000,
      fee: 5000,
      currency: 'XOF',
      operator: 'VISA_CARD',
      status: 'SUCCESS',
      customer_phone: '+229 90 12 34 56',
      customer_email: 'direction@logistique-sahel.com',
      created_at: '2026-09-25 12:45',
      latency_ms: 320,
    },
    {
      id: 6,
      reference: 'KPAY_9A8B7C6D5E4F',
      external_reference: 'MOOV_ERR_INSUFFICIENT',
      idempotency_key: 'idemp_live_9a8b7c6d5e06',
      amount: 35000,
      fee: 525,
      currency: 'XOF',
      operator: 'MOOV_MONEY',
      status: 'FAILED',
      failure_reason: 'Solde du portefeuille client insuffisant pour couvrir la charge',
      customer_phone: '+229 94 33 22 11',
      customer_email: 'j.agboton@yahoo.fr',
      created_at: '2026-09-25 11:20',
      latency_ms: 450,
    }
  ]);

  // Webhooks Logs State
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([
    {
      id: 101,
      transaction_ref: 'KPAY_8F9A2B3C4D11',
      event: 'payment.charge.success',
      url: 'https://api.marchand.bj/v1/kpay/webhook',
      status: 'DELIVERED',
      attempts: 1,
      max_attempts: 5,
      response_code: 200,
      latency_ms: 142,
      signature: 'sha256=9b8a7c6f5e4d3c2b1a0f9e8d7c6b5a4',
      created_at: '2026-09-25 16:42:05'
    },
    {
      id: 102,
      transaction_ref: 'KPAY_7E8D1C2B3A09',
      event: 'payment.charge.success',
      url: 'https://api.afri-import.bj/webhooks/kpay',
      status: 'DELIVERED',
      attempts: 1,
      max_attempts: 5,
      response_code: 200,
      latency_ms: 188,
      signature: 'sha256=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
      created_at: '2026-09-25 15:30:12'
    },
    {
      id: 103,
      transaction_ref: 'KPAY_3C4D5E6F7A8B',
      event: 'payment.charge.failed',
      url: 'https://api.marchand.bj/v1/kpay/webhook',
      status: 'FAILED',
      attempts: 3,
      max_attempts: 5,
      response_code: 504,
      latency_ms: 5012,
      signature: 'sha256=4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
      created_at: '2026-09-25 14:05:40'
    }
  ]);

  // Api Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key_1',
      name: 'Plateforme E-Commerce Production',
      prefix: 'pk_live_kpay_89f02a',
      secret: 'sk_live_99d0e82f71b046a39e8c45',
      environment: 'LIVE',
      scopes: ['charges:read', 'charges:write', 'refunds:write'],
      created_at: '2026-01-15',
      last_used_at: 'Il y a 4 minutes'
    },
    {
      id: 'key_2',
      name: 'Environnement Staging & QA Tests',
      prefix: 'pk_test_kpay_44b19c',
      secret: 'sk_test_77a1c42f00d238b18a99f1',
      environment: 'TEST',
      scopes: ['charges:read', 'charges:write'],
      created_at: '2026-02-01',
      last_used_at: 'Il y a 1 heure'
    }
  ]);

  // Filter & Search in Ledger
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperator, setFilterOperator] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Selected Transaction for Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Simulator Form State
  const [simPhone, setSimPhone] = useState('+229 97 45 67 89');
  const [simAmount, setSimAmount] = useState(50000);
  const [simOperator, setSimOperator] = useState<PaymentOperator>('MTN_MOMO');
  const [simEmail, setSimEmail] = useState('client.test@domaine.bj');
  const [simIdempotencyKey, setSimIdempotencyKey] = useState(`idemp_${Date.now()}`);
  const [simScenario, setSimScenario] = useState<'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'TIMEOUT'>('SUCCESS');
  const [simLoading, setSimLoading] = useState(false);
  const [simNotification, setSimNotification] = useState<string | null>(null);

  // Key visibility & Copy feedback
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Key Modal
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'LIVE' | 'TEST'>('LIVE');

  // Auto-detect operator by phone prefix in Benin
  const handlePhoneChange = (val: string) => {
    setSimPhone(val);
    const cleaned = val.replace(/\s+/g, '');
    if (cleaned.includes('97') || cleaned.includes('96') || cleaned.includes('61') || cleaned.includes('51') || cleaned.includes('52') || cleaned.includes('62')) {
      setSimOperator('MTN_MOMO');
    } else if (cleaned.includes('95') || cleaned.includes('94') || cleaned.includes('64') || cleaned.includes('65')) {
      setSimOperator('MOOV_MONEY');
    } else if (cleaned.includes('40') || cleaned.includes('41') || cleaned.includes('42') || cleaned.includes('90')) {
      setSimOperator('CELTIIS_CASH');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Run Simulation
  const handleRunSimulation = () => {
    setSimLoading(true);
    setSimNotification(null);

    setTimeout(() => {
      setSimLoading(false);
      const isSuccess = simScenario === 'SUCCESS';
      const isTimeout = simScenario === 'TIMEOUT';
      const calculatedFee = Math.round(simAmount * 0.015);

      const newTx: Transaction = {
        id: Date.now(),
        reference: `KPAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        external_reference: `${simOperator}_${Math.floor(1000000 + Math.random() * 9000000)}`,
        idempotency_key: simIdempotencyKey,
        amount: Number(simAmount),
        fee: calculatedFee,
        currency: 'XOF',
        operator: simOperator,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        customer_phone: simPhone,
        customer_email: simEmail,
        failure_reason: isSuccess ? undefined : (isTimeout ? 'Délai opérateur dépassé (Timeout)' : 'Solde client insuffisant'),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        latency_ms: isTimeout ? 3100 : (isSuccess ? 390 : 540)
      };

      setTransactions(prev => [newTx, ...prev]);

      // If success, push a webhook dispatch
      if (isSuccess) {
        setWebhookLogs(prev => [
          {
            id: Date.now() + 1,
            transaction_ref: newTx.reference,
            event: 'payment.charge.success',
            url: 'https://api.marchand.bj/v1/kpay/webhook',
            status: 'DELIVERED',
            attempts: 1,
            max_attempts: 5,
            response_code: 200,
            latency_ms: 165,
            signature: `sha256=${Math.random().toString(36).substring(2)}`,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          },
          ...prev
        ]);
      }

      setSimNotification(
        isSuccess 
          ? `Paiement validé avec succès (${simAmount.toLocaleString()} XOF via ${simOperator})`
          : `Échec simulé : ${newTx.failure_reason}`
      );
      // Auto-refresh idempotency key for next transaction
      setSimIdempotencyKey(`idemp_${Date.now()}`);
    }, 850);
  };

  // Retry Webhook
  const handleRetryWebhook = (id: number) => {
    setWebhookLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          attempts: log.attempts + 1,
          status: 'DELIVERED',
          response_code: 200,
          latency_ms: 152
        };
      }
      return log;
    }));
  };

  // Create Key
  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      prefix: newKeyEnv === 'LIVE' ? `pk_live_kpay_${Math.random().toString(36).substring(2, 8)}` : `pk_test_kpay_${Math.random().toString(36).substring(2, 8)}`,
      secret: newKeyEnv === 'LIVE' ? `sk_live_${Math.random().toString(36).substring(2, 16)}` : `sk_test_${Math.random().toString(36).substring(2, 16)}`,
      environment: newKeyEnv,
      scopes: ['charges:read', 'charges:write'],
      created_at: new Date().toISOString().substring(0, 10),
      last_used_at: 'À l instant'
    };
    setApiKeys(prev => [newKey, ...prev]);
    setShowNewKeyModal(false);
    setNewKeyName('');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = 
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customer_phone.includes(searchTerm) ||
        tx.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.idempotency_key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchOperator = filterOperator === 'ALL' || tx.operator === filterOperator;
      const matchStatus = filterStatus === 'ALL' || tx.status === filterStatus;
      return matchSearch && matchOperator && matchStatus;
    });
  }, [transactions, searchTerm, filterOperator, filterStatus]);

  // Aggregate Metrics
  const totalVolume = useMemo(() => {
    return transactions
      .filter(t => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalFees = useMemo(() => {
    return transactions
      .filter(t => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.fee, 0);
  }, [transactions]);

  const successRate = useMemo(() => {
    if (transactions.length === 0) return 0;
    const successes = transactions.filter(t => t.status === 'SUCCESS').length;
    return Math.round((successes / transactions.length) * 100);
  }, [transactions]);

  // Operator badges config with high contrast
  const operatorConfig: Record<PaymentOperator, { label: string; bg: string; text: string; border: string }> = {
    MTN_MOMO: { label: 'MTN MoMo Bénin', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
    MOOV_MONEY: { label: 'Moov Money Bénin', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' },
    CELTIIS_CASH: { label: 'Celtiis Cash', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    VISA_CARD: { label: 'Carte Bancaire', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' }
  };

  const statusConfig: Record<PaymentStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    SUCCESS: { label: 'Succès', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40', icon: CheckCircle2 },
    PENDING: { label: 'En attente', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40', icon: Clock },
    FAILED: { label: 'Échec', bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/40', icon: XCircle },
    REFUNDED: { label: 'Remboursé', bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/40', icon: RotateCcw }
  };

  // Recharts Chart Data
  const chartData = [
    { time: '08:00', volume: 180000, transactions: 12 },
    { time: '10:00', volume: 420000, transactions: 28 },
    { time: '12:00', volume: 680000, transactions: 44 },
    { time: '14:00', volume: 510000, transactions: 35 },
    { time: '16:00', volume: 890000, transactions: 58 },
    { time: '18:00', volume: 740000, transactions: 46 }
  ];

  const pieData = [
    { name: 'MTN MoMo', value: 48, color: '#F59E0B' },
    { name: 'Moov Money', value: 32, color: '#3B82F6' },
    { name: 'Celtiis Cash', value: 15, color: '#10B981' },
    { name: 'Cartes Visa/MC', value: 5, color: '#8B5CF6' }
  ];

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-[#0D1424] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">KPay Orchestrator</h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    FinTech UEMOA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Passerelle & Agrégation de Paiements Multi-Opérateurs</p>
              </div>
            </div>

            {/* Environment Toggle & Actions */}
            <div className="flex items-center gap-3">
              {/* Environment Switcher */}
              <div className="flex items-center bg-[#131D33] p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setEnvironment('LIVE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                    environment === 'LIVE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE (Prod)
                </button>
                <button
                  onClick={() => setEnvironment('TEST')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                    environment === 'TEST'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  SANDBOX
                </button>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-900/30 border border-blue-400/30 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Simuler Encaissement</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-white bg-blue-500/10'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Tableau de Bord & KPIs</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'border-blue-500 text-white bg-blue-500/10'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Grand Livre (Transactions)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-200 font-bold">
                {transactions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'border-blue-500 text-white bg-blue-500/10'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Simulateur & Idempotence</span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'webhooks'
                  ? 'border-blue-500 text-white bg-blue-500/10'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Webhooks & Retry Backoff</span>
            </button>
            <button
              onClick={() => setActiveTab('apikeys')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'apikeys'
                  ? 'border-blue-500 text-white bg-blue-500/10'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Sécurité & Clés API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============================================================== */}
        {/* TAB 1: ANALYTICS & KPIS */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Volume Total Encaissé</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {totalVolume.toLocaleString()} <span className="text-base text-blue-300 font-semibold">XOF</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +18.4% par rapport au mois précédent
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Taux de Succès Réseau</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {successRate}%
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Haute disponibilité passerelle UEMOA
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Commissions Nettes</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {totalFees.toLocaleString()} <span className="text-base text-indigo-300 font-semibold">XOF</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">
                    Barème moyen appliqué : 1.5%
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Latence Moyenne Telco</span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    420 <span className="text-base text-cyan-300 font-semibold">ms</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-cyan-400">
                    Connexion directe USSD & Push Webhook
                  </p>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evolution Chart */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Évolution du Volume des Flux (XOF)</h3>
                    <p className="text-xs font-medium text-slate-300">Tranches horaires de la journée en cours</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Temps Réel
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        formatter={(val: number) => [`${val.toLocaleString()} XOF`, 'Volume']}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Operator Distribution Donut */}
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Répartition par Opérateur</h3>
                  <p className="text-xs font-medium text-slate-300">Parts de marché Mobile Money Bénin</p>
                </div>
                <div className="h-48 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-white font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Preview of Last Transactions */}
            <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Dernières Transactions Validées</h3>
                  <p className="text-xs font-medium text-slate-300">Aperçu rapide des flux récents</p>
                </div>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                >
                  Voir tout le Grand Livre <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#16213A] text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Opérateur</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {transactions.slice(0, 4).map(tx => {
                      const op = operatorConfig[tx.operator];
                      const st = statusConfig[tx.status];
                      const StatusIcon = st.icon;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-white">{tx.reference}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{tx.customer_phone}</div>
                            <div className="text-xs text-slate-400">{tx.customer_email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${op.bg} ${op.text} ${op.border}`}>
                              {op.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-white">
                            {tx.amount.toLocaleString()} XOF
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition"
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GRAND LIVRE (TRANSACTIONS) */}
        {/* ============================================================== */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Grand Livre des Transactions</h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-300">
                    Registre complet inaltérable et audit de conformité financière UEMOA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," + 
                        ["Reference,Montant,Frais,Operateur,Statut,Client,Date",
                          ...transactions.map(t => `${t.reference},${t.amount},${t.fee},${t.operator},${t.status},${t.customer_phone},${t.created_at}`)
                        ].join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `kpay_transactions_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3.5 py-2 bg-[#1A2642] hover:bg-[#23335A] text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Exporter CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Recherche par réf, téléphone, email, clé..."
                    className="w-full bg-[#0D1527] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* Operator Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={filterOperator}
                    onChange={(e) => setFilterOperator(e.target.value)}
                    className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Tous les Opérateurs</option>
                    <option value="MTN_MOMO">MTN Mobile Money</option>
                    <option value="MOOV_MONEY">Moov Money Bénin</option>
                    <option value="CELTIIS_CASH">Celtiis Cash</option>
                    <option value="VISA_CARD">Cartes Visa / Mastercard</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Tous les Statuts</option>
                    <option value="SUCCESS">Succès (Validé)</option>
                    <option value="PENDING">En attente (Pending)</option>
                    <option value="FAILED">Échecs</option>
                    <option value="REFUNDED">Remboursés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#16213A] text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Horodatage</th>
                      <th className="py-3 px-4">Référence Unique</th>
                      <th className="py-3 px-4">Client & Contact</th>
                      <th className="py-3 px-4">Opérateur Réseau</th>
                      <th className="py-3 px-4 text-right">Montant Brut</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                          Aucune transaction trouvée correspondant à vos critères de recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => {
                        const op = operatorConfig[tx.operator];
                        const st = statusConfig[tx.status];
                        const StatusIcon = st.icon;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                              {tx.created_at}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                              {tx.reference}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-200">{tx.customer_phone}</div>
                              <div className="text-xs text-slate-400 truncate max-w-[180px]">{tx.customer_email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${op.bg} ${op.text} ${op.border}`}>
                                {op.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-white whitespace-nowrap">
                              {tx.amount.toLocaleString()} XOF
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-300 whitespace-nowrap">
                              {tx.fee.toLocaleString()} XOF
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {st.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedTx(tx)}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold rounded-lg text-xs border border-blue-500/40 transition"
                              >
                                Examiner
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SIMULATEUR & IDEMPOTENCE */}
        {/* ============================================================== */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Simulation Form */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Simulateur d'Encaissement & Verrouillage d'Idempotence
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
                  Testez en direct les flux USSD et l'immunité au double débit via l'en-tête Idempotency-Key
                </p>
              </div>

              {simNotification && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-3 ${
                  simNotification.includes('succès')
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  {simNotification.includes('succès') ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{simNotification}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Montant */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Montant de la Charge (XOF)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-4 py-3 text-lg font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-bold text-blue-400">
                      XOF (FCFA)
                    </span>
                  </div>
                </div>

                {/* Téléphone & Détection Opérateur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Numéro Téléphone Client
                    </label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Détection automatique selon l'indicatif Bénin</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Opérateur Passerelle Détecté
                    </label>
                    <select
                      value={simOperator}
                      onChange={(e) => setSimOperator(e.target.value as PaymentOperator)}
                      className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MTN_MOMO">MTN Mobile Money Bénin</option>
                      <option value="MOOV_MONEY">Moov Money Bénin</option>
                      <option value="CELTIIS_CASH">Celtiis Cash Bénin</option>
                      <option value="VISA_CARD">Carte Visa / Mastercard</option>
                    </select>
                  </div>
                </div>

                {/* Email Client */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Client (Reçu & Notification)
                  </label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Idempotency Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      En-tête HTTP : Idempotency-Key
                    </label>
                    <button
                      onClick={() => setSimIdempotencyKey(`idemp_${Date.now()}`)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Générer nouvelle clé
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={simIdempotencyKey}
                      onChange={(e) => setSimIdempotencyKey(e.target.value)}
                      className="w-full bg-[#0D1527] border border-slate-700 rounded-xl font-mono text-xs px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Garantit qu'un réessai réseau ne débitera jamais le client deux fois.
                  </p>
                </div>

                {/* Scénario Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Scénario Métier à Tester
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSimScenario('SUCCESS')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'SUCCESS'
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                          : 'bg-[#0D1527] border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Validation Succès (Nominal)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimScenario('INSUFFICIENT_FUNDS')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'INSUFFICIENT_FUNDS'
                          ? 'bg-rose-950/50 border-rose-500 text-rose-200'
                          : 'bg-[#0D1527] border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Solde Insuffisant (Échec)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimScenario('TIMEOUT')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'TIMEOUT'
                          ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                          : 'bg-[#0D1527] border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Délai Expiré (Timeout USSD)</span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simLoading}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition"
                >
                  {simLoading ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      <span>Communication avec la passerelle telco...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Déclencher l'Encaissement Idempotent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Architecture Explanation Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Architecture Anti Double-Débit
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  L'API vérifie en millisecondes dans le cache Redis et la table PostgreSQL la présence de la clé <code className="text-blue-300 font-mono">Idempotency-Key</code>.
                </p>

                <div className="mt-4 p-4 rounded-xl bg-[#090D1A] border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-xs text-slate-300">
                      <strong>Requête Initiale :</strong> Création de la transaction en statut <span className="text-amber-400 font-bold">PENDING</span> avec enregistrement du token.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-xs text-slate-300">
                      <strong>Push USSD Télécom :</strong> Appel direct vers les passerelles partenaires (MTN, Moov, Celtiis).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="text-xs text-slate-300">
                      <strong>Rejeu Involontaire :</strong> Si le client double-clique avec la même clé, le système renvoie la réponse existante <span className="text-emerald-400 font-bold">sans créer de débit supplémentaire</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Calculator Summary */}
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Calculateur de Frais Transparent
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Montant brut facturé</span>
                    <span className="font-bold text-white">{simAmount.toLocaleString()} XOF</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Commission KPay (1.5%)</span>
                    <span className="font-bold text-indigo-400">-{Math.round(simAmount * 0.015).toLocaleString()} XOF</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-emerald-400">
                    <span>Net reversé au Marchand</span>
                    <span>{(simAmount - Math.round(simAmount * 0.015)).toLocaleString()} XOF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: WEBHOOKS & RETRY BACKOFF */}
        {/* ============================================================== */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400" />
                    Journal des Webhooks Marchand & Retry Backoff
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
                    Notification asynchrone sécurisée par HMAC SHA-256 avec stratégie d'Exponential Backoff (5 tentatives)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Worker Redis Actif
                  </span>
                </div>
              </div>

              {/* Webhook Logs Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#16213A] text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Événement & Réf</th>
                      <th className="py-3 px-4">URL Endpoint Marchand</th>
                      <th className="py-3 px-4 text-center">Tentative</th>
                      <th className="py-3 px-4 text-center">Code HTTP</th>
                      <th className="py-3 px-4 text-right">Latence</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {webhookLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-white">{log.event}</div>
                          <div className="text-xs font-mono text-blue-400">{log.transaction_ref}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300 truncate max-w-[260px]">
                          {log.url}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                          {log.attempts} / {log.max_attempts}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            log.response_code === 200
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {log.response_code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
                          {log.latency_ms} ms
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/40'
                          }`}>
                            {log.status === 'DELIVERED' ? 'Délivré' : 'Échoué'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRetryWebhook(log.id)}
                            className="px-3 py-1 bg-[#1A2642] hover:bg-[#23335A] text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1.5 ml-auto transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                            <span>Retry</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SÉCURITÉ & CLÉS API */}
        {/* ============================================================== */}
        {activeTab === 'apikeys' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111A2E] border border-slate-700/80 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-emerald-400" />
                    Gestion Sécurisée des Clés API
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
                    Authentification Bearer, rotation de tokens et restriction par adresses IP
                  </p>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-md border border-emerald-400/30 flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Générer Nouvelle Clé</span>
                </button>
              </div>

              {/* Api Keys Cards */}
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-5 rounded-xl bg-[#0D1527] border border-slate-700/80 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{key.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            key.environment === 'LIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {key.environment}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Créée le {key.created_at} • Utilisée : {key.last_used_at}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setApiKeys(prev => prev.filter(k => k.id !== key.id));
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition"
                        >
                          Révoquer
                        </button>
                      </div>
                    </div>

                    {/* Keys Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Public Key */}
                      <div className="p-3 rounded-lg bg-[#070B16] border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400">Clé Publique (Client-Side)</span>
                          <button
                            onClick={() => handleCopy(key.prefix, `${key.id}_pub`)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                          >
                            {copiedText === `${key.id}_pub` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedText === `${key.id}_pub` ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                        <code className="text-xs font-mono font-bold text-slate-200">{key.prefix}</code>
                      </div>

                      {/* Secret Key */}
                      <div className="p-3 rounded-lg bg-[#070B16] border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400">Clé Secrète (Backend Server)</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setVisibleKeyId(visibleKeyId === key.id ? null : key.id)}
                              className="text-xs text-slate-400 hover:text-slate-200"
                            >
                              {visibleKeyId === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(key.secret, `${key.id}_sec`)}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                            >
                              {copiedText === `${key.id}_sec` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedText === `${key.id}_sec` ? 'Copié' : 'Copier'}
                            </button>
                          </div>
                        </div>
                        <code className="text-xs font-mono font-bold text-indigo-300">
                          {visibleKeyId === key.id ? key.secret : '••••••••••••••••••••••••••••••••'}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* DRAWER : DÉTAIL D'UNE TRANSACTION */}
      {/* ============================================================== */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-[#0D1527] border-l border-slate-700 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Détail de la Transaction</h3>
                <p className="font-mono text-xs text-blue-400">{selectedTx.reference}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Amount Hero */}
            <div className="p-4 rounded-xl bg-[#131D33] border border-slate-700/80 text-center">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                statusConfig[selectedTx.status].bg
              } ${statusConfig[selectedTx.status].text}`}>
                {statusConfig[selectedTx.status].label}
              </span>
              <p className="text-3xl font-black text-white mt-2">
                {selectedTx.amount.toLocaleString()} <span className="text-lg text-blue-400 font-bold">XOF</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Frais retenus : {selectedTx.fee.toLocaleString()} XOF</p>
            </div>

            {/* Information Grid */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Opérateur</span>
                <span className="font-bold text-white">{operatorConfig[selectedTx.operator].label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Téléphone Client</span>
                <span className="font-bold text-white font-mono">{selectedTx.customer_phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Email Client</span>
                <span className="font-bold text-white">{selectedTx.customer_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Réf. Externe Telco</span>
                <span className="font-mono text-xs font-bold text-slate-200">{selectedTx.external_reference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Idempotency Key</span>
                <span className="font-mono text-xs font-bold text-indigo-300 truncate max-w-[180px]">{selectedTx.idempotency_key}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Latence Réseau</span>
                <span className="font-mono text-xs font-bold text-emerald-300">{selectedTx.latency_ms} ms</span>
              </div>
              {selectedTx.failure_reason && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                  <strong>Motif du rejet :</strong> {selectedTx.failure_reason}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => {
                  alert(`Reçu de paiement généré pour ${selectedTx.reference}`);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Reçu Officiel</span>
              </button>
              {selectedTx.status === 'SUCCESS' && (
                <button
                  onClick={() => {
                    setTransactions(prev => prev.map(t => t.id === selectedTx.id ? { ...t, status: 'REFUNDED' } : t));
                    setSelectedTx(prev => prev ? { ...prev, status: 'REFUNDED' } : null);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Simuler un Remboursement</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL : NOUVELLE CLÉ API */}
      {/* ============================================================== */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0D1527] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Générer une Nouvelle Clé API</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nom du Service ou Application
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ex: Application Mobile iOS/Android"
                className="w-full bg-[#090D1A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Environnement Cible
              </label>
              <select
                value={newKeyEnv}
                onChange={(e) => setNewKeyEnv(e.target.value as 'LIVE' | 'TEST')}
                className="w-full bg-[#090D1A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="LIVE">LIVE (Production)</option>
                <option value="TEST">TEST (Sandbox)</option>
              </select>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateApiKey}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition"
              >
                Créer la Paire de Clés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
