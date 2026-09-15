"""
Mock customer dataset for the backend.
Replace this with a real database or CSV loader once you have the Telco dataset.
"""

from __future__ import annotations

MOCK_CUSTOMERS_RAW = [
    {"customerID": "7590-VHVEG", "gender": "Female", "seniorCitizen": 0, "partner": "Yes", "dependents": "No", "tenure": 1, "phoneService": "No", "multipleLines": "No phone service", "internetService": "DSL", "onlineSecurity": "No", "onlineBackup": "Yes", "deviceProtection": "No", "techSupport": "No", "streamingTV": "No", "streamingMovies": "No", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Electronic check", "monthlyCharges": 29.85, "totalCharges": 29.85, "churn": "No", "churnProbability": 0.82, "riskLevel": "High"},
    {"customerID": "5575-GNVDE", "gender": "Male", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 34, "phoneService": "Yes", "multipleLines": "No", "internetService": "DSL", "onlineSecurity": "Yes", "onlineBackup": "No", "deviceProtection": "Yes", "techSupport": "No", "streamingTV": "No", "streamingMovies": "No", "contract": "One year", "paperlessBilling": "No", "paymentMethod": "Mailed check", "monthlyCharges": 56.95, "totalCharges": 1889.5, "churn": "No", "churnProbability": 0.18, "riskLevel": "Low"},
    {"customerID": "3668-QPYBK", "gender": "Male", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 2, "phoneService": "Yes", "multipleLines": "No", "internetService": "DSL", "onlineSecurity": "Yes", "onlineBackup": "Yes", "deviceProtection": "No", "techSupport": "No", "streamingTV": "No", "streamingMovies": "No", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Mailed check", "monthlyCharges": 53.85, "totalCharges": 108.15, "churn": "Yes", "churnProbability": 0.74, "riskLevel": "High"},
    {"customerID": "7795-CFOCW", "gender": "Male", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 45, "phoneService": "No", "multipleLines": "No phone service", "internetService": "DSL", "onlineSecurity": "Yes", "onlineBackup": "No", "deviceProtection": "Yes", "techSupport": "Yes", "streamingTV": "No", "streamingMovies": "No", "contract": "One year", "paperlessBilling": "No", "paymentMethod": "Bank transfer (automatic)", "monthlyCharges": 42.30, "totalCharges": 1840.75, "churn": "No", "churnProbability": 0.12, "riskLevel": "Low"},
    {"customerID": "9237-HQITU", "gender": "Female", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 2, "phoneService": "Yes", "multipleLines": "No", "internetService": "Fiber optic", "onlineSecurity": "No", "onlineBackup": "No", "deviceProtection": "No", "techSupport": "No", "streamingTV": "No", "streamingMovies": "No", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Electronic check", "monthlyCharges": 70.70, "totalCharges": 151.65, "churn": "Yes", "churnProbability": 0.88, "riskLevel": "High"},
    {"customerID": "9305-CDSKC", "gender": "Female", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 8, "phoneService": "Yes", "multipleLines": "Yes", "internetService": "Fiber optic", "onlineSecurity": "No", "onlineBackup": "No", "deviceProtection": "Yes", "techSupport": "No", "streamingTV": "Yes", "streamingMovies": "Yes", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Electronic check", "monthlyCharges": 99.65, "totalCharges": 820.5, "churn": "Yes", "churnProbability": 0.79, "riskLevel": "High"},
    {"customerID": "1452-KIOVK", "gender": "Male", "seniorCitizen": 0, "partner": "No", "dependents": "Yes", "tenure": 22, "phoneService": "Yes", "multipleLines": "Yes", "internetService": "Fiber optic", "onlineSecurity": "No", "onlineBackup": "Yes", "deviceProtection": "No", "techSupport": "No", "streamingTV": "Yes", "streamingMovies": "No", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Credit card (automatic)", "monthlyCharges": 89.10, "totalCharges": 1949.4, "churn": "No", "churnProbability": 0.52, "riskLevel": "Medium"},
    {"customerID": "6713-OKOMC", "gender": "Female", "seniorCitizen": 0, "partner": "No", "dependents": "No", "tenure": 10, "phoneService": "No", "multipleLines": "No phone service", "internetService": "DSL", "onlineSecurity": "No", "onlineBackup": "No", "deviceProtection": "No", "techSupport": "No", "streamingTV": "No", "streamingMovies": "No", "contract": "Month-to-month", "paperlessBilling": "No", "paymentMethod": "Mailed check", "monthlyCharges": 29.75, "totalCharges": 301.9, "churn": "No", "churnProbability": 0.43, "riskLevel": "Medium"},
    {"customerID": "7892-POOKP", "gender": "Female", "seniorCitizen": 0, "partner": "Yes", "dependents": "No", "tenure": 28, "phoneService": "Yes", "multipleLines": "Yes", "internetService": "Fiber optic", "onlineSecurity": "No", "onlineBackup": "No", "deviceProtection": "Yes", "techSupport": "No", "streamingTV": "Yes", "streamingMovies": "Yes", "contract": "Month-to-month", "paperlessBilling": "Yes", "paymentMethod": "Electronic check", "monthlyCharges": 104.80, "totalCharges": 3046.05, "churn": "Yes", "churnProbability": 0.67, "riskLevel": "High"},
    {"customerID": "6388-TABGU", "gender": "Male", "seniorCitizen": 0, "partner": "Yes", "dependents": "Yes", "tenure": 62, "phoneService": "Yes", "multipleLines": "No", "internetService": "DSL", "onlineSecurity": "Yes", "onlineBackup": "Yes", "deviceProtection": "No", "techSupport": "No", "streamingTV": "Yes", "streamingMovies": "Yes", "contract": "One year", "paperlessBilling": "No", "paymentMethod": "Bank transfer (automatic)", "monthlyCharges": 56.15, "totalCharges": 3487.95, "churn": "No", "churnProbability": 0.09, "riskLevel": "Low"},
]


def get_all_customers() -> list[dict]:
    return MOCK_CUSTOMERS_RAW


def get_customer_by_id(customer_id: str) -> dict | None:
    for c in MOCK_CUSTOMERS_RAW:
        if c["customerID"] == customer_id:
            return c
    return None
