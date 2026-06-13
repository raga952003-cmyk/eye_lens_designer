import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OrdersTab from "./components/OrdersTab";
import InventoryTab from "./components/InventoryTab";
import PredictionsTab from "./components/PredictionsTab";
import AlertsTab from "./components/AlertsTab";
import { Order, InventoryItem, AlertLog, MLMetric } from "./types";

interface DashboardMetrics {
  totalActive: number;
  breached: number;
  highRisk: number;
  mediumRisk: number;
  averageTatHours: number;
  locationsDistribution: Record<string, number>;
  lensDistribution: Record<string, number>;
  mlClassifierState: MLMetric;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  // Sync data function
  const synchronizeDatabase = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const [orderRes, invRes, alertRes, metricRes] = await Promise.all([
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/alerts`),
        fetch(`${API_BASE}/dashboard/metrics`),
      ]);

      const [orderData, invData, alertData, metricData] = await Promise.all([
        orderRes.json(),
        invRes.json(),
        alertRes.json(),
        metricRes.json(),
      ]);

      setOrders(orderData);
      setInventory(invData);
      setAlerts(alertData);
      setMetrics(metricData);
    } catch (err) {
      console.error("Fulfillment database synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    synchronizeDatabase();
  }, []);

  const handleAddOrder = async (orderPayload: any) => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        await synchronizeDatabase();
      } else {
        const err = await res.json();
        alert("Verification check failure: " + (err.error || err.detail || "order rejected"));
      }
    } catch (e) {
      console.error("Order placing failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/orders/${orderId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await synchronizeDatabase();
      }
    } catch (e) {
      console.error("Status update failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (itemPayload: any) => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload),
      });
      if (res.ok) {
        await synchronizeDatabase();
      }
    } catch (e) {
      console.error("Inventory upload failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrainModel = async (): Promise<MLMetric> => {
    setIsTraining(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/model/retrain`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples: 100 })
      });
      const data = await res.json();
      await synchronizeDatabase();
      return data.metrics;
    } catch (e) {
      console.error("Machine learning calibration failure:", e);
      throw e;
    } finally {
      setIsTraining(false);
    }
  };

  const handleGetAiRecommendation = async (orderId: string): Promise<string> => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await res.json();
    if (res.ok) {
      return data.recommendation;
    } else {
      throw new Error(data.error || data.detail || "Recommendation request failed");
    }
  };

  const sidebarRetrainTrigger = async () => {
    try {
      await handleRetrainModel();
      alert("Random Forest model has successfully completed calibration against logged status histories!");
    } catch (e) {
      alert("Calibration failure.");
    }
  };

  const handleClearSampleData = async () => {
    const confirmClear = window.confirm("Are you sure you want to delete all orders, status history, and alert logs? This will reset the dashboard.");
    if (!confirmClear) return;
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE}/orders/clear`, {
        method: "POST",
      });
      if (res.ok) {
        await synchronizeDatabase();
        alert("Sample orders, history, and alerts successfully deleted!");
      } else {
        const err = await res.json();
        alert("Failed to reset database: " + (err.detail || "unknown error"));
      }
    } catch (e) {
      console.error("Database reset failure:", e);
      alert("Network error: Failed to contact backend to reset database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-900 font-sans selection:bg-blue-500/20 selection:text-blue-900">
      
      {/* 1. Control Sidebar panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onRetrain={sidebarRetrainTrigger}
        isTraining={isTraining}
        onClearSampleData={handleClearSampleData}
      />

      {/* 2. Primary layout body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Universal Metrics & KPI Header banner */}
        <Header metrics={metrics} loading={loading} />

        {/* Tab Selection Canvas Area */}
        <main className="flex-1 overflow-x-hidden">
          {activeTab === "orders" && (
            <OrdersTab 
              orders={orders} 
              inventory={inventory}
              onAddOrder={handleAddOrder} 
              onUpdateOrder={handleUpdateOrder}
              onGetAiRecommendation={handleGetAiRecommendation}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab 
              inventory={inventory} 
              onUpdateInventory={handleUpdateInventory} 
              loading={loading}
            />
          )}

          {activeTab === "predictions" && (
            <PredictionsTab 
              mlMetrics={metrics ? metrics.mlClassifierState : null} 
              onRetrainModel={handleRetrainModel}
              isTraining={isTraining}
            />
          )}

          {activeTab === "alerts" && (
            <AlertsTab alerts={alerts} />
          )}
        </main>

      </div>

    </div>
  );
}
