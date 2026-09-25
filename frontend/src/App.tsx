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
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Menu,
  Cpu,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import SmartRoutingView from './components/SmartRoutingView';
import DataBackupHubModal from './components/DataBackupHubModal';
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

const INITIAL_TRANSACTIONS: Transaction[] = [
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
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'ledger' | 'simulator' | 'webhooks' | 'apikeys' | 'routing'>('routing');
  const [environment, setEnvironment] = useState<'LIVE' | 'TEST'>('LIVE');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDataHub, setShowDataHub] = useState(false);

  // Transactions State (Initialized with baseline data, dynamic Excel & JSON support)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Webhook Logs
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

  // Api Keys
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperator, setFilterOperator] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
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

  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'LIVE' | 'TEST'>('LIVE');

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
      setSimIdempotencyKey(`idemp_${Date.now()}`);
    }, 850);
  };

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

  // Strict 2-color palette: Corporate Blue (#1D4ED8) + Neutral Slate (#0F172A / #64748B)
  const operatorNames: Record<PaymentOperator, string> = {
    MTN_MOMO: 'MTN MoMo Bénin',
    MOOV_MONEY: 'Moov Money Bénin',
    CELTIIS_CASH: 'Celtiis Cash',
    VISA_CARD: 'Carte Bancaire'
  };

  const chartData = [
    { time: '08:00', volume: 180000 },
    { time: '10:00', volume: 420000 },
    { time: '12:00', volume: 680000 },
    { time: '14:00', volume: 510000 },
    { time: '16:00', volume: 890000 },
    { time: '18:00', volume: 740000 }
  ];

  // Monochromatic Blue/Slate Donut
  const pieData = [
    { name: 'MTN MoMo', value: 48, color: '#1D4ED8' },
    { name: 'Moov Money', value: 32, color: '#3B82F6' },
    { name: 'Celtiis Cash', value: 15, color: '#60A5FA' },
    { name: 'Cartes Visa/MC', value: 5, color: '#94A3B8' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Product Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">KPay Orchestrator</h1>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    FinTech UEMOA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Passerelle de Paiements Multi-Opérateurs</p>
              </div>
            </div>

            {/* Environment Toggle & Action */}
            <div className="flex items-center gap-3">
              {/* Environment Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setEnvironment('LIVE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                    environment === 'LIVE'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  LIVE
                </button>
                <button
                  onClick={() => setEnvironment('TEST')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                    environment === 'TEST'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  TEST
                </button>
              </div>

              {/* Data Management Hub (Excel / JSON / Reset) */}
              <button
                onClick={() => setShowDataHub(true)}
                className="hidden md:flex px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg items-center gap-2 transition shadow-xs"
                title="Gérer la base de données : Excel (.xlsx), JSON ou Restauration usine"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Base Données (Excel/JSON)</span>
              </button>

              {/* Action Button */}
              <button
                onClick={() => setActiveTab('simulator')}
                className="hidden sm:flex px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Simuler Encaissement</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 -mb-px overflow-x-auto pt-1 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de Bord & KPIs</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Grand Livre (Transactions)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-800 font-bold">
                {transactions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Simulateur & Idempotence</span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'webhooks'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Webhooks & Retry Backoff</span>
            </button>
            <button
              onClick={() => setActiveTab('apikeys')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'apikeys'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Sécurité & Clés API</span>
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'routing'
                  ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Smart Routing & Cascading (Drag & Drop)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 animate-pulse">NOUVEAU</span>
            </button>
          </div>

          {/* Mobile Dropdown Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden py-3 border-t border-slate-200 space-y-1">
              {[
                { id: 'routing', label: 'Smart Routing & Cascading (Drag & Drop)', icon: Cpu },
                { id: 'analytics', label: 'Tableau de Bord & KPIs', icon: BarChart3 },
                { id: 'ledger', label: `Grand Livre (${transactions.length})`, icon: ListOrdered },
                { id: 'simulator', label: 'Simulateur & Idempotence', icon: Zap },
                { id: 'webhooks', label: 'Webhooks & Retry Backoff', icon: Radio },
                { id: 'apikeys', label: 'Sécurité & Clés API', icon: Key }
              ].map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-left ${
                      activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
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
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Volume Total Encaissé</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalVolume.toLocaleString()} <span className="text-base font-semibold text-slate-500">XOF</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-700" />
                    +18.4% par rapport au mois précédent
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Taux de Succès Réseau</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {successRate}%
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Disponibilité nominale passerelle
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Commissions Nettes</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalFees.toLocaleString()} <span className="text-base font-semibold text-slate-500">XOF</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Barème moyen appliqué : 1.5%
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Latence Moyenne Telco</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    420 <span className="text-base font-semibold text-slate-500">ms</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Connexion directe USSD & Push Webhook
                  </p>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evolution Chart */}
              <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Évolution du Volume des Flux (XOF)</h3>
                    <p className="text-xs text-slate-500">Tranches horaires de la journée en cours</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    Temps Réel
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" stroke="#64748B" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A' }}
                        formatter={(val: number) => [`${val.toLocaleString()} XOF`, 'Volume']}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#1D4ED8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Operator Distribution Donut */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Répartition par Opérateur</h3>
                  <p className="text-xs text-slate-500">Parts de marché Mobile Money Bénin</p>
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
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-slate-900 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Preview of Last Transactions */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dernières Transactions Validées</h3>
                  <p className="text-xs text-slate-500">Aperçu rapide des flux récents</p>
                </div>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition"
                >
                  Voir tout le Grand Livre <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Opérateur</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.slice(0, 4).map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.reference}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{tx.customer_phone}</div>
                          <div className="text-xs text-slate-500">{tx.customer_email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {operatorNames[tx.operator]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {tx.amount.toLocaleString()} XOF
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : tx.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.status === 'SUCCESS' ? 'Succès' : (tx.status === 'PENDING' ? 'En attente' : 'Échec')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 transition"
                          >
                            Détails
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
        {/* TAB 2: GRAND LIVRE (TRANSACTIONS) */}
        {/* ============================================================== */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Grand Livre des Transactions</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Registre complet inaltérable et audit de conformité financière UEMOA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDataHub(true)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold rounded-lg border border-emerald-300 flex items-center gap-2 transition shadow-xs"
                    title="Synchronisation Excel & JSON"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Base Excel / JSON</span>
                  </button>
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
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Exporter CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Recherche par réf, tél, clé..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={filterOperator}
                    onChange={(e) => setFilterOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ALL">Tous les Opérateurs</option>
                    <option value="MTN_MOMO">MTN Mobile Money</option>
                    <option value="MOOV_MONEY">Moov Money Bénin</option>
                    <option value="CELTIIS_CASH">Celtiis Cash</option>
                    <option value="VISA_CARD">Cartes Visa / Mastercard</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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

            {/* Table */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Horodatage</th>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Opérateur</th>
                      <th className="py-3 px-4 text-right">Montant Brut</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{tx.created_at}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{tx.reference}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{tx.customer_phone}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">{tx.customer_email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {operatorNames[tx.operator]}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          {tx.amount.toLocaleString()} XOF
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-500 whitespace-nowrap">
                          {tx.fee.toLocaleString()} XOF
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : tx.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.status === 'SUCCESS' ? 'Succès' : (tx.status === 'PENDING' ? 'En attente' : 'Échec')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-md text-xs border border-blue-200 transition"
                          >
                            Examiner
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
        {/* TAB 3: SIMULATEUR & IDEMPOTENCE */}
        {/* ============================================================== */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-700" />
                  Simulateur d'Encaissement & Idempotence
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Testez en direct les flux USSD et l'immunité au double débit via l'en-tête Idempotency-Key
                </p>
              </div>

              {simNotification && (
                <div className={`p-4 rounded-lg border text-sm font-semibold flex items-center gap-3 ${
                  simNotification.includes('succès')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {simNotification.includes('succès') ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{simNotification}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Montant de la Charge (XOF)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="input-shadcn text-lg font-extrabold pr-28 text-slate-900 font-display"
                    />
                    <span className="absolute right-3.5 top-2.5 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                      XOF (FCFA)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Numéro Téléphone Client
                    </label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="input-shadcn"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">Détection automatique selon l'indicatif opérateur</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Opérateur Passerelle
                    </label>
                    <select
                      value={simOperator}
                      onChange={(e) => setSimOperator(e.target.value as PaymentOperator)}
                      className="select-shadcn"
                    >
                      <option value="MTN_MOMO">MTN Mobile Money Bénin</option>
                      <option value="MOOV_MONEY">Moov Money Bénin</option>
                      <option value="CELTIIS_CASH">Celtiis Cash Bénin</option>
                      <option value="VISA_CARD">Carte Bancaire Visa / Mastercard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Client
                  </label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    placeholder="client@domaine.bj"
                    className="input-shadcn"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      En-tête HTTP : Idempotency-Key
                    </label>
                    <button
                      onClick={() => setSimIdempotencyKey(`idemp_${Date.now()}`)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Générer nouvelle clé
                    </button>
                  </div>
                  <input
                    type="text"
                    value={simIdempotencyKey}
                    onChange={(e) => setSimIdempotencyKey(e.target.value)}
                    className="input-shadcn font-mono text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Scénario Métier à Tester
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSimScenario('SUCCESS')}
                      className={`p-3 rounded-lg border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'SUCCESS'
                          ? 'bg-blue-50 border-blue-700 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Succès Nominal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimScenario('INSUFFICIENT_FUNDS')}
                      className={`p-3 rounded-lg border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'INSUFFICIENT_FUNDS'
                          ? 'bg-blue-50 border-blue-700 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Solde Insuffisant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimScenario('TIMEOUT')}
                      className={`p-3 rounded-lg border text-left text-xs font-bold transition flex items-center gap-2 ${
                        simScenario === 'TIMEOUT'
                          ? 'bg-blue-50 border-blue-700 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Délai Expiré (Timeout)</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simLoading}
                  className="btn-primary-gradient w-full py-3.5 mt-4 text-sm font-bold shadow-md hover:shadow-lg"
                >
                  {simLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Traitement passerelle en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Déclencher l'Encaissement Idempotent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  Garantie Anti Double-Débit
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L'API vérifie en millisecondes dans le cache Redis et la table PostgreSQL la présence de la clé <code className="text-blue-700 font-mono">Idempotency-Key</code>.
                </p>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
                  <p><strong>1. Requête Initiale :</strong> Création de la transaction en statut PENDING.</p>
                  <p><strong>2. Appel Télécom :</strong> Envoi du push USSD au client mobile.</p>
                  <p><strong>3. Protection Rejeu :</strong> En cas de clic répété avec la même clé, le système renvoie la transaction originale sans générer de nouveau débit.</p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Calcul des Frais</h4>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Montant brut facturé</span>
                  <span className="font-bold text-slate-900">{simAmount.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Commission KPay (1.5%)</span>
                  <span className="font-bold text-slate-700">-{Math.round(simAmount * 0.015).toLocaleString()} XOF</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Net reversé au Marchand</span>
                  <span className="text-blue-700">{(simAmount - Math.round(simAmount * 0.015)).toLocaleString()} XOF</span>
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
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-700" />
                    Journal des Webhooks Marchand & Retry Backoff
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Notification asynchrone sécurisée par HMAC SHA-256 avec stratégie d'Exponential Backoff
                  </p>
                </div>
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  Worker Redis Actif
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100">
                    {webhookLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900">{log.event}</div>
                          <div className="text-xs font-mono text-blue-700">{log.transaction_ref}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600 truncate max-w-[260px]">
                          {log.url}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {log.attempts} / {log.max_attempts}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            log.response_code === 200
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {log.response_code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                          {log.latency_ms} ms
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {log.status === 'DELIVERED' ? 'Délivré' : 'Échoué'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRetryWebhook(log.id)}
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 flex items-center gap-1.5 ml-auto transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
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
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-700" />
                    Gestion des Clés API
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Authentification Bearer, rotation de tokens et restriction par adresses IP
                  </p>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Générer Nouvelle Clé</span>
                </button>
              </div>

              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{key.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            key.environment === 'LIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {key.environment}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Créée le {key.created_at} • Dernière utilisation : {key.last_used_at}</p>
                      </div>

                      <button
                        onClick={() => setApiKeys(prev => prev.filter(k => k.id !== key.id))}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Révoquer
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500">Clé Publique</span>
                          <button
                            onClick={() => handleCopy(key.prefix, `${key.id}_pub`)}
                            className="text-xs text-blue-700 hover:text-blue-800 flex items-center gap-1 font-semibold"
                          >
                            {copiedText === `${key.id}_pub` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedText === `${key.id}_pub` ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                        <code className="text-xs font-mono font-bold text-slate-800">{key.prefix}</code>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500">Clé Secrète</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setVisibleKeyId(visibleKeyId === key.id ? null : key.id)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              {visibleKeyId === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(key.secret, `${key.id}_sec`)}
                              className="text-xs text-blue-700 hover:text-blue-800 flex items-center gap-1 font-semibold"
                            >
                              {copiedText === `${key.id}_sec` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedText === `${key.id}_sec` ? 'Copié' : 'Copier'}
                            </button>
                          </div>
                        </div>
                        <code className="text-xs font-mono font-bold text-slate-800">
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

        {/* ============================================================== */}
        {/* TAB 6: SMART ROUTING & MULTI-PSP CASCADING (DRAG & DROP) */}
        {/* ============================================================== */}
        {activeTab === 'routing' && <SmartRoutingView />}
      </main>

      {/* Drawer: Transaction details */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Détail de la Transaction</h3>
                <p className="font-mono text-xs text-blue-700 font-semibold">{selectedTx.reference}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                selectedTx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {selectedTx.status}
              </span>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {selectedTx.amount.toLocaleString()} <span className="text-base text-slate-500 font-semibold">XOF</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Commission retenue : {selectedTx.fee.toLocaleString()} XOF</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Opérateur</span>
                <span className="font-bold text-slate-800">{operatorNames[selectedTx.operator]}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Client</span>
                <span className="font-bold text-slate-800 font-mono">{selectedTx.customer_phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold text-slate-800">{selectedTx.customer_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Réf. Externe Telco</span>
                <span className="font-mono text-slate-700">{selectedTx.external_reference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Idempotency Key</span>
                <span className="font-mono text-slate-700 truncate max-w-[180px]">{selectedTx.idempotency_key}</span>
              </div>
              {selectedTx.failure_reason && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <strong>Rejet :</strong> {selectedTx.failure_reason}
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => alert(`Reçu de paiement généré pour ${selectedTx.reference}`)}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Api Key */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">Générer une Clé API</h3>
              </div>
              <button 
                onClick={() => setShowNewKeyModal(false)} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nom du Service / Application</span>
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Application Mobile iOS/Android"
                  className="input-shadcn"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Environnement Cible</span>
                </label>
                <select
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value as 'LIVE' | 'TEST')}
                  className="select-shadcn"
                >
                  <option value="LIVE">LIVE (Production - Trafic Réel)</option>
                  <option value="TEST">TEST (Sandbox - Simulation)</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateApiKey}
                className="btn-primary-gradient text-xs px-5 py-2.5"
              >
                Créer la Clé Sécurisée
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Data Backup Hub (Excel / JSON / Factory Reset) */}
      {showDataHub && (
        <DataBackupHubModal
          transactions={transactions}
          initialTransactions={INITIAL_TRANSACTIONS}
          onUpdateTransactions={setTransactions}
          onClose={() => setShowDataHub(false)}
        />
      )}
    </div>
  );
}
