import { AlertLog } from "../types";
import { 
  Bell, 
  Send, 
  Mail, 
  Smartphone, 
  GitBranch, 
  Activity, 
  ArrowRight, 
  Play, 
  Cpu, 
  CheckCircle,
  Clock
} from "lucide-react";

interface AlertsTabProps {
  alerts: AlertLog[];
}

export default function AlertsTab({ alerts }: AlertsTabProps) {
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 font-sans text-gray-900">
      
      {/* COLUMN 1 & 2: RECENT OUTBOUND NOTIFICATIONS AUDIT LOGS */}
      <div className="xl:col-span-2 space-y-4">
        
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[70vh]">
          <div className="p-4 bg-gray-50/60 border-b border-gray-150 flex justify-between items-center">
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-700 uppercase flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              OUTBOUND SLA NOTIFICATIONS LOGS ({alerts.length} dispatches recorded)
            </h3>
            <span className="text-[10px] font-mono text-gray-400 mt-0.5">Live Webhook Audits</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 select-none">
            {alerts.length === 0 ? (
              <div className="p-12 text-center text-gray-450 text-xs font-mono">
                No outbound SLA alerts triggered yet. Adjust order delay reasons to trigger escalation thresholds.
              </div>
            ) : (
              alerts.map((alt) => {
                const isWa = alt.channel === "WhatsApp";
                
                return (
                  <div key={alt.id} className="p-4 transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-gray-50/30">
                    
                    <div className="space-y-1.5 md:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-55 border border-gray-250 px-1.5 py-0.5 rounded leading-none">
                          {alt.id}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Order ID: <strong className="text-gray-700">{alt.orderId}</strong></span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-800 font-bold">{alt.customerName}</span>
                      </div>
                      
                      <p className="text-[11.5px] leading-relaxed text-gray-600 font-medium">{alt.message}</p>
                      
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono pt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Dispatched trigger: {new Date(alt.sentAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end gap-2 shrink-0 justify-between md:justify-start">
                      
                      {/* Outbound Channel badge */}
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                        isWa 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {isWa ? <Smartphone className="w-2.5 h-2.5" /> : <Mail className="w-2.5 h-2.5" />}
                        {alt.channel.toUpperCase()}
                      </span>

                      {/* Flagged probability */}
                      <div className="text-right mt-1">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">Model Flag</span>
                        <span className="text-xs font-bold font-mono text-red-600">
                          {alt.riskScore}% Probability
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

      {/* COLUMN 3: AUTOMATED WORKFLOW DIAGRAM SCHEMATIC (N8N INTEGRATION) */}
      <div className="space-y-6">
        
        {/* n8n self-hosted orchestrator schematic diagram */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="pb-3 border-b border-gray-150">
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-900 uppercase flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-blue-600" />
              N8N WORKFLOW SCHEMATIC
            </h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Self-Hosted Orchestrator (Workflows Engine)</p>
          </div>

          <p className="text-xs text-gray-650 leading-relaxed font-normal">
            The Eluno OMS integrates directly with a self-hosted **n8n** automation engine via webhook listeners. When our RandomForest Classifier predicts a breach probability exceeding 70%, the following operational pipeline fires on active channels:
          </p>

          <div className="space-y-4 pt-1">
            
            {/* Step 1 in block diagram */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex gap-3 items-center shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 font-mono">
                WEB
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">OMS Transition Webhook Node</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Triggers: PUT /orders/update</p>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <ArrowRight className="w-5 h-5 text-gray-350 rotate-90" />
            </div>

            {/* Step 2 in block diagram */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex gap-3 items-center shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-mono text-xs font-bold shrink-0">
                AI S
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">RandomForest Inference check</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Calls POST /api/predict</p>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <ArrowRight className="w-5 h-5 text-gray-350 rotate-90" />
            </div>

            {/* Step 3 in block diagram with conditional splitting */}
            <div className="bg-red-50/20 p-3.5 rounded-xl border border-red-150 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-650 font-bold shrink-0 mt-0.5">
                ?
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Conditional Switch (If Prob &gt; 70%)</h4>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
                  <span className="text-red-600 font-bold text-[10px]">TRUE:</span> Branch outwards
                  <span>|</span>
                  <span className="text-gray-400 font-bold">FALSE:</span> Halt
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center py-1">
              <div className="text-center w-1/2">
                <div className="flex justify-center -mb-1">
                  <ArrowRight className="w-4 h-4 text-gray-300 rotate-45" />
                </div>
                <div className="bg-emerald-50 p-2 border border-emerald-150 rounded-lg text-[10px] font-mono text-emerald-700 font-bold shadow-xs select-none">
                  WhatsApp (Twilio)
                </div>
              </div>

              <div className="text-center w-1/2">
                <div className="flex justify-center -mb-1">
                  <ArrowRight className="w-4 h-4 text-gray-300 -rotate-45" />
                </div>
                <div className="bg-blue-50 p-2 border border-blue-100 rounded-lg text-[10px] font-mono text-blue-600 font-bold shadow-xs select-none">
                  Email API Node
                </div>
              </div>
            </div>

          </div>

          {/* Success automation notes */}
          <div className="pt-2 border-t border-gray-150">
            <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-50 flex gap-2 items-center">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[10px] text-gray-600 leading-normal">
                All production alerts synchronized in the backend in real-time. Active WhatsApp status lines ready.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
