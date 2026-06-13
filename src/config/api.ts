// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Inventory
  inventory: `${API_BASE_URL}/inventory`,
  inventoryById: (id: string) => `${API_BASE_URL}/inventory/${id}`,
  
  // Orders
  orders: `${API_BASE_URL}/orders`,
  orderById: (id: string) => `${API_BASE_URL}/orders/${id}`,
  orderStage: (id: string) => `${API_BASE_URL}/orders/${id}/stage`,
  
  // Alerts
  alerts: `${API_BASE_URL}/alerts`,
  
  // Metrics
  metrics: `${API_BASE_URL}/dashboard/metrics`,
  
  // ML Model
  modelMetrics: `${API_BASE_URL}/model-metrics`,
  modelRetrain: `${API_BASE_URL}/model/retrain`,
  
  // Recommendations
  recommendations: `${API_BASE_URL}/recommendations`,
};

export default API_BASE_URL;
