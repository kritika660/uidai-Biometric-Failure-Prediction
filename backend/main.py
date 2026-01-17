from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime, timedelta
import json

app = FastAPI(title="UIDAI Biometric Dashboard API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data and models
DATA_FILE = "data/uidai_sample_data.csv"
MODEL_FILE = "models/biometric_model.pkl"
SHAP_EXPLAINER_FILE = "models/shap_explainer.pkl"

# Global variables for data and models
df = None
model = None
shap_explainer = None

class PredictionRequest(BaseModel):
    age_group: str
    biometric_type: str
    device_model: str
    state: str
    district: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    global df, model, shap_explainer
    try:
        # Load data
        if os.path.exists(DATA_FILE):
            df = pd.read_csv(DATA_FILE)
            df['auth_timestamp'] = pd.to_datetime(df['auth_timestamp'])
        
        # Load models
        if os.path.exists(MODEL_FILE):
            with open(MODEL_FILE, 'rb') as f:
                model = pickle.load(f)
        
        if os.path.exists(SHAP_EXPLAINER_FILE):
            with open(SHAP_EXPLAINER_FILE, 'rb') as f:
                shap_explainer = pickle.load(f)
    except Exception as e:
        print(f"Warning: Could not load data/models: {e}")

@app.get("/")
async def root():
    return {"message": "UIDAI Biometric Dashboard API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "data_loaded": df is not None, "model_loaded": model is not None}

@app.get("/api/kpis")
async def get_kpis():
    """Get dashboard KPIs"""
    if df is None:
        return {
            "overall_failure_rate": 0,
            "highest_risk_district": "N/A",
            "worst_device": "N/A",
            "elderly_failure_delta": 0,
            "seasonal_spike": 0
        }
    
    total = len(df)
    failures = len(df[df['auth_result'] == 'failure'])
    failure_rate = (failures / total * 100) if total > 0 else 0
    
    # Highest risk district
    district_failures = df[df['auth_result'] == 'failure'].groupby('district').size()
    highest_risk_district = district_failures.idxmax() if len(district_failures) > 0 else "N/A"
    
    # Worst device
    device_failures = df[df['auth_result'] == 'failure'].groupby('device_model').size()
    worst_device = device_failures.idxmax() if len(device_failures) > 0 else "N/A"
    
    # Elderly failure delta
    elderly_df = df[df['age_group'] == 'elderly']
    non_elderly_df = df[df['age_group'] != 'elderly']
    elderly_failure_rate = (len(elderly_df[elderly_df['auth_result'] == 'failure']) / len(elderly_df) * 100) if len(elderly_df) > 0 else 0
    non_elderly_failure_rate = (len(non_elderly_df[non_elderly_df['auth_result'] == 'failure']) / len(non_elderly_df) * 100) if len(non_elderly_df) > 0 else 0
    elderly_delta = elderly_failure_rate - non_elderly_failure_rate
    
    # Seasonal spike
    df['month'] = df['auth_timestamp'].dt.month
    monthly_failures = df[df['auth_result'] == 'failure'].groupby('month').size()
    avg_monthly = monthly_failures.mean() if len(monthly_failures) > 0 else 0
    peak_month = monthly_failures.max() if len(monthly_failures) > 0 else 0
    seasonal_spike = ((peak_month - avg_monthly) / avg_monthly * 100) if avg_monthly > 0 else 0
    
    return {
        "overall_failure_rate": round(failure_rate, 2),
        "highest_risk_district": highest_risk_district,
        "worst_device": worst_device,
        "elderly_failure_delta": round(elderly_delta, 2),
        "seasonal_spike": round(seasonal_spike, 2)
    }

@app.get("/api/risk-zones")
async def get_risk_zones(biometric_type: Optional[str] = None, age_group: Optional[str] = None):
    """Get risk zone data for map visualization"""
    if df is None:
        return {"zones": []}
    
    filtered_df = df.copy()
    
    if biometric_type:
        filtered_df = filtered_df[filtered_df['biometric_type'] == biometric_type]
    if age_group:
        filtered_df = filtered_df[filtered_df['age_group'] == age_group]
    
    # Calculate failure rates by state/district
    risk_data = []
    for state in filtered_df['state'].unique():
        state_df = filtered_df[filtered_df['state'] == state]
        total = len(state_df)
        failures = len(state_df[state_df['auth_result'] == 'failure'])
        failure_rate = (failures / total * 100) if total > 0 else 0
        
        risk_data.append({
            "state": state,
            "failure_rate": round(failure_rate, 2),
            "total_attempts": int(total),
            "failures": int(failures)
        })
    
    return {"zones": risk_data}

@app.post("/api/predict")
async def predict_failure(request: PredictionRequest):
    """Predict biometric failure probability"""
    if model is None:
        # Return mock prediction if model not loaded
        return {
            "failure_probability": 15.5,
            "risk_level": "Medium",
            "confidence": 0.75,
            "factors": {
                "age_group": 0.2,
                "biometric_type": 0.15,
                "device_model": 0.1,
                "state": 0.05
            }
        }
    
    # Prepare features for prediction
    # This is a simplified version - in production, you'd encode categoricals properly
    features = {
        'age_group': request.age_group,
        'biometric_type': request.biometric_type,
        'device_model': request.device_model,
        'state': request.state
    }
    
    # For demo, return a calculated prediction based on historical data
    if df is not None:
        filtered = df[
            (df['age_group'] == request.age_group) &
            (df['biometric_type'] == request.biometric_type) &
            (df['device_model'] == request.device_model) &
            (df['state'] == request.state)
        ]
        
        if len(filtered) > 0:
            failure_rate = len(filtered[filtered['auth_result'] == 'failure']) / len(filtered) * 100
        else:
            failure_rate = df[df['auth_result'] == 'failure'].shape[0] / len(df) * 100
    else:
        failure_rate = 15.5
    
    # Determine risk level
    if failure_rate < 10:
        risk_level = "Low"
    elif failure_rate < 20:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "failure_probability": round(failure_rate, 2),
        "risk_level": risk_level,
        "confidence": 0.75,
        "factors": {
            "age_group": 0.2,
            "biometric_type": 0.15,
            "device_model": 0.1,
            "state": 0.05
        }
    }

@app.get("/api/feature-importance")
async def get_feature_importance():
    """Get SHAP feature importance"""
    if df is None:
        return {"features": []}
    
    # Simplified feature importance based on correlation
    features = []
    
    # Age group importance
    age_groups = df.groupby(['age_group', 'auth_result']).size().unstack(fill_value=0)
    if 'failure' in age_groups.columns:
        age_importance = (age_groups['failure'] / age_groups.sum(axis=1)).max()
        features.append({"name": "Age Group", "importance": float(age_importance * 100)})
    
    # Biometric type importance
    bio_types = df.groupby(['biometric_type', 'auth_result']).size().unstack(fill_value=0)
    if 'failure' in bio_types.columns:
        bio_importance = (bio_types['failure'] / bio_types.sum(axis=1)).max()
        features.append({"name": "Biometric Type", "importance": float(bio_importance * 100)})
    
    # Device model importance
    devices = df.groupby(['device_model', 'auth_result']).size().unstack(fill_value=0)
    if 'failure' in devices.columns:
        device_importance = (devices['failure'] / devices.sum(axis=1)).max()
        features.append({"name": "Device Model", "importance": float(device_importance * 100)})
    
    # Sort by importance
    features.sort(key=lambda x: x['importance'], reverse=True)
    
    return {"features": features}

@app.get("/api/trends")
async def get_trends():
    """Get time-series trends"""
    if df is None:
        return {"monthly": [], "age_groups": [], "devices": []}
    
    # Monthly trends
    df['month'] = df['auth_timestamp'].dt.to_period('M')
    monthly = df.groupby(['month', 'auth_result']).size().unstack(fill_value=0)
    monthly_data = []
    for month in monthly.index:
        total = monthly.loc[month].sum()
        failures = monthly.loc[month].get('failure', 0)
        monthly_data.append({
            "month": str(month),
            "failure_rate": round((failures / total * 100) if total > 0 else 0, 2)
        })
    
    # Age group trends
    age_trends = df.groupby(['age_group', 'auth_result']).size().unstack(fill_value=0)
    age_data = []
    for age_group in age_trends.index:
        total = age_trends.loc[age_group].sum()
        failures = age_trends.loc[age_group].get('failure', 0)
        age_data.append({
            "age_group": age_group,
            "failure_rate": round((failures / total * 100) if total > 0 else 0, 2)
        })
    
    # Device trends
    device_trends = df.groupby(['device_model', 'auth_result']).size().unstack(fill_value=0)
    device_data = []
    for device in device_trends.index:
        total = device_trends.loc[device].sum()
        failures = device_trends.loc[device].get('failure', 0)
        device_data.append({
            "device": device,
            "failure_rate": round((failures / total * 100) if total > 0 else 0, 2)
        })
    
    return {
        "monthly": monthly_data,
        "age_groups": age_data,
        "devices": device_data
    }

@app.get("/api/insights")
async def get_insights():
    """Generate actionable insights"""
    if df is None:
        return {"insights": []}
    
    insights = []
    
    # Elderly fingerprint failures in winter
    df['month'] = df['auth_timestamp'].dt.month
    winter_months = [11, 12, 1, 2]
    elderly_winter = df[
        (df['age_group'] == 'elderly') &
        (df['biometric_type'] == 'fingerprint') &
        (df['month'].isin(winter_months))
    ]
    if len(elderly_winter) > 0:
        elderly_winter_failure_rate = len(elderly_winter[elderly_winter['auth_result'] == 'failure']) / len(elderly_winter) * 100
        if elderly_winter_failure_rate > 20:
            insights.append({
                "type": "warning",
                "title": "Elderly Fingerprint Failures High in Winter",
                "description": f"Elderly users experience {elderly_winter_failure_rate:.1f}% failure rate during winter months. Consider promoting iris authentication or device upgrades.",
                "priority": "High"
            })
    
    # Device model analysis
    device_failures = df.groupby(['device_model', 'auth_result']).size().unstack(fill_value=0)
    for device in device_failures.index:
        total = device_failures.loc[device].sum()
        failures = device_failures.loc[device].get('failure', 0)
        failure_rate = (failures / total * 100) if total > 0 else 0
        avg_failure_rate = len(df[df['auth_result'] == 'failure']) / len(df) * 100
        
        if failure_rate > avg_failure_rate * 1.5:
            multiplier = failure_rate / avg_failure_rate if avg_failure_rate > 0 else 0
            insights.append({
                "type": "critical",
                "title": f"Device Model {device} Underperforming",
                "description": f"Device model {device} shows {multiplier:.1f}x higher failure rate ({failure_rate:.1f}% vs {avg_failure_rate:.1f}%). Recommend replacement or firmware update.",
                "priority": "High"
            })
    
    # Regional risk
    state_failures = df.groupby(['state', 'auth_result']).size().unstack(fill_value=0)
    for state in state_failures.index:
        total = state_failures.loc[state].sum()
        failures = state_failures.loc[state].get('failure', 0)
        failure_rate = (failures / total * 100) if total > 0 else 0
        
        if failure_rate > 25:
            insights.append({
                "type": "warning",
                "title": f"High Risk Zone: {state}",
                "description": f"{state} shows {failure_rate:.1f}% failure rate. Investigate environmental factors, device quality, or user demographics.",
                "priority": "Medium"
            })
    
    return {"insights": insights[:10]}  # Return top 10 insights

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

