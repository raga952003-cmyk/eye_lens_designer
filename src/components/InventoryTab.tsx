import React, { useState } from "react";
import { InventoryItem } from "../types";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  Plus, 
  Database, 
  Trash2, 
  Sliders, 
  Filter,
  CheckCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  X
} from "lucide-react";

interface InventoryTabProps {
  inventory: InventoryItem[];
  onUpdateInventory: (itemPayload: Partial<InventoryItem>) => Promise<void>;
  loading: boolean;
}

export default function InventoryTab({ inventory, onUpdateInventory, loading }: InventoryTabProps) {
  // Search state
  const [lensSearch, setLensSearch] = useState("");
  const [sphSearch, setSphSearch] = useState("");
  const [cylSearch, setCylSearch] = useState("");
  const [lensTypeFilter, setLensTypeFilter] = useState("");

  // Restock form state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState("");
  
  // Create New Specification form state
  const [newLensType, setNewLensType] = useState("Single Vision");
  const [newSph, setNewSph] = useState("0.00");
  const [newCyl, setNewCyl] = useState("0.00");
  const [newQty, setNewQty] = useState("10");
  const [newMinThreshold, setNewMinThreshold] = useState("4");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Filter lists
  const filtered = inventory.filter((item) => {
    const matchesLens = lensTypeFilter ? item.lensType === lensTypeFilter : true;
    
    // Support matching string or numeric SPH
    let matchesSph = true;
    if (sphSearch.trim()) {
      matchesSph = item.powerSphere.toFixed(2).includes(sphSearch) || String(item.powerSphere).includes(sphSearch);
    }

    // Support matching string or numeric CYL
    let matchesCyl = true;
    if (cylSearch.trim()) {
      matchesCyl = item.powerCylinder.toFixed(2).includes(cylSearch) || String(item.powerCylinder).includes(cylSearch);
    }

    return matchesLens && matchesSph && matchesCyl;
  });

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!restockQty || Number(restockQty) < 0) return alert("Please specify valid quantity");

    await onUpdateInventory({
      id: selectedItem.id,
      quantity: Number(restockQty),
    });

    setSelectedItem(null);
    setRestockQty("");
  };

  const handleCreateNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateInventory({
      lensType: newLensType,
      powerSphere: Number(newSph),
      powerCylinder: Number(newCyl),
      quantity: Number(newQty),
      minThreshold: Number(newMinThreshold),
    });

    setIsCreatingNew(false);
    setNewQty("10");
  };

  const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold && i.quantity > 0);
  const outOfStockItems = inventory.filter(i => i.quantity === 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 font-sans text-gray-900">
      
      {/* FILTER & ADDS SIDEBAR COLUMN */}
      <div className="space-y-6">
        
        {/* Quick Inventory Stock State Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            MATERIAL REPOSITORY INDEX
          </h3>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono text-gray-500">
              <span>Total RX Specifications:</span>
              <strong className="text-gray-900">{inventory.length}</strong>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-amber-600">Low Stock Indicators:</span>
              <strong className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                {lowStockItems.length}
              </strong>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-red-650">Out of Stock Warnings:</span>
              <strong className="text-red-650 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px]">
                {outOfStockItems.length}
              </strong>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            FILTERS & SEARCH
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Optical Type</label>
              <select
                value={lensTypeFilter}
                onChange={(e) => setLensTypeFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs text-gray-800 shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Single Vision">Single Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">SPH Power</label>
                <input
                  type="text"
                  placeholder="e.g. -2.00"
                  value={sphSearch}
                  onChange={(e) => setSphSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs text-gray-800 text-center font-mono shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">CYL Power</label>
                <input
                  type="text"
                  placeholder="e.g. -1.50"
                  value={cylSearch}
                  onChange={(e) => setCylSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs text-gray-800 text-center font-mono shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setSphSearch("");
                setCylSearch("");
                setLensTypeFilter("");
              }}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-550 py-1.5 rounded-lg text-[10px] font-mono transition cursor-pointer shadow-xs"
            >
              CLEAR GRIDS SEARCH
            </button>
          </div>
        </div>

        {/* Place New RX Specification tab toggle button */}
        {!isCreatingNew ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider font-mono rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            ADD NEW SPECIFICATION
          </button>
        ) : (
          <form onSubmit={handleCreateNewSubmit} className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold font-mono tracking-wider text-blue-600 uppercase flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              NEW RX SPEC CARD
            </h3>

            <div>
              <label className="block text-[10px] font-mono text-gray-450 uppercase mb-0.5">Lens Category</label>
              <select
                value={newLensType}
                onChange={(e) => setNewLensType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-800 shadow-xs"
              >
                <option value="Single Vision">Single Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-mono text-gray-450 uppercase mb-0.5">Sphere</label>
                <input
                  type="number"
                  step="0.25"
                  value={newSph}
                  onChange={(e) => setNewSph(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-900 text-center font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-0.5">Cylinder</label>
                <input
                  type="number"
                  step="0.25"
                  value={newCyl}
                  onChange={(e) => setNewCyl(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-900 text-center font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-0.5">Quantity</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-900 text-center font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-0.5">Min Safe Limit</label>
                <input
                  type="number"
                  value={newMinThreshold}
                  onChange={(e) => setNewMinThreshold(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-900 text-center font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="flex gap-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="w-1/2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 rounded py-1.5 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded py-1.5 text-xs font-bold font-mono cursor-pointer"
              >
                Insert specifications
              </button>
            </div>
          </form>
        )}

      </div>

      {/* INVENTORY PRIMARY FEED GRID & RESTOCK FORM IN SUBGRID */}
      <div className="lg:col-span-3 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LENS SPECIFICATIONS LIST CONTAINER */}
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[65vh]">
            <div className="p-4 bg-gray-50/60 border-b border-gray-150 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono tracking-wider text-gray-700 uppercase flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                STOCK REPOSITORY LEDGERS ({filtered.length} RX entries)
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 select-none">
              {filtered.map((item) => {
                const isOos = item.quantity === 0;
                const isLow = item.quantity <= item.minThreshold && item.quantity > 0;
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setRestockQty(String(item.quantity));
                    }}
                    className={`p-3.5 transition duration-150 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 ${
                      isSelected ? "bg-blue-50/20 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-505 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900">{item.lensType}</h4>
                      </div>

                      <div className="flex gap-2 text-[11px] text-gray-500 font-mono">
                        <span>Sphere: <strong className="text-gray-800">{item.powerSphere >= 0 ? "+" + item.powerSphere.toFixed(2) : item.powerSphere.toFixed(2)}</strong></span>
                        <span>•</span>
                        <span>Cylinder: <strong className="text-gray-800">{item.powerCylinder >= 0 ? "+" + item.powerCylinder.toFixed(2) : item.powerCylinder.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOos ? (
                        <span className="text-[9px] font-mono font-medium text-red-650 bg-red-50 border border-red-150 px-2 py-0.5 rounded uppercase animate-pulse">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] font-mono font-medium text-amber-600 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded uppercase animate-pulse">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                          IN STOCK
                        </span>
                      )}

                      <div className="text-right w-16 font-mono">
                        <span className={`text-sm font-bold ${isOos ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"}`}>
                          {item.quantity} units
                        </span>
                        <p className="text-[9px] text-gray-400">Min limit: {item.minThreshold}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE RESTOCK FORM FRAME CARD */}
          <div className="space-y-6">
            
            {selectedItem ? (
              <form onSubmit={handleRestockSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in text-gray-950">
                <div className="flex justify-between items-start pb-2 border-b border-gray-150">
                  <div>
                    <span className="text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">
                      Ledger Restock Adjust
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1.5">{selectedItem.lensType}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {selectedItem.id}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedItem(null)} 
                    className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-blue-50/20 p-3 rounded-lg border border-blue-50 space-y-1.5">
                  <span className="text-[9px] font-mono text-blue-700 font-semibold uppercase block">Optical Curve Index Specs</span>
                  <div className="grid grid-cols-2 text-xs font-mono text-gray-700">
                    <div>SPHERICAL: <strong className="text-blue-650">{selectedItem.powerSphere >= 0 ? "+" + selectedItem.powerSphere.toFixed(2) : selectedItem.powerSphere.toFixed(2)}</strong></div>
                    <div>CYLINDER: <strong className="text-blue-650">{selectedItem.powerCylinder >= 0 ? "+" + selectedItem.powerCylinder.toFixed(2) : selectedItem.powerCylinder.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Set Inventory Quantity Onoptical Ledger</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 text-center font-bold font-mono shadow-xs"
                    />
                  </div>
                </div>

                {/* Micro info on alert impacts */}
                <p className="text-[10px] text-gray-400 leading-normal">
                  Modifying ledger quantities will automatically trigger predictions reviews on matching active jobs, reducing low-stock hazard levels.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold tracking-wide rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  SET DYNAMIC LEDGER LEVEL
                </button>
              </form>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center text-gray-400 text-xs font-mono py-16 space-y-3 shadow-xs">
                <Sliders className="w-8 h-8 text-gray-300 mx-auto" />
                <p>Select any specification item from the inventory list on the left to quickly adjust ledger levels, restock, or adjust thresholds.</p>
              </div>
            )}

            {/* Quick stock help instructions */}
            <div className="bg-blue-50/10 border border-blue-50/80 rounded-2xl p-4.5 space-y-2.5">
              <h4 className="text-[10px] font-bold font-mono tracking-wider text-blue-700 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                Ledger Automation Service
              </h4>
              <p className="text-[11px] text-gray-650 leading-relaxed font-normal">
                When a custom eyewear order is submitted via the **Order Lifecycle** room, our backend does an automated stock checkout. If stock levels drop below the threshold configured above, dynamic flags alter model forecasting.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
