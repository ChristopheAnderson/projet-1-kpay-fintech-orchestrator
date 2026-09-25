import { useState, useRef } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  FileCode2, 
  RotateCcw, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Transaction } from '../App';

interface DataBackupHubModalProps {
  transactions: Transaction[];
  initialTransactions: Transaction[];
  onUpdateTransactions: (updated: Transaction[]) => void;
  onClose: () => void;
}

export default function DataBackupHubModal({
  transactions,
  initialTransactions,
  onUpdateTransactions,
  onClose
}: DataBackupHubModalProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // 1. EXCEL EXPORT (.xlsx)
  const handleExportExcel = () => {
    try {
      const formatted = transactions.map(t => ({
        'ID': t.id,
        'Référence KPay': t.reference,
        'Réf Externe Telco': t.external_reference || 'N/A',
        'Clé Idempotence': t.idempotency_key,
        'Montant (XOF)': t.amount,
        'Frais (XOF)': t.fee,
        'Devise': t.currency,
        'Opérateur': t.operator,
        'Statut': t.status,
        'Téléphone Client': t.customer_phone,
        'Email Client': t.customer_email,
        'Latence Réseau (ms)': t.latency_ms,
        'Date Création': t.created_at
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions KPay');
      XLSX.writeFile(workbook, `KPay_Transactions_Database_${new Date().toISOString().slice(0, 10)}.xlsx`);
      notify(`Export Excel réussi : ${transactions.length} transactions enregistrées dans le fichier .xlsx !`);
    } catch (err) {
      console.error(err);
      notify('Erreur lors de la génération du fichier Excel.');
    }
  };

  // 2. EXCEL IMPORT (.xlsx)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        if (rawJson.length === 0) {
          notify('Le fichier Excel importé est vide.');
          return;
        }

        const mapped: Transaction[] = rawJson.map((row, idx) => ({
          id: Number(row['ID'] || idx + 1),
          reference: String(row['Référence KPay'] || row['reference'] || `KPAY_IMP_${Date.now()}_${idx}`),
          external_reference: row['Réf Externe Telco'] || row['external_reference'] || undefined,
          idempotency_key: String(row['Clé Idempotence'] || row['idempotency_key'] || `idemp_imp_${Date.now()}_${idx}`),
          amount: Number(row['Montant (XOF)'] || row['amount'] || 10000),
          fee: Number(row['Frais (XOF)'] || row['fee'] || 150),
          currency: String(row['Devise'] || row['currency'] || 'XOF'),
          operator: (row['Opérateur'] || row['operator'] || 'MTN_MOMO') as any,
          status: (row['Statut'] || row['status'] || 'SUCCESS') as any,
          customer_phone: String(row['Téléphone Client'] || row['customer_phone'] || '+229 97 00 00 00'),
          customer_email: String(row['Email Client'] || row['customer_email'] || 'import@kpay.bj'),
          latency_ms: Number(row['Latence Réseau (ms)'] || row['latency_ms'] || 250),
          created_at: String(row['Date Création'] || row['created_at'] || '2026-09-25 12:00')
        }));

        onUpdateTransactions(mapped);
        notify(`Base de données synchronisée : ${mapped.length} transactions importées depuis Excel avec succès !`);
      } catch (err) {
        console.error(err);
        notify('Format de fichier Excel non reconnu ou invalide.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // 3. JSON EXPORT
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kpay_database_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify(`Export JSON téléchargé avec succès (${transactions.length} enregistrements).`);
  };

  // 4. JSON IMPORT
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onUpdateTransactions(parsed);
          notify(`Base restaurée depuis le fichier JSON : ${parsed.length} transactions chargées.`);
        } else {
          notify('Structure JSON invalide (un tableau de transactions est attendu).');
        }
      } catch (err) {
        notify('Fichier JSON corrompu ou illisible.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 5. RESTORE INITIAL DATA
  const handleResetToInitial = () => {
    onUpdateTransactions([...initialTransactions]);
    notify(`Données réinitialisées au départ : ${initialTransactions.length} transactions d'origine restaurées.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Gestionnaire de Données : Excel & JSON
              </h3>
              <p className="text-xs text-slate-500">
                Synchronisation dynamique, import/export et sauvegarde réversible
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Current State Info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Enregistrements Actifs :</span>
            <span className="text-base font-extrabold text-slate-900 font-display">
              {transactions.length} Transactions
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            État : Dynamique & Connecté
          </span>
        </div>

        {/* Option 1: EXCEL (.xlsx) */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Option 1 : Base de Données Tableur Excel (.xlsx)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
              Recommandé
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Manipulez toutes vos données sous Microsoft Excel, modifiez les lignes et réimportez-les en un clic.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter en Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => excelInputRef.current?.click()}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 flex items-center justify-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Importer Fichier Excel</span>
            </button>
            <input 
              ref={excelInputRef} 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleImportExcel} 
              className="hidden" 
            />
          </div>
        </div>

        {/* Option 2: JSON (.json) */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-indigo-700" />
              Option 2 : Format Développeur JSON (.json)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
              API Standard
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sauvegardez l'état complet en JSON pour interopérabilité avec les API REST ou microservices.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger JSON</span>
            </button>

            <button
              onClick={() => jsonInputRef.current?.click()}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-300 flex items-center justify-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-700" />
              <span>Restaurer JSON</span>
            </button>
            <input 
              ref={jsonInputRef} 
              type="file" 
              accept=".json" 
              onChange={handleImportJson} 
              className="hidden" 
            />
          </div>
        </div>

        {/* Option 3: Reset to Factory Start */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleResetToInitial}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 transition border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Revenir aux Données de Départ</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
