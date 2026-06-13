import { 
  ClipboardList, 
  Package, 
  TrendingUp, 
  Bell, 
  Layers,
  Sparkles,
  RefreshCw,
  Trash2
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRetrain: () => void;
  isTraining: boolean;
  onClearSampleData: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onRetrain, isTraining, onClearSampleData }: SidebarProps) {
  const menuItems = [
    { id: "orders", label: "Order Lifecycle", icon: ClipboardList },
    { id: "inventory", label: "Lens Inventory", icon: Package },
    { id: "predictions", label: "ML TAT Predictions", icon: TrendingUp },
    { id: "alerts", label: "Alert Log", icon: Bell },
  ];

  return (
    <aside className="w-68 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 text-gray-950 font-sans">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900 leading-none">ELUNO <span className="text-blue-600 font-bold">AI</span></h1>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Fulfillment OMS</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gray-100 text-blue-600 border-l-2 border-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {item.label}
              </button>
            );
          })}

          {/* Database Reset Button placed directly below Alert Log */}
          <div className="pt-2 px-1">
            <button
              onClick={onClearSampleData}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono text-red-650 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-transparent hover:border-red-100 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              Clear Sample Data
            </button>
          </div>
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50/50">
        <div className="rounded-xl bg-white p-4 border border-gray-200 mb-4 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">RandomForest Model</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-mono">
                Status: serialized & active (.pkl)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRetrain}
          disabled={isTraining}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-xs font-semibold py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${isTraining ? "animate-spin" : ""}`} />
          {isTraining ? "Retraining Model..." : "Retrain RF Model"}
        </button>
      </div>
    </aside>
  );
}
