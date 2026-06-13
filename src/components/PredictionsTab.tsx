import React, { useState } from "react";
import { MLMetric } from "../types";
import { 
  TrendingUp, 
  Cpu, 
  Sliders, 
  Activity, 
  HelpCircle, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  Target,
  Gauge
} from "lucide-react";

interface PredictionsTabProps {
  mlMetrics: MLMetric | null;
  onRetrainModel: () => Promise<MLMetric>;
  isTraining: boolean;
}

export default function PredictionsTab({ mlMetrics, onRetrainModel, isTraining }: PredictionsTabProps) {
  // Simulator form state
  const [lclLensType, setLclLensType] = useState("Progressive");
  const [lclSphere, setLclSphere] = useState("-2.50");
  const [lclCylinder, setLclCylinder] = useState("-1.00");
  const [lclStage, setLclStage] = useState("Coating");
  const [lclElapsed, setLclElapsed] = useState("24");
  const [lclStock, setLclStock] = useState("In Stock");
  const [lclHasDelay, setLclHasDelay] = useState(true);

  // Simulation outputs
  const [simRisk, setSimRisk] = useState<number | null>(null);
  const [simReasons, setSimReasons] = useState<string[]>([]);
  const [simLoading, setSimLoading] = useState(false);

  // Retraining state
  const [metrics, setMetrics] = useState<MLMetric | null>(mlMetrics);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimRisk(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lensType: lclLensType,
          powerSphere: parseFloat(lclSphere),
          powerCylinder: parseFloat(lclCylinder),
          currentStage: lclStage,
          elapsedHours: parseFloat(lclElapsed),
          stockStatus: lclStock,
          hasActiveDelay: lclHasDelay,
        }),
      });
      const data = await response.json();
      setSimRisk(data.riskScore);
      setSimReasons(data.reasons || []);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleRetrainClick = async () => {
    setRetrainSuccess(false);
    try {
      const updated = await onRetrainModel();
      setMetrics(updated);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to retrain:", e);
    }
  };

  const currentMetrics = metrics || mlMetrics;

  const sampleConfusionMatrix = {
    tp: 112, // True positive
    fp: 7,   // False positive
    fn: 9,   // False negative
    tn: 432  // True negative
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 font-sans text-gray-900">
      
      {/* COLUMN 1: LIVE FORECAST INFERENCE SANDBOX */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-150">
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-900 uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              RF INFERENCE SIMULATOR
            </h3>
            <span className="text-[10px] bg-gray-50 border border-gray-200 font-mono text-gray-500 px-2 py-0.5 rounded leading-none">
              Standalone Feature Test
            </span>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-3.5 mt-3 text-gray-700">
            <div>
              <label className="block text-[10px] font-mono text-gray-450 uppercase mb-1">Selected Lens Type</label>
              <select
                value={lclLensType}
                onChange={(e) => setLclLensType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Single Vision">Single Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-gray-450 uppercase mb-1">RX Sphere (SPH)</label>
                <select
                  value={lclSphere}
                  onChange={(e) => setLclSphere(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs"
                >
                  <option value="0.00">0.00 SPH (Neutral)</option>
                  <option value="-2.50">-2.50 SPH (Myopia)</option>
                  <option value="-5.50">-5.50 SPH (High Myopia)</option>
                  <option value="2.50">+2.50 SPH (Hyperopia)</option>
                  <option value="5.50">+5.50 SPH (High Hyperopia)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">RX Cylinder (CYL)</label>
                <select
                  value={lclCylinder}
                  onChange={(e) => setLclCylinder(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs"
                >
                  <option value="0.00">0.00 CYL</option>
                  <option value="-1.00">-1.00 CYL (Astigmatism)</option>
                  <option value="-2.50">-2.50 CYL (High Astigmatism)</option>
                  <option value="1.50">+1.50 CYL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">Active Stage</label>
                <select
                  value={lclStage}
                  onChange={(e) => setLclStage(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs"
                >
                  <option value="Order Received">Order Received</option>
                  <option value="Lens Selection">Lens Selection</option>
                  <option value="Lens Surfacing">Lens Surfacing</option>
                  <option value="Polishing">Polishing</option>
                  <option value="Coating">Coating</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Fulfillment Ready">Fulfillment Ready</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">Current Age (hours)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={lclElapsed}
                  onChange={(e) => setLclElapsed(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 text-center font-mono font-bold shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-gray-455 uppercase mb-1">Lens Stock Status</label>
                <select
                  value={lclStock}
                  onChange={(e) => setLclStock(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 shadow-xs"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex flex-col justify-end pb-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="delaySimCheck"
                    checked={lclHasDelay}
                    onChange={(e) => setLclHasDelay(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="delaySimCheck" className="text-[10px] font-mono text-gray-500 uppercase mb-px select-none cursor-pointer">
                    Active Delay hold
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={simLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wider font-mono flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mt-2"
            >
              <Cpu className="w-4 h-4" />
              {simLoading ? "CALCULATING INFERENCE..." : "PREDICT SLA BREACH RISK"}
            </button>
          </form>
        </div>

        {/* Prediction Results Block */}
        <div className="mt-4 pt-4 border-t border-gray-150">
          {simRisk !== null ? (
            <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 space-y-3.5 animate-fade-in text-gray-950">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-450 uppercase">Live Model Yield</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  simRisk > 70 
                    ? "bg-red-50 text-red-650 border border-red-150" 
                    : simRisk > 30 
                    ? "bg-amber-50 text-amber-600 border border-amber-150" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-150"
                }`}>
                  {simRisk > 70 ? "HIGH RISK" : simRisk > 30 ? "MEDIUM RISK" : "SLA ASSURED"}
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-2">
                <h2 className={`text-4xl font-extrabold font-mono tracking-tight ${
                  simRisk > 70 ? "text-red-650" : simRisk > 30 ? "text-amber-600" : "text-blue-600"
                }`}>
                  {simRisk}%
                </h2>
                <span className="text-xs text-gray-500 font-mono">Breach Probability</span>
              </div>

              {/* Contributing reasons list */}
              <div className="space-y-1.5 pt-2 border-t border-gray-150">
                <span className="text-[9px] font-mono text-gray-450 uppercase block">Model Feature importances mapped:</span>
                {simReasons.map((reason, idx) => (
                  <div key={idx} className="flex gap-1 items-start text-[10.5px] leading-relaxed text-gray-600">
                    <ChevronRight className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center text-[11px] text-gray-400 italic py-10 font-mono shadow-inner">
              Adjust manufacturing features and click forecast to invoke RandomForest classification probability.
            </div>
          )}
        </div>

      </div>

      {/* COLUMN 2: CLASSIFIER METRICS & CONFUSION MATRIX */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6 shadow-xs">
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-150">
          <h3 className="text-xs font-bold font-mono tracking-wider text-gray-900 uppercase flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            CLASSIFIER VALIDATION STATS
          </h3>
          <span className="text-[10px] bg-blue-50 font-mono text-blue-600 border border-blue-100 px-2 py-0.5 rounded leading-none">
            Test Pool: 20% Holdout
          </span>
        </div>

        {currentMetrics && (
          <div className="space-y-6">
            
            {/* Accuracy gauges list */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-center space-y-1 shadow-xs">
                <span className="text-[9px] font-sans font-semibold text-gray-500 uppercase">Model Accuracy</span>
                <h3 className="text-xl font-bold font-mono text-gray-900 leading-tight">{currentMetrics.accuracy}%</h3>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${currentMetrics.accuracy}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-center space-y-1 shadow-xs">
                <span className="text-[9px] font-sans font-semibold text-gray-500 uppercase">F1-Score Harmonic</span>
                <h3 className="text-xl font-bold font-mono text-gray-900 leading-tight">{currentMetrics.f1Score}%</h3>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${currentMetrics.f1Score}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-center space-y-1 shadow-xs">
                <span className="text-[9px] font-sans font-semibold text-gray-500 uppercase">Precision Ratio</span>
                <h3 className="text-xl font-bold font-mono text-gray-900 leading-tight">{currentMetrics.precision}%</h3>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${currentMetrics.precision}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-center space-y-1 shadow-xs">
                <span className="text-[9px] font-sans font-semibold text-gray-500 uppercase">Sensitivity / Recall</span>
                <h3 className="text-xl font-bold font-mono text-gray-900 leading-tight">{currentMetrics.recall}%</h3>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${currentMetrics.recall}%` }}></div>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Heatmap Representation */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-mono text-gray-450 uppercase block">Model Confusion Matrix Map</span>
              
              <div className="border border-gray-200 bg-gray-50 p-3.5 rounded-xl space-y-3 font-mono shadow-inner">
                <div className="grid grid-cols-3 text-center text-[10px] text-gray-500 pb-1 border-b border-gray-200 font-bold">
                  <div>Actual / Pred</div>
                  <div className="text-blue-600">Pred: BREACH</div>
                  <div className="text-gray-500">Pred: ON-TIME</div>
                </div>

                <div className="grid grid-cols-3 items-center text-center text-xs">
                  <div className="text-[10px] text-blue-600 font-bold">Actual: BREACH</div>
                  <div className="bg-emerald-50 border border-emerald-150 text-emerald-700 py-2 rounded font-bold" title="True Positives">
                    {sampleConfusionMatrix.tp} <span className="text-[8px] text-gray-400 block font-normal">True Pos</span>
                  </div>
                  <div className="bg-red-50 border border-red-150 text-red-650 py-2 rounded font-bold" title="False Negatives">
                    {sampleConfusionMatrix.fn} <span className="text-[8px] text-gray-400 block font-normal">False Neg</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center text-center text-xs pb-1">
                  <div className="text-[10px] text-gray-500 font-bold">Actual: ON-TIME</div>
                  <div className="bg-amber-50 border border-amber-150 text-amber-600 py-2 rounded font-bold" title="False Positives">
                    {sampleConfusionMatrix.fp} <span className="text-[8px] text-gray-400 block font-normal">False Pos</span>
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-600 py-2 rounded font-bold" title="True Negatives">
                    {sampleConfusionMatrix.tn} <span className="text-[8px] text-gray-400 block font-normal">True Neg</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* COLUMN 3: FEATURE IMPORTANCES & MACHINE RETRAINING */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6 shadow-xs flex flex-col justify-between">
        
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-gray-150">
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-900 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              FEATURE IMPORTANCES
            </h3>
            <span className="text-[10px] bg-gray-50 border border-gray-150 font-mono text-gray-500 px-2 py-0.5 rounded leading-none">
              GINI Impurity Scale
            </span>
          </div>

          {currentMetrics && (
            <div className="space-y-4">
              {currentMetrics.featureImportances.map((feature, idx) => {
                // Different color accents per priority feature
                const cols = ["bg-blue-600", "bg-purple-600", "bg-amber-500", "bg-emerald-600", "bg-indigo-600"];
                const color = cols[idx % cols.length];

                return (
                  <div key={idx} className="space-y-1.5 font-sans">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-750 font-semibold">{feature.feature}</span>
                      <span className="font-mono text-blue-600 font-semibold">{feature.importance}%</span>
                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/50">
                      <div 
                        className={`${color} h-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${feature.importance}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Retraining action card block */}
        <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 text-center space-y-3.5 mt-4 shadow-sm">
          <h4 className="text-xs font-bold font-mono text-gray-900 flex items-center gap-1.5 justify-center">
            <Gauge className="w-4 h-4 text-blue-600" />
            Active RandomForest (.pkl)
          </h4>
          <p className="text-[10.5px] text-gray-600 leading-normal font-sans">
            Every status update and log holds adjust parameters. Retrain the Scikit-learn estimator classifier to adjust node splits and weights.
          </p>

          <button
            onClick={handleRetrainClick}
            disabled={isTraining}
            className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 disabled:opacity-50 text-xs font-bold tracking-wide font-mono rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? "animate-spin text-blue-600" : ""}`} />
            {isTraining ? "REBUILDING LEAF SPLITS..." : "RETRAIN ML MODEL"}
          </button>

          {retrainSuccess && (
            <div className="text-[11px] text-emerald-700 font-semibold font-mono flex items-center gap-1 justify-center animate-bounce mt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              RF Classifier model calibrated. .pkl updated!
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
