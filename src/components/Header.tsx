import { 
  Loader2, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Sliders
} from "lucide-react";

interface HeaderMetrics {
  totalActive: number;
  breached: number;
  highRisk: number;
  mediumRisk: number;
  averageTatHours: number;
  locationsDistribution: Record<string, number>;
  lensDistribution: Record<string, number>;
}

interface HeaderProps {
  metrics: HeaderMetrics | null;
  loading: boolean;
}

export default function Header({ metrics, loading }: HeaderProps) {
  if (loading || !metrics) {
    return (
      <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center text-gray-900 font-sans">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">Eluno Fulfillment Room</h2>
          <p className="text-xs text-gray-500 font-mono tracking-wide">AGGREGATING LIVE COAT-TO-QC STAGES</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          Synchronizing indices...
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 p-6 space-y-6 text-gray-950 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">Eluno Real-Time Lab Dashboard</h2>
          <p className="text-xs text-gray-500 font-mono tracking-wider uppercase mt-1">
            Eyewear Fulfillment Command & SLA Breach Predictive Center
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE LAB ENGINE
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Active Orders</span>
            <h3 className="text-2xl font-bold font-mono text-gray-900 mt-1">{metrics.totalActive}</h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">In fabrication pipeline</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`bg-white p-4 rounded-xl border flex items-center justify-between shadow-xs transition-colors duration-300 ${
          metrics.highRisk > 0 
            ? "border-amber-200 bg-amber-50/15" 
            : "border-gray-200"
        }`}>
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Critical SLA Threats</span>
            <h3 className={`text-2xl font-bold font-mono mt-1 ${metrics.highRisk > 0 ? "text-amber-600" : "text-gray-900"}`}>{metrics.highRisk}</h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">Breach probability &gt; 70%</p>
          </div>
          <div className={`p-2.5 rounded-lg border ${
            metrics.highRisk > 0 
              ? "bg-amber-100 border-amber-200 text-amber-600" 
              : "bg-gray-50 border-gray-200 text-gray-400"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`bg-white p-4 rounded-xl border flex items-center justify-between shadow-xs transition-colors duration-300 ${
          metrics.breached > 0 
            ? "border-red-200 bg-red-50/15" 
            : "border-gray-200"
        }`}>
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Existing Breaches</span>
            <h3 className={`text-2xl font-bold font-mono mt-1 ${metrics.breached > 0 ? "text-red-650 font-bold" : "text-gray-900"}`}>{metrics.breached}</h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">Production time &gt; 48 hours</p>
          </div>
          <div className={`p-2.5 rounded-lg border ${
            metrics.breached > 0 
              ? "bg-red-100 border-red-200 text-red-600" 
              : "bg-gray-50 border-gray-200 text-gray-400"
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Average TAT</span>
            <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">{metrics.averageTatHours}h</h3>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">Target limit: 42.0h</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
