import { useState } from 'react';
import { 
  GripVertical, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Globe, 
  DollarSign, 
  Layers, 
  Cpu, 
  Play, 
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  logoColor: string;
  type: 'MOBILE_MONEY' | 'CARD' | 'FINTECH';
  region: string;
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE';
  successRate: number;
  latencyMs: number;
  feePercent: number;
  fixedFee: number;
  priority: number;
}

export interface RoutingRule {
  id: string;
  title: string;
  condition: string;
  action: string;
  enabled: boolean;
  tag: string;
}

export default function SmartRoutingView() {
  // Gateways List for Drag & Drop Reordering
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'gw-1',
      name: 'MTN Mobile Money',
      code: 'MTN_MOMO',
      logoColor: 'bg-yellow-400 text-slate-900 border-yellow-500',
      type: 'MOBILE_MONEY',
      region: 'Bénin, Côte d\'Ivoire, Ghana',
      status: 'ACTIVE',
      successRate: 99.2,
      latencyMs: 180,
      feePercent: 1.2,
      fixedFee: 0,
      priority: 1
    },
    {
      id: 'gw-2',
      name: 'Moov Money (Flooz)',
      code: 'MOOV_MONEY',
      logoColor: 'bg-blue-600 text-white border-blue-700',
      type: 'MOBILE_MONEY',
      region: 'Bénin, Togo, Côte d\'Ivoire',
      status: 'ACTIVE',
      successRate: 98.6,
      latencyMs: 210,
      feePercent: 1.1,
      fixedFee: 0,
      priority: 2
    },
    {
      id: 'gw-3',
      name: 'Celtiis Cash (SBIN)',
      code: 'CELTIIS_CASH',
      logoColor: 'bg-emerald-600 text-white border-emerald-700',
      type: 'MOBILE_MONEY',
      region: 'Bénin National',
      status: 'ACTIVE',
      successRate: 97.9,
      latencyMs: 195,
      feePercent: 0.9,
      fixedFee: 0,
      priority: 3
    },
    {
      id: 'gw-4',
      name: 'Wave Money WAEMU',
      code: 'WAVE_CASH',
      logoColor: 'bg-cyan-500 text-white border-cyan-600',
      type: 'FINTECH',
      region: 'Sénégal, Côte d\'Ivoire',
      status: 'STANDBY',
      successRate: 99.5,
      latencyMs: 140,
      feePercent: 1.0,
      fixedFee: 0,
      priority: 4
    },
    {
      id: 'gw-5',
      name: 'Carte Bancaire Visa / Mastercard 3DS2',
      code: 'CARD_VISA_MC',
      logoColor: 'bg-indigo-700 text-white border-indigo-800',
      type: 'CARD',
      region: 'International & UEMOA',
      status: 'ACTIVE',
      successRate: 96.8,
      latencyMs: 340,
      feePercent: 2.5,
      fixedFee: 100,
      priority: 5
    }
  ]);

  // Drag and Drop state
  const [draggedGatewayId, setDraggedGatewayId] = useState<string | null>(null);
  const [dragOverGatewayId, setDragOverGatewayId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Smart Routing Rules state
  const [rules, setRules] = useState<RoutingRule[]>([
    {
      id: 'r-1',
      title: 'Auto-Failover Multi-PSP Instantané',
      condition: 'Si Latence > 800ms OU Réponse HTTP 5xx',
      action: 'Bascule automatique sur la passerelle suivante en < 50ms',
      enabled: true,
      tag: 'Résilience 99.99%'
    },
    {
      id: 'r-2',
      title: 'Paiements Grands Montants (> 500 000 XOF)',
      condition: 'Montant unitaire >= 500 000 XOF',
      action: 'Routage forcé vers Carte 3D-Secure V2 avec contrôle anti-fraude strict',
      enabled: true,
      tag: 'Haute Sécurité'
    },
    {
      id: 'r-3',
      title: 'Least Cost Routing (Optimisation des Frais)',
      condition: 'Transactions récurrentes / Abonnements',
      action: 'Priorité automatique au fournisseur avec le taux de commission le plus bas',
      enabled: true,
      tag: 'Économie Frais'
    },
    {
      id: 'r-4',
      title: 'Routage Géolocalisé UEMOA / International',
      condition: 'Carte ou IP étrangère hors zone UEMOA',
      action: 'Bascule automatique sur passerelle internationale multi-devises',
      enabled: false,
      tag: 'Cross-Border'
    }
  ]);

  // Cascading Simulation State
  const [simAmount, setSimAmount] = useState<number>(35000);
  const [injectOutage, setInjectOutage] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    step1: { gateway: string; status: 'SUCCESS' | 'FAILED'; latency: number; error?: string };
    step2?: { gateway: string; status: 'SUCCESS' | 'FAILED'; latency: number };
    totalLatency: number;
    recovered: boolean;
  } | null>(null);

  // AI Fraud Scoring Interactive State
  const [fraudVelocity, setFraudVelocity] = useState<number>(1);
  const [fraudVpnDetected, setFraudVpnDetected] = useState<boolean>(false);
  const [fraudCountryMismatch, setFraudCountryMismatch] = useState<boolean>(false);

  // Calculate Fraud Score
  const fraudScore = Math.min(
    100,
    (fraudVelocity > 3 ? 35 : fraudVelocity > 1 ? 15 : 5) +
    (fraudVpnDetected ? 40 : 0) +
    (fraudCountryMismatch ? 25 : 0)
  );

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedGatewayId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverGatewayId !== id) {
      setDragOverGatewayId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedGatewayId;
    if (!sourceId || sourceId === targetId) {
      setDraggedGatewayId(null);
      setDragOverGatewayId(null);
      return;
    }

    const currentList = [...gateways];
    const sourceIndex = currentList.findIndex(g => g.id === sourceId);
    const targetIndex = currentList.findIndex(g => g.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const [movedItem] = currentList.splice(sourceIndex, 1);
      currentList.splice(targetIndex, 0, movedItem);

      // Re-assign priorities
      const updated = currentList.map((g, idx) => ({
        ...g,
        priority: idx + 1
      }));

      setGateways(updated);
      showNotification(`Priorité mise à jour : ${movedItem.name} est maintenant en Priorité ${targetIndex + 1} !`);
    }

    setDraggedGatewayId(null);
    setDragOverGatewayId(null);
  };

  // Run Cascading Simulator
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);

    const primaryGateway = gateways[0];
    const secondaryGateway = gateways[1];

    setTimeout(() => {
      if (injectOutage) {
        // Step 1 fails, Step 2 succeeds (Cascading)
        setTimeout(() => {
          setSimResult({
            step1: {
              gateway: primaryGateway.name,
              status: 'FAILED',
              latency: 310,
              error: 'HTTP 503 Service Unavailable (Panne Opérateur Simulée)'
            },
            step2: {
              gateway: secondaryGateway.name,
              status: 'SUCCESS',
              latency: 185
            },
            totalLatency: 310 + 42 + 185,
            recovered: true
          });
          setIsSimulating(false);
          showNotification('Cascading réussi : Échec intercepté et transaction sauvée sur Moov !');
        }, 800);
      } else {
        // Direct success
        setSimResult({
          step1: {
            gateway: primaryGateway.name,
            status: 'SUCCESS',
            latency: primaryGateway.latencyMs
          },
          totalLatency: primaryGateway.latencyMs,
          recovered: false
        });
        setIsSimulating(false);
        showNotification(`Transaction validée directement via ${primaryGateway.name} !`);
      }
    }, 700);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-500/40 animate-slideUp">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-400/30">
              <Cpu className="w-3.5 h-3.5" />
              Algorithme Intelligent de Routage Dynamique
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Constructeur de Routage & Cascading Multi-PSP
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Organisez visuellement l'ordre d'exécution de vos passerelles de paiement par <strong>glisser-déposer</strong>. 
              En cas d'indisponibilité d'un opérateur télécom, le moteur KPay bascule automatiquement en quelques millisecondes sur le secours configuré.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-xs text-blue-200 block font-medium">Taux de Rétention Panier</span>
              <span className="text-2xl font-black text-emerald-400">99.98%</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-xs text-blue-200 block font-medium">Temps de Bascule Failover</span>
              <span className="text-2xl font-black text-yellow-300">&lt; 45 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Drag & Drop Gateways + Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): DRAG & DROP GATEWAY PIPELINE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-700" />
                Pipeline d'Exécution & Ordre de Priorité
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Glissez-déposez les cartes pour changer l'ordre de priorité du routage
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              5 Passerelles Connectées
            </span>
          </div>

          {/* Drag & Drop Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Astuce Glisser-Déposer :</strong> Cliquez et déplacez une passerelle vers le haut ou vers le bas pour redéfinir instantanément le chemin de basculement.
            </span>
          </div>

          {/* Draggable Cards */}
          <div className="space-y-3">
            {gateways.map((gw, index) => {
              const isDragged = draggedGatewayId === gw.id;
              const isOver = dragOverGatewayId === gw.id;

              return (
                <div
                  key={gw.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, gw.id)}
                  onDragOver={(e) => handleDragOver(e, gw.id)}
                  onDrop={(e) => handleDrop(e, gw.id)}
                  onDragEnd={() => {
                    setDraggedGatewayId(null);
                    setDragOverGatewayId(null);
                  }}
                  className={`group relative p-4 rounded-xl border bg-white shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                    isDragged ? 'opacity-40 scale-95 border-blue-500 bg-blue-50/40' : ''
                  } ${
                    isOver ? 'ring-2 ring-blue-600 border-blue-600 scale-[1.01] bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Drag Grip + Priority Badge + Details */}
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded text-slate-400 group-hover:text-blue-600 transition">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                        index === 0 
                          ? 'bg-blue-700 text-white' 
                          : index === 1 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        #{gw.priority}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{gw.name}</h4>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                              Primaire (Actif)
                            </span>
                          )}
                          {index === 1 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                              Secours Immédiat
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{gw.region}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{gw.code}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Metrics & Status */}
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Taux Succès</span>
                        <span className="text-xs font-bold text-emerald-600">{gw.successRate}%</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[11px] text-slate-400 block font-medium">Latence</span>
                        <span className="text-xs font-bold text-slate-700">{gw.latencyMs}ms</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[11px] text-slate-400 block font-medium">Frais</span>
                        <span className="text-xs font-bold text-slate-700">{gw.feePercent}%</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        gw.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {gw.status === 'ACTIVE' ? 'Opérationnel' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): RULES & AI FRAUD SCORER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart Rules Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-700" />
                Règles de Routage Automatisées
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {rules.filter(r => r.enabled).length}/{rules.length} Actives
              </span>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    rule.enabled 
                      ? 'bg-blue-50/50 border-blue-300 shadow-sm' 
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rule.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border text-blue-700 shadow-2xs">
                          {rule.tag}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mt-1">
                        <span className="font-semibold text-blue-900">Condition :</span> {rule.condition}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Action :</span> {rule.action}
                      </p>
                    </div>

                    <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
                      rule.enabled ? 'bg-blue-700 justify-end' : 'bg-slate-300 justify-start'
                    }`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Fraud & Risk Scoring Simulator */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Matrice Anti-Fraude & Scoring IA
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                fraudScore < 35 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : fraudScore < 70 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-rose-100 text-rose-800'
              }`}>
                Score : {fraudScore}/100
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Ajustez les paramètres comportementaux pour tester le déclenchement des protocoles de sécurité :
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Vélocité de paiements (tentatives / 5 min) :</span>
                  <span className="font-mono text-blue-700">{fraudVelocity} tentatives</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="6" 
                  value={fraudVelocity}
                  onChange={(e) => setFraudVelocity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 font-medium">Détection IP Proxy / Tor / VPN :</span>
                <button
                  type="button"
                  onClick={() => setFraudVpnDetected(!fraudVpnDetected)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    fraudVpnDetected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fraudVpnDetected ? 'OUI (+40 pts)' : 'NON'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Discordance Pays IP vs Carte BIN :</span>
                <button
                  type="button"
                  onClick={() => setFraudCountryMismatch(!fraudCountryMismatch)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    fraudCountryMismatch ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fraudCountryMismatch ? 'OUI (+25 pts)' : 'NON'}
                </button>
              </div>
            </div>

            {/* Fraud Verdict Box */}
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
              fraudScore < 35 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : fraudScore < 70 
                  ? 'bg-amber-50 border-amber-200 text-amber-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {fraudScore < 35 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : fraudScore < 70 ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div>
                <strong>Verdict IA : </strong>
                {fraudScore < 35 && 'Risque Faible — Routage direct sans friction client.'}
                {fraudScore >= 35 && fraudScore < 70 && 'Risque Modéré — Déclenchement automatique 3D-Secure V2 / OTP.'}
                {fraudScore >= 70 && 'Risque Critique — Blocage préventif anti-fraude immédiat.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cascading & Failover Live Simulator */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
              <Zap className="w-3.5 h-3.5" />
              Laboratoire de Résilience Multi-PSP
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Simulateur de Panne Opérateur & Auto-Cascading en Direct
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Testez le comportement de KPay lorsqu'un opérateur télécom subit un incident réseau : visualisez la bascule automatique vers le secours.
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulation en cours...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Lancer le Test de Cascading</span>
              </>
            )}
          </button>
        </div>

        {/* Simulator Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Montant Transaction (XOF) :</label>
            <input 
              type="number" 
              value={simAmount} 
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm focus:outline-blue-600"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Numéro Client Test :</label>
            <input 
              type="text" 
              readOnly 
              value="+229 97 00 11 22 (Bénin)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm bg-slate-100 text-slate-600"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={injectOutage}
                onChange={(e) => setInjectOutage(e.target.checked)}
                className="w-4 h-4 rounded text-blue-700 accent-blue-700"
              />
              <span className="font-semibold text-rose-700">
                Simuler panne réseau sur {gateways[0].name} (HTTP 503)
              </span>
            </label>
          </div>
        </div>

        {/* Live Waterfall Visualization */}
        {simResult && (
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-blue-400">TRACE EXÉCUTION KPay-Cascading-v2</span>
              <span className="text-xs font-mono text-emerald-400">Latence Totale : {simResult.totalLatency} ms</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 ${
                  simResult.step1.status === 'SUCCESS' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      Tentative Priorité 1 : {simResult.step1.gateway}
                    </span>
                    <span className="text-slate-400">{simResult.step1.latency} ms</span>
                  </div>
                  {simResult.step1.status === 'FAILED' ? (
                    <div className="text-rose-400 mt-1 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{simResult.step1.error}</span>
                    </div>
                  ) : (
                    <div className="text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approbation confirmée sans incident (200 OK)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 (Cascading if recovered) */}
              {simResult.step2 && (
                <div className="flex items-start gap-3 pl-4 border-l-2 border-yellow-500/60 ml-2.5 py-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px] mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-yellow-300">
                        ⚡ Auto-Failover KPay Déclenché &rarr; {simResult.step2.gateway}
                      </span>
                      <span className="text-slate-400">{simResult.step2.latency} ms</span>
                    </div>
                    <div className="text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paiement encaissé avec succès (200 OK) — Panier sauvé à 100% !</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Webhook de confirmation expédié au serveur marchand avec signature HMAC-SHA256.
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                STATUT FINAL : PAIEMENT RÉUSSI
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* FEATURE 4: MULTI-CURRENCY SMART WALLET & FX HEDGING */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
              <Globe className="w-3.5 h-3.5" />
              Trésorerie Cross-Border & Change Automatisé
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display">
              Portefeuille Multi-Devises & Convertisseur FX Instantané
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gérez vos encaissements régionaux et internationaux (XOF, EUR, USD, NGN, GHS) avec couverture du risque de change et conversion sans slippage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              Garantie Taux Spot : 15 min
            </span>
          </div>
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {[
            { cur: 'XOF', flag: '🇧🇯', name: 'Franc CFA', balance: '18 450 000', rate: '1.00 XOF (Base)' },
            { cur: 'EUR', flag: '🇪🇺', name: 'Euro SEPA', balance: '14 250 €', rate: '655.957 XOF' },
            { cur: 'USD', flag: '🇺🇸', name: 'US Dollar', balance: '8 900 $', rate: '602.40 XOF' },
            { cur: 'NGN', flag: '🇳🇬', name: 'Naira Nigéria', balance: '4 200 000 ₦', rate: '0.42 XOF' },
            { cur: 'GHS', flag: '🇬🇭', name: 'Cedi Ghana', balance: '32 000 GH₵', rate: '41.15 XOF' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-blue-400 hover:bg-white transition-all shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="text-base">{item.flag}</span>
                <span className="font-mono font-bold text-slate-700">{item.cur}</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 font-display">{item.balance}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.rate}</p>
            </div>
          ))}
        </div>

        {/* Interactive Instant FX Swap */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
            <span className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
              ⇄
            </span>
            <div>
              <p className="font-bold text-sm text-slate-900">Rapatriement Automatique des Ventes (Auto-Sweep)</p>
              <p className="text-slate-500 text-xs">Convertit quotidiennement les fonds EUR/USD encaissés vers votre compte principal XOF à 17h00 GMT.</p>
            </div>
          </div>

          <button 
            onClick={() => showNotification("Rapatriement exécuté : 2 500 EUR convertis en 1 639 892 XOF avec succès !")}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
          >
            Exécuter un Swap de Trésorerie
          </button>
        </div>
      </div>
    </div>
  );
}
