export interface InventoryItem {
  id: string;
  lensType: string; // 'Single Vision' | 'Bifocal' | 'Progressive'
  powerSphere: number;
  powerCylinder: number;
  quantity: number;
  minThreshold: number; // threshold for 'Low Stock' status
}

export interface StatusHistoryEntry {
  stage: string;
  timestamp: string;
  operatorName: string;
  notes?: string;
  delayReason?: string;
}

export interface Order {
  id: string;
  customerName: string;
  lensType: string;
  powerSphere: number;
  powerCylinder: number;
  location: string;
  slaDeadline: string; // ISO string
  currentStage: string; // 'Order Received' | 'Lens Selection' | 'Lens Surfacing' | 'Polishing' | 'Coating' | 'Quality Check' | 'Fulfillment Ready' | 'Delivered'
  statusHistory: StatusHistoryEntry[];
  riskScore: number; // ML prediction breach risk (0 - 100)
  riskLevel: 'Low' | 'Medium' | 'High'; // <=30, 30-70, >70
  isLowStock: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
  delayReason?: string;
}

export interface AlertLog {
  id: string;
  orderId: string;
  customerName: string;
  riskScore: number;
  channel: 'Email' | 'WhatsApp';
  message: string;
  sentAt: string;
}

export interface MLMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  featureImportances: { feature: string; importance: number }[];
  totalSamples: number;
}
