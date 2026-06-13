import React, { useState, useTransition } from "react";
import { 
  Order, 
  InventoryItem 
} from "../types";
import { 
  Search, 
  Filter, 
  AlertOctagon, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Cpu, 
  User, 
  X,
  FileText,
  Activity,
  UserCheck,
  Zap,
  ArrowRight
} from "lucide-react";

interface OrdersTabProps {
  orders: Order[];
  inventory: InventoryItem[];
  onAddOrder: (order: Partial<Order> & { slaHours: number }) => Promise<void>;
  onUpdateOrder: (orderId: string, updates: { stage?: string; notes?: string; delayReason?: string; operatorName?: string; clearDelay?: boolean }) => Promise<void>;
  onGetAiRecommendation: (orderId: string) => Promise<string>;
}

export default function OrdersTab({ 
  orders, 
  inventory,
  onAddOrder, 
  onUpdateOrder, 
  onGetAiRecommendation 
}: OrdersTabProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [lensFilter, setLensFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // UI state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // New Order state
  const [newCustName, setNewCustName] = useState("");
  const [newLensType, setNewLensType] = useState("Single Vision");
  const [newSphere, setNewSphere] = useState("0.00");
  const [newCylinder, setNewCylinder] = useState("0.00");
  const [newLocation, setNewLocation] = useState("Main Lab");
  const [newSlaHours, setNewSlaHours] = useState(48);

  // Update Status Log form state
  const [updateStage, setUpdateStage] = useState("");
  const [updateOperator, setUpdateOperator] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateDelay, setUpdateDelay] = useState("");
  const [isLoggedDelay, setIsLoggedDelay] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Distinct Optical Stages list
  const productionStages = [
    "Order Received",
    "Lens Selection",
    "Lens Surfacing",
    "Polishing",
    "Coating",
    "Quality Check",
    "Fulfillment Ready",
    "Delivered"
  ];

  // Unique lists for dropdowns
  const lensTypes = ["Single Vision", "Bifocal", "Progressive"];
  const locations = ["Main Lab", "East Retail", "West Clinic"];

  // Filter implementation
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter ? o.currentStage === stageFilter : true;
    const matchesLens = lensFilter ? o.lensType === lensFilter : true;
    const matchesLoc = locationFilter ? o.location === locationFilter : true;
    return matchesSearch && matchesStage && matchesLens && matchesLoc;
  });

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setUpdateStage(order.currentStage);
    setUpdateNotes("");
    setUpdateOperator("");
    setUpdateDelay(order.delayReason || "");
    setIsLoggedDelay(!!order.delayReason);
    setAiAdvice(null);
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return alert("Please specify customer name");

    const payload = {
      customerName: newCustName,
      lensType: newLensType,
      powerSphere: parseFloat(newSphere),
      powerCylinder: parseFloat(newCylinder),
      location: newLocation,
      slaHours: Number(newSlaHours),
    };

    await onAddOrder(payload);
    setIsAddingOrder(false);
    setNewCustName("");
    setNewSphere("0.00");
    setNewCylinder("0.00");
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await onUpdateOrder(selectedOrder.id, {
      stage: updateStage,
      notes: updateNotes,
      delayReason: isLoggedDelay ? updateDelay : undefined,
      operatorName: updateOperator || undefined,
      clearDelay: !isLoggedDelay,
    });

    // Refresh selected panel with revised data
    const revised = orders.find((o) => o.id === selectedOrder.id);
    if (revised) {
      setSelectedOrder(revised);
    }
    setUpdateNotes("");
    setUpdateOperator("");
    setAiAdvice(null);
  };

  const triggerGeminiAiAdvisory = async () => {
    if (!selectedOrder) return;
    setAiLoading(true);
    setAiAdvice(null);
    try {
      const responseMarkdown = await onGetAiRecommendation(selectedOrder.id);
      setAiAdvice(responseMarkdown);
    } catch (e: any) {
      setAiAdvice(`### ❌ AI Recommendation Failed\n${e.message || "An issue occurred communicating with server-side Gemini gateway."}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 font-sans text-gray-900">
      
      {/* LEFT & CENTER SUBCOLUMN: Order List & Controls */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Filters and Creating Actions row */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xs font-bold font-mono tracking-wide text-gray-500 uppercase">SEARCH & PIPELINE CONTROLS</h3>
            <button
              onClick={() => setIsAddingOrder(true)}
              className="px-3.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs tracking-wide flex items-center gap-1.5 hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              PLACE NEW ORDER
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search Client or RX ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Stage Selector */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-xs"
              >
                <option value="">All Flow Stages</option>
                {productionStages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Lens Selector */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <select
                value={lensFilter}
                onChange={(e) => setLensFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-xs"
              >
                <option value="">All Lens Types</option>
                {lensTypes.map((lens) => (
                  <option key={lens} value={lens}>{lens}</option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-xs"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Place Order Modal (Absolute visual clarity overlay) */}
        {isAddingOrder && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-lg text-gray-950">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold font-mono text-gray-950 tracking-wide uppercase">OMS NEW EYEWEAR DISPATCH</h3>
                </div>
                <button 
                  onClick={() => setIsAddingOrder(false)}
                  className="text-gray-400 hover:text-gray-900 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Customer / Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name..."
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Optical Lens Type</label>
                    <select
                      value={newLensType}
                      onChange={(e) => setNewLensType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 shadow-xs"
                    >
                      {lensTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Fulfillment Location</label>
                    <select
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 shadow-xs"
                    >
                      {locations.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Sphere (SPH diopters)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="-8.00"
                      max="6.00"
                      value={newSphere}
                      onChange={(e) => setNewSphere(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 text-center focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Cylinder (CYL diopters)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="-4.00"
                      max="4.00"
                      value={newCylinder}
                      onChange={(e) => setNewCylinder(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 text-center focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">SLA Target Buffer (hrs)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={newSlaHours}
                      onChange={(e) => setNewSlaHours(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 text-center font-mono focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Simulated Real-Time Lens Stock Pre-check (Module 1 Requirement) */}
                <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">INTELLIGENT STOCK PRE-CHECK SERVICE</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Analyzing active physical slab repositories for: <strong className="text-gray-900">{newLensType} SPH {newSphere} SPH / {newCylinder} CYL</strong>. Placing order locks required materials instantly inside the ledger database.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingOrder(false)}
                    className="px-4 py-2 border border-gray-200 bg-white text-gray-500 hover:text-gray-900 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs shadow-sm hover:bg-blue-700 cursor-pointer"
                  >
                    Dispatch Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}        {/* Orders Table-style Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-gray-50/60 border-b border-gray-150 flex justify-between items-center">
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-700 uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Eyewear Job Queue ({filteredOrders.length} records found)
            </h3>
            <span className="text-[10px] font-mono text-gray-400">SORTED CHRONOLOGICALLY BY EARLIEST CREATED</span>
          </div>

          <div className="divide-y divide-gray-100 select-none">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-450 text-xs font-mono">
                No eyewear jobs matched the filters. Try adjusting query fields.
              </div>
            ) : (
              filteredOrders.map((o) => {
                const isActive = selectedOrder?.id === o.id;
                
                // SLA check
                const deadlineDate = new Date(o.slaDeadline);
                const isOverSla = new Date() > deadlineDate;

                return (
                  <div
                    key={o.id}
                    onClick={() => handleOrderSelect(o)}
                    className={`p-4 transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 ${
                      isActive ? "bg-blue-50/20 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    {/* Customer & ID info */}
                    <div className="space-y-1.5 md:max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {o.id}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900">{o.customerName}</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {o.location}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-gray-700">{o.lensType}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] bg-gray-50 border border-gray-200/80 px-1 rounded text-blue-600 leading-none py-0.5 font-semibold">
                          {o.powerSphere >= 0 ? "+" + o.powerSphere.toFixed(2) : o.powerSphere.toFixed(2)} S /{" "}
                          {o.powerCylinder >= 0 ? "+" + o.powerCylinder.toFixed(2) : o.powerCylinder.toFixed(2)} C
                        </span>
                      </div>
                    </div>

                    {/* Operational stage status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                        {o.currentStage}
                      </span>
                      {o.delayReason && (
                        <span className="p-1 rounded bg-amber-50 border border-amber-200 text-amber-600 animate-pulse" title={o.delayReason}>
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Stock level status */}
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        o.stockStatus === "In Stock" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                          : o.stockStatus === "Low Stock"
                          ? "bg-amber-50 text-amber-600 border border-amber-205"
                          : "bg-red-50 text-red-650 border border-red-200"
                      }`}>
                        {o.stockStatus}
                      </span>
                    </div>

                    {/* SLA predictive breach clock */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs font-mono font-semibold ${isOverSla ? "text-red-600" : "text-gray-750"}`}>
                          {isOverSla ? "SLA BREACHED" : new Date(o.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Live breach danger ML estimate */}
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] text-gray-500 font-mono">Breach risk:</span>
                        <span className={`text-xs font-bold font-mono ${
                          o.riskScore > 70 
                            ? "text-red-500" 
                            : o.riskScore > 30 
                            ? "text-amber-550" 
                            : "text-emerald-600"
                        }`}>
                          {o.riskScore}%
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Selective Job Audit Trail, Stage Transition form & AI recommendation */}
      <div className="space-y-6">
        
        {selectedOrder ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6 shadow-xs">
            
            {/* Audited elements */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-150">
              <div>
                <span className="text-[9px] font-semibold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded leading-none uppercase select-none">
                  Fulfillment Log
                </span>
                <h3 className="text-base font-bold text-gray-900 tracking-tight mt-1">{selectedOrder.customerName}</h3>
                <span className="text-xs font-mono text-gray-500">{selectedOrder.id} • Active in {selectedOrder.location}</span>
              </div>
              
              <div className="text-right">
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded ${
                  selectedOrder.riskLevel === "High" 
                    ? "bg-red-50 border border-red-100 text-red-650" 
                    : selectedOrder.riskLevel === "Medium"
                    ? "bg-amber-50 border border-amber-100 text-amber-600"
                    : "bg-emerald-50 border border-emerald-100/50 text-emerald-700"
                }`}>
                  {selectedOrder.riskScore}% RISK
                </span>
                <p className="text-[10px] text-gray-400 font-mono mt-1">RandomForest classification</p>
              </div>
            </div>

            {/* SLA Alert notification box for values >70% */}
            {selectedOrder.riskScore > 70 && (
              <div className="bg-red-50 border border-red-150 rounded-xl p-3 flex gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-700">Escalation Trigger Activated</h4>
                  <p className="text-[11px] text-gray-600 leading-normal mt-0.5">
                    Breach risk probability exceeds 70%. Outbound email and WhatsApp workflows log notification checks.
                  </p>
                </div>
              </div>
            )}

            {/* Chronological status history timeline */}
            <div>
              <h4 className="text-[11px] font-mono tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                CHRONOLOGICAL AUDIT TRAIL
              </h4>
              
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-gray-150">
                {selectedOrder.statusHistory.map((hist, index) => (
                  <div key={index} className="flex gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-gray-300 flex items-center justify-center shrink-0 z-10 text-[10px] font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-blue-600">{hist.stage}</span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-normal mb-1">{hist.notes}</p>
                      
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <UserCheck className="w-3 h-3 text-gray-450" />
                        <span>Operator: {hist.operatorName}</span>
                      </div>

                      {hist.delayReason && (
                        <div className="text-[10px] font-mono text-amber-650 bg-amber-50 border border-amber-150 rounded px-2 py-0.5 mt-1 inline-block">
                          Hold reason: {hist.delayReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Transition & Delay-logging module */}
            <div className="pt-4 border-t border-gray-150 space-y-3">
              <h4 className="text-[11px] font-mono tracking-wider text-gray-500 uppercase flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                TRANSITION FLOW & LOG DELAY
              </h4>

              <form onSubmit={handleStatusUpdateSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-450 uppercase mb-1">Set Stage</label>
                    <select
                      value={updateStage}
                      onChange={(e) => setUpdateStage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs focus:border-blue-500"
                    >
                      {productionStages.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">Operator Tech Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alice Chen"
                      value={updateOperator}
                      onChange={(e) => setUpdateOperator(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">Audit Notes / Comments</label>
                  <input
                    type="text"
                    placeholder="e.g. Surface ground thickness verified..."
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs focus:border-blue-500"
                  />
                </div>

                {/* Log Delay reason toggle (Module 2 Requirement) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDelayCheck"
                      checked={isLoggedDelay}
                      onChange={(e) => setIsLoggedDelay(e.target.checked)}
                      className="rounded bg-white border-gray-300 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <label htmlFor="isDelayCheck" className="text-[11px] text-gray-650 font-mono uppercase cursor-pointer select-none">
                      Active Manufacturing Hold / Delay reason (Spikes Risk Probability)
                    </label>
                  </div>

                  {isLoggedDelay && (
                    <select
                      value={updateDelay}
                      onChange={(e) => setUpdateDelay(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs focus:border-blue-500"
                    >
                      <option value="">-- Choose High Variance Hold Reason --</option>
                      <option value="Slab blank stock verification error">Slab blank stock verification error</option>
                      <option value="Machine calibration mismatch on cylinder curves">Machine calibration mismatch on cylinder curves</option>
                      <option value="High coating machine queue and humidity variance">High coating machine queue and humidity variance</option>
                      <option value="High Specialty RX prescription lens slab out of stock">High Specialty RX prescription lens slab out of stock</option>
                      <option value="Optical verification QC failure - rework needed">Optical verification QC failure - rework needed</option>
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition py-2 rounded-lg font-mono text-xs font-semibold cursor-pointer shadow-xs"
                >
                  COMMIT PIPELINE UPDATE
                </button>
              </form>
            </div>

            {/* AI Advisor Card powered by server-side Gemini API (MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API) */}
            <div className="pt-4 border-t border-gray-150 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-mono tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  AI RISK MITIGATION COACH
                </h4>
                <button
                  onClick={triggerGeminiAiAdvisory}
                  disabled={aiLoading}
                  className="text-[10px] font-semibold font-mono bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 tracking-wide disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Cpu className="w-3 h-3" />
                  {aiLoading ? "Generating..." : "ASK ELUNO AI"}
                </button>
              </div>

              {aiLoading && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2 animate-pulse">
                  <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  <p className="text-[10px] text-gray-400 font-mono text-center pt-1">
                    Gemini routing active logs & prescription recipes...
                  </p>
                </div>
              )}

              {aiAdvice && (
                <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 overflow-y-auto max-h-64 space-y-3.5 leading-relaxed text-xs text-gray-700 shadow-xs">
                  <div className="prose prose-slate max-w-none text-gray-700">
                    {aiAdvice.split("\n").map((line, lIdx) => {
                      if (line.startsWith("###")) {
                        return <h5 key={lIdx} className="text-xs font-bold text-blue-700 uppercase font-mono tracking-wide mt-2">{line.replace("###", "")}</h5>;
                      }
                      if (line.startsWith("* ")) {
                        return <p key={lIdx} className="pl-3 relative before:absolute before:left-0 before:text-blue-500 before:content-['•'] text-[11px] leading-relaxed text-gray-600 font-medium">{line.replace("*", "").trim()}</p>;
                      }
                      return <p key={lIdx} className="text-[11px] leading-relaxed text-gray-600">{line}</p>;
                    })}
                  </div>
                </div>
              )}

              {!aiAdvice && !aiLoading && (
                <p className="text-[10px] text-gray-400 italic leading-normal">
                  Request custom optical engineering plans and reassuring client messaging templates based on the current active order recipe.
                </p>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-xs font-mono py-16 space-y-3 shadow-xs">
            <HelpCircle className="w-8 h-8 mx-auto text-gray-300" />
            <p>Select any active order from the left pool to examine its audit trail, log delay constraints, or consult the Eluno Gemini Advisor.</p>
          </div>
        )}

      </div>

    </div>
  );
}
