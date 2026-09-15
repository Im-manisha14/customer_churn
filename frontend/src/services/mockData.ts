import {
  Customer,
  DashboardStats,
  ChurnByContractItem,
  ChurnByTenureItem,
  RiskDistributionItem,
  ChurnDriver,
  ModelMetrics,
  ConfusionMatrixData,
  RocCurvePoint,
  PrCurvePoint,
  ThresholdMetrics,
  PredictionResponse,
  ExplanationResponse,
  RetentionRecommendation,
  ThresholdComparisonRow,
} from '../types';

// ──────────────────────────────────────────────────────────────
// Mock Customer Dataset (Telco-style, 60 records)
// ──────────────────────────────────────────────────────────────

export const MOCK_CUSTOMERS: Customer[] = [
  { customerID: '7590-VHVEG', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 1, phoneService: 'No', multipleLines: 'No phone service', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 29.85, totalCharges: 29.85, churn: 'No', churnProbability: 0.82, riskLevel: 'High' },
  { customerID: '5575-GNVDE', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 34, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 56.95, totalCharges: 1889.5, churn: 'No', churnProbability: 0.18, riskLevel: 'Low' },
  { customerID: '3668-QPYBK', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 2, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Mailed check', monthlyCharges: 53.85, totalCharges: 108.15, churn: 'Yes', churnProbability: 0.74, riskLevel: 'High' },
  { customerID: '7795-CFOCW', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 45, phoneService: 'No', multipleLines: 'No phone service', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 42.30, totalCharges: 1840.75, churn: 'No', churnProbability: 0.12, riskLevel: 'Low' },
  { customerID: '9237-HQITU', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 2, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 70.70, totalCharges: 151.65, churn: 'Yes', churnProbability: 0.88, riskLevel: 'High' },
  { customerID: '9305-CDSKC', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 8, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 99.65, totalCharges: 820.5, churn: 'Yes', churnProbability: 0.79, riskLevel: 'High' },
  { customerID: '1452-KIOVK', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'Yes', tenure: 22, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 89.10, totalCharges: 1949.4, churn: 'No', churnProbability: 0.52, riskLevel: 'Medium' },
  { customerID: '6713-OKOMC', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 10, phoneService: 'No', multipleLines: 'No phone service', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 29.75, totalCharges: 301.9, churn: 'No', churnProbability: 0.43, riskLevel: 'Medium' },
  { customerID: '7892-POOKP', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 28, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 104.80, totalCharges: 3046.05, churn: 'Yes', churnProbability: 0.67, riskLevel: 'High' },
  { customerID: '6388-TABGU', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 62, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 56.15, totalCharges: 3487.95, churn: 'No', churnProbability: 0.09, riskLevel: 'Low' },
  { customerID: '9763-GRSKD', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 13, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 75.05, totalCharges: 995.45, churn: 'Yes', churnProbability: 0.61, riskLevel: 'High' },
  { customerID: '7469-LKBCI', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 16, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 20.25, totalCharges: 323.5, churn: 'No', churnProbability: 0.06, riskLevel: 'Low' },
  { customerID: '8091-TTVAX', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 58, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 100.35, totalCharges: 5979.55, churn: 'Yes', churnProbability: 0.57, riskLevel: 'Medium' },
  { customerID: '0280-XJGEX', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 1, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 69.65, totalCharges: 69.65, churn: 'No', churnProbability: 0.85, riskLevel: 'High' },
  { customerID: '5129-JLPIS', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 25, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'One year', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 108.15, totalCharges: 2638.6, churn: 'No', churnProbability: 0.23, riskLevel: 'Low' },
  { customerID: '3655-SNQYZ', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 71, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 95.45, totalCharges: 6870.45, churn: 'No', churnProbability: 0.15, riskLevel: 'Low' },
  { customerID: '8161-QEHNK', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 7, phoneService: 'No', multipleLines: 'No phone service', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 24.25, totalCharges: 160.2, churn: 'No', churnProbability: 0.48, riskLevel: 'Medium' },
  { customerID: '8665-UTDHZ', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 5, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 19.95, totalCharges: 100.5, churn: 'No', churnProbability: 0.29, riskLevel: 'Low' },
  { customerID: '7961-MTSKW', gender: 'Male', seniorCitizen: 1, partner: 'No', dependents: 'No', tenure: 32, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 80.10, totalCharges: 2570.85, churn: 'Yes', churnProbability: 0.65, riskLevel: 'High' },
  { customerID: '6569-WKBNI', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 72, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 115.50, totalCharges: 8312.75, churn: 'No', churnProbability: 0.04, riskLevel: 'Low' },
  { customerID: '1180-DQYBY', gender: 'Female', seniorCitizen: 1, partner: 'Yes', dependents: 'No', tenure: 14, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 96.35, totalCharges: 1390.55, churn: 'No', churnProbability: 0.70, riskLevel: 'High' },
  { customerID: '5169-YWCBM', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 60, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 35.00, totalCharges: 2107.25, churn: 'No', churnProbability: 0.11, riskLevel: 'Low' },
  { customerID: '3544-LMMKC', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 3, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 74.50, totalCharges: 191.5, churn: 'Yes', churnProbability: 0.77, riskLevel: 'High' },
  { customerID: '4467-EWNMM', gender: 'Female', seniorCitizen: 1, partner: 'No', dependents: 'No', tenure: 4, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 69.85, totalCharges: 258.45, churn: 'Yes', churnProbability: 0.82, riskLevel: 'High' },
  { customerID: '1371-DWPAZ', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 56, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 20.55, totalCharges: 1176.55, churn: 'No', churnProbability: 0.07, riskLevel: 'Low' },
  { customerID: '6461-UQKWI', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 1, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 44.80, totalCharges: 44.8, churn: 'No', churnProbability: 0.66, riskLevel: 'High' },
  { customerID: '8456-QDAVC', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 72, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Credit card (automatic)', monthlyCharges: 112.25, totalCharges: 8106.55, churn: 'No', churnProbability: 0.03, riskLevel: 'Low' },
  { customerID: '4190-MFLUW', gender: 'Female', seniorCitizen: 1, partner: 'Yes', dependents: 'No', tenure: 16, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 80.65, totalCharges: 1306.05, churn: 'Yes', churnProbability: 0.73, riskLevel: 'High' },
  { customerID: '7341-UMEZZ', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 42, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 50.40, totalCharges: 2107.9, churn: 'No', churnProbability: 0.19, riskLevel: 'Low' },
  { customerID: '2920-AGURT', gender: 'Male', seniorCitizen: 1, partner: 'No', dependents: 'No', tenure: 3, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 79.85, totalCharges: 242.5, churn: 'Yes', churnProbability: 0.86, riskLevel: 'High' },
  { customerID: '8529-FHKNO', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 48, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 84.65, totalCharges: 4024.5, churn: 'No', churnProbability: 0.44, riskLevel: 'Medium' },
  { customerID: '2923-ARZLG', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 65, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 19.65, totalCharges: 1250.55, churn: 'No', churnProbability: 0.05, riskLevel: 'Low' },
  { customerID: '4075-WKNIU', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 6, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 65.15, totalCharges: 387.25, churn: 'Yes', churnProbability: 0.78, riskLevel: 'High' },
  { customerID: '9391-LDYUE', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 55, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 93.65, totalCharges: 5133.65, churn: 'No', churnProbability: 0.17, riskLevel: 'Low' },
  { customerID: '5219-PVRZJ', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 9, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 78.60, totalCharges: 712.5, churn: 'Yes', churnProbability: 0.69, riskLevel: 'High' },
  { customerID: '3186-AJIEK', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 55, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'No', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Credit card (automatic)', monthlyCharges: 66.10, totalCharges: 3639.9, churn: 'No', churnProbability: 0.14, riskLevel: 'Low' },
  { customerID: '4367-NUYAO', gender: 'Female', seniorCitizen: 1, partner: 'No', dependents: 'No', tenure: 1, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 72.65, totalCharges: 72.65, churn: 'Yes', churnProbability: 0.90, riskLevel: 'High' },
  { customerID: '1725-YCDPF', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 48, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 57.90, totalCharges: 2776.95, churn: 'No', churnProbability: 0.13, riskLevel: 'Low' },
  { customerID: '3213-VVOLG', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 72, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 25.35, totalCharges: 1827.4, churn: 'No', churnProbability: 0.06, riskLevel: 'Low' },
  { customerID: '2520-SGTTA', gender: 'Female', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 36, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'One year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 20.00, totalCharges: 730.4, churn: 'No', churnProbability: 0.10, riskLevel: 'Low' },
  { customerID: '2923-BUWRB', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'Yes', tenure: 12, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 75.80, totalCharges: 918.55, churn: 'No', churnProbability: 0.38, riskLevel: 'Medium' },
  { customerID: '4732-BYPCI', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 21, phoneService: 'No', multipleLines: 'No phone service', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 29.50, totalCharges: 627.3, churn: 'No', churnProbability: 0.35, riskLevel: 'Medium' },
  { customerID: '8245-TNUBY', gender: 'Female', seniorCitizen: 1, partner: 'No', dependents: 'No', tenure: 5, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 84.90, totalCharges: 381.55, churn: 'Yes', churnProbability: 0.83, riskLevel: 'High' },
  { customerID: '1748-UEAFU', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 67, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 118.65, totalCharges: 7904.25, churn: 'No', churnProbability: 0.08, riskLevel: 'Low' },
  { customerID: '9961-SDJEE', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 11, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 88.10, totalCharges: 969.5, churn: 'Yes', churnProbability: 0.72, riskLevel: 'High' },
  { customerID: '4685-QTMCJ', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 39, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 39.20, totalCharges: 1542.9, churn: 'No', churnProbability: 0.41, riskLevel: 'Medium' },
  { customerID: '3455-OEFXX', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 1, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Electronic check', monthlyCharges: 69.45, totalCharges: 69.45, churn: 'Yes', churnProbability: 0.87, riskLevel: 'High' },
  { customerID: '6678-SMADN', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 19, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 55.90, totalCharges: 1051.25, churn: 'No', churnProbability: 0.32, riskLevel: 'Medium' },
  { customerID: '4321-BKEPE', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 28, phoneService: 'Yes', multipleLines: 'No', internetService: 'No', onlineSecurity: 'No internet service', onlineBackup: 'No internet service', deviceProtection: 'No internet service', techSupport: 'No internet service', streamingTV: 'No internet service', streamingMovies: 'No internet service', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 19.50, totalCharges: 529.9, churn: 'No', churnProbability: 0.22, riskLevel: 'Low' },
  { customerID: '1740-CCJIM', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'No', tenure: 40, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'DSL', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Bank transfer (automatic)', monthlyCharges: 85.80, totalCharges: 3420.9, churn: 'No', churnProbability: 0.10, riskLevel: 'Low' },
  { customerID: '6319-XKRSO', gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 4, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'Yes', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 74.45, totalCharges: 267.75, churn: 'Yes', churnProbability: 0.80, riskLevel: 'High' },
  { customerID: '5150-DSGKK', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 50, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'Yes', streamingTV: 'No', streamingMovies: 'No', contract: 'One year', paperlessBilling: 'Yes', paymentMethod: 'Credit card (automatic)', monthlyCharges: 54.05, totalCharges: 2705.85, churn: 'No', churnProbability: 0.21, riskLevel: 'Low' },
  { customerID: '7770-HMFIF', gender: 'Male', seniorCitizen: 0, partner: 'Yes', dependents: 'Yes', tenure: 66, phoneService: 'Yes', multipleLines: 'Yes', internetService: 'Fiber optic', onlineSecurity: 'Yes', onlineBackup: 'Yes', deviceProtection: 'Yes', techSupport: 'Yes', streamingTV: 'Yes', streamingMovies: 'Yes', contract: 'Two year', paperlessBilling: 'No', paymentMethod: 'Credit card (automatic)', monthlyCharges: 116.20, totalCharges: 7671.05, churn: 'No', churnProbability: 0.05, riskLevel: 'Low' },
  { customerID: '2211-XNUCS', gender: 'Male', seniorCitizen: 1, partner: 'Yes', dependents: 'No', tenure: 11, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check', monthlyCharges: 73.35, totalCharges: 805.65, churn: 'Yes', churnProbability: 0.75, riskLevel: 'High' },
  { customerID: '8348-BIEYT', gender: 'Female', seniorCitizen: 0, partner: 'No', dependents: 'No', tenure: 26, phoneService: 'Yes', multipleLines: 'No', internetService: 'DSL', onlineSecurity: 'No', onlineBackup: 'No', deviceProtection: 'No', techSupport: 'No', streamingTV: 'No', streamingMovies: 'No', contract: 'Month-to-month', paperlessBilling: 'No', paymentMethod: 'Mailed check', monthlyCharges: 44.75, totalCharges: 1163.0, churn: 'No', churnProbability: 0.37, riskLevel: 'Medium' },
];

// ── Dashboard Stats ───────────────────────────────────────────

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalCustomers: 7043,
  churnRate: 26.54,
  highRiskCustomers: 1284,
  revenueAtRisk: 184320,
  isDemo: true,
};

// ── Churn by Contract ─────────────────────────────────────────

export const MOCK_CHURN_BY_CONTRACT: ChurnByContractItem[] = [
  { contract: 'Month-to-month', churnRate: 42.7, retained: 2397, churned: 1789 },
  { contract: 'One year', churnRate: 11.3, retained: 1307, churned: 166 },
  { contract: 'Two year', churnRate: 2.8, retained: 1647, churned: 48 },
];

// ── Churn by Tenure ───────────────────────────────────────────

export const MOCK_CHURN_BY_TENURE: ChurnByTenureItem[] = [
  { group: '0–6 months', churnRate: 47.2, retained: 521, churned: 464 },
  { group: '6–12 months', churnRate: 35.8, retained: 648, churned: 361 },
  { group: '1–2 years', churnRate: 22.1, retained: 932, churned: 263 },
  { group: '2–4 years', churnRate: 11.4, retained: 1531, churned: 198 },
  { group: '4+ years', churnRate: 6.3, retained: 1882, churned: 127 },
];

// ── Risk Distribution ─────────────────────────────────────────

export const MOCK_RISK_DISTRIBUTION: RiskDistributionItem[] = [
  { risk: 'High', count: 1284, percentage: 18.2 },
  { risk: 'Medium', count: 2147, percentage: 30.5 },
  { risk: 'Low', count: 3612, percentage: 51.3 },
];

// ── Churn Drivers (Global Feature Importance) ─────────────────

export const MOCK_CHURN_DRIVERS: ChurnDriver[] = [
  { feature: 'Contract', displayName: 'Contract Type', importance: 0.312, description: 'Month-to-month contracts are strongly associated with higher churn rates.' },
  { feature: 'MonthlyCharges', displayName: 'Monthly Charges', importance: 0.247, description: 'Higher monthly charges correlate with increased likelihood of churn.' },
  { feature: 'tenure', displayName: 'Tenure (months)', importance: 0.198, description: 'Shorter tenure customers are at higher risk — new customers need early engagement.' },
  { feature: 'InternetService', displayName: 'Internet Service', importance: 0.143, description: 'Fiber optic customers show notably higher churn rates than DSL or no internet.' },
  { feature: 'PaymentMethod', displayName: 'Payment Method', importance: 0.121, description: 'Electronic check users churn significantly more than automatic payment users.' },
  { feature: 'TechSupport', displayName: 'Tech Support', importance: 0.098, description: 'Customers without tech support are more likely to churn.' },
  { feature: 'OnlineSecurity', displayName: 'Online Security', importance: 0.087, description: 'Absence of online security service is associated with higher churn.' },
  { feature: 'TotalCharges', displayName: 'Total Charges', importance: 0.076, description: 'Total charges reflect tenure — lower totals indicate newer, higher-risk customers.' },
  { feature: 'PaperlessBilling', displayName: 'Paperless Billing', importance: 0.064, description: 'Paperless billing customers show slightly elevated churn rates.' },
  { feature: 'SeniorCitizen', displayName: 'Senior Citizen', importance: 0.052, description: 'Senior citizens show modestly higher churn probability in this dataset.' },
];

// ── Model Metrics ─────────────────────────────────────────────

export const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 0.821,
  precision: 0.648,
  recall: 0.783,
  f1Score: 0.709,
  rocAuc: 0.862,
  prAuc: 0.674,
  isDemo: true,
};

// ── Confusion Matrix ──────────────────────────────────────────

export const MOCK_CONFUSION_MATRIX: ConfusionMatrixData = {
  tn: 3891,
  fp: 251,
  fn: 319,
  tp: 1173,
};

// ── ROC Curve ─────────────────────────────────────────────────

export const MOCK_ROC_CURVE: RocCurvePoint[] = [
  { fpr: 0.00, tpr: 0.00 }, { fpr: 0.02, tpr: 0.18 }, { fpr: 0.05, tpr: 0.38 },
  { fpr: 0.08, tpr: 0.52 }, { fpr: 0.12, tpr: 0.63 }, { fpr: 0.16, tpr: 0.71 },
  { fpr: 0.22, tpr: 0.77 }, { fpr: 0.28, tpr: 0.82 }, { fpr: 0.35, tpr: 0.86 },
  { fpr: 0.43, tpr: 0.89 }, { fpr: 0.52, tpr: 0.92 }, { fpr: 0.62, tpr: 0.94 },
  { fpr: 0.73, tpr: 0.96 }, { fpr: 0.85, tpr: 0.98 }, { fpr: 1.00, tpr: 1.00 },
];

// ── PR Curve ──────────────────────────────────────────────────

export const MOCK_PR_CURVE: PrCurvePoint[] = [
  { recall: 0.00, precision: 1.00 }, { recall: 0.10, precision: 0.93 },
  { recall: 0.20, precision: 0.87 }, { recall: 0.30, precision: 0.82 },
  { recall: 0.40, precision: 0.77 }, { recall: 0.50, precision: 0.73 },
  { recall: 0.60, precision: 0.68 }, { recall: 0.70, precision: 0.63 },
  { recall: 0.783, precision: 0.648 }, { recall: 0.85, precision: 0.57 },
  { recall: 0.92, precision: 0.49 }, { recall: 1.00, precision: 0.265 },
];

// ── Threshold Metrics (for slider) ────────────────────────────

export function computeThresholdMetrics(threshold: number): ThresholdMetrics {
  // Approximate sigmoid-like curves around the base threshold (0.50)
  const delta = threshold - 0.50;
  const precision = Math.min(0.98, 0.648 + delta * 0.85);
  const recall = Math.max(0.05, 0.783 - delta * 1.1);
  const f1 = (2 * precision * recall) / (precision + recall);
  // Total actual positives ≈ 1492, negatives ≈ 4142
  const totalPositives = 1492;
  const totalNegatives = 4142;
  const fp = Math.round(totalNegatives * Math.max(0.01, 0.061 - delta * 0.09));
  const fn = Math.round(totalPositives * Math.max(0.02, 0.214 + delta * 0.35));
  return { threshold, precision, recall, falsePositives: fp, falseNegatives: fn, f1 };
}

// ── Demo Prediction ───────────────────────────────────────────

export function generateDemoPrediction(
  monthlyCharges: number,
  tenure: number,
  contract: string,
  internetService: string,
  paymentMethod: string,
  techSupport: string,
  onlineSecurity: string,
  seniorCitizen: number,
): PredictionResponse {
  // Rule-based scoring for demo
  let score = 0.25;
  if (contract === 'Month-to-month') score += 0.20;
  if (contract === 'Two year') score -= 0.15;
  if (monthlyCharges > 80) score += 0.12;
  if (monthlyCharges > 100) score += 0.08;
  if (tenure < 6) score += 0.15;
  if (tenure > 36) score -= 0.12;
  if (tenure > 60) score -= 0.05;
  if (internetService === 'Fiber optic') score += 0.08;
  if (paymentMethod === 'Electronic check') score += 0.06;
  if (techSupport === 'Yes') score -= 0.05;
  if (onlineSecurity === 'Yes') score -= 0.04;
  if (seniorCitizen === 1) score += 0.04;
  const prob = Math.min(0.97, Math.max(0.03, score));
  const risk = prob >= 0.6 ? 'High' : prob >= 0.3 ? 'Medium' : 'Low';
  const confidence = prob > 0.75 || prob < 0.25 ? 'High' : prob > 0.55 || prob < 0.35 ? 'Medium' : 'Low';
  return {
    customerID: `DEMO-${Date.now()}`,
    churnProbability: Math.round(prob * 1000) / 1000,
    prediction: prob >= 0.5 ? 1 : 0,
    risk,
    confidence,
    isDemo: true,
  };
}

// ── Demo Explanation ──────────────────────────────────────────

export function generateDemoExplanation(
  contract: string,
  monthlyCharges: number,
  tenure: number,
  internetService: string,
  paymentMethod: string,
  techSupport: string,
  onlineSecurity: string,
): ExplanationResponse {
  const positiveFactors = [];
  const negativeFactors = [];

  if (contract === 'Month-to-month') positiveFactors.push({ feature: 'Contract', value: 'Month-to-month', impact: 0.31, displayName: 'Contract Type' });
  if (monthlyCharges > 80) positiveFactors.push({ feature: 'MonthlyCharges', value: monthlyCharges, impact: 0.21, displayName: 'Monthly Charges' });
  if (tenure < 12) positiveFactors.push({ feature: 'tenure', value: tenure, impact: 0.18, displayName: 'Tenure (months)' });
  if (internetService === 'Fiber optic') positiveFactors.push({ feature: 'InternetService', value: 'Fiber optic', impact: 0.10, displayName: 'Internet Service' });
  if (paymentMethod === 'Electronic check') positiveFactors.push({ feature: 'PaymentMethod', value: 'Electronic check', impact: 0.09, displayName: 'Payment Method' });
  if (onlineSecurity === 'No') positiveFactors.push({ feature: 'OnlineSecurity', value: 'No', impact: 0.07, displayName: 'Online Security' });

  if (techSupport === 'Yes') negativeFactors.push({ feature: 'TechSupport', value: 'Yes', impact: -0.08, displayName: 'Tech Support' });
  if (contract === 'Two year') negativeFactors.push({ feature: 'Contract', value: 'Two year', impact: -0.15, displayName: 'Contract Type' });
  if (tenure > 36) negativeFactors.push({ feature: 'tenure', value: tenure, impact: -0.12, displayName: 'Tenure (months)' });
  if (onlineSecurity === 'Yes') negativeFactors.push({ feature: 'OnlineSecurity', value: 'Yes', impact: -0.06, displayName: 'Online Security' });

  const topPos = positiveFactors.slice(0, 5);
  const topNeg = negativeFactors.slice(0, 3);
  const mainFactor = topPos[0]?.displayName || 'contract type';
  const secondFactor = topPos[1]?.displayName || 'monthly charges';

  return {
    customerID: 'DEMO',
    topPositiveFactors: topPos,
    topNegativeFactors: topNeg,
    summary: `The model estimates that the customer's ${mainFactor.toLowerCase()} and ${secondFactor.toLowerCase()} are the strongest contributors to churn risk.`,
    isDemo: true,
  };
}

// ── Retention Recommendations ─────────────────────────────────

export function generateRetentionRecommendation(
  risk: 'High' | 'Medium' | 'Low',
  contract: string,
  monthlyCharges: number,
  techSupport: string,
  onlineSecurity: string,
): RetentionRecommendation {
  const actions = [];
  let id = 1;
  if (contract === 'Month-to-month') {
    actions.push({ id: id++, action: 'Offer a discounted long-term contract incentive (1 or 2-year plan).', priority: 'High' as const });
  }
  if (monthlyCharges > 80) {
    actions.push({ id: id++, action: 'Review monthly pricing — evaluate discount or bundle eligibility.', priority: 'High' as const });
  }
  if (techSupport === 'No') {
    actions.push({ id: id++, action: 'Offer a free 3-month Tech Support trial to improve service satisfaction.', priority: 'Medium' as const });
  }
  if (onlineSecurity === 'No') {
    actions.push({ id: id++, action: 'Provide a security bundle (Online Security + Backup) at a promotional rate.', priority: 'Medium' as const });
  }
  if (risk === 'High') {
    actions.push({ id: id++, action: 'Prioritize personal outreach — contact the customer within 7 days.', priority: 'High' as const });
  }
  if (actions.length === 0) {
    actions.push({ id: id++, action: 'Continue regular customer health-check cadence.', priority: 'Low' as const });
  }
  return { priority: risk, actions, isRuleBased: true };
}

// ── Threshold Comparison (Business Impact) ────────────────────

export function computeThresholdComparison(
  lifetimeValue: number,
  retentionCost: number,
  successRate: number,
): ThresholdComparisonRow[] {
  const totalCustomers = 7043;
  const actualChurners = 1868;
  const thresholds = [0.30, 0.40, 0.50, 0.60, 0.70, 0.80];
  return thresholds.map((t) => {
    const pctTargeted = Math.max(0.05, 0.72 - t * 0.8);
    const targeted = Math.round(totalCustomers * pctTargeted);
    const recallAtThreshold = Math.max(0.10, 0.96 - t * 0.95);
    const captured = Math.round(actualChurners * recallAtThreshold);
    const cost = targeted * retentionCost;
    const retained = Math.round(captured * (successRate / 100));
    const valueProtected = retained * lifetimeValue;
    const netBenefit = valueProtected - cost;
    return { threshold: t, customersTargeted: targeted, expectedChurnersCaptures: captured, retentionCost: cost, valueProtected, netBenefit };
  });
}
