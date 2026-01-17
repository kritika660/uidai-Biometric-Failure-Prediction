"""
Train ML model for biometric failure prediction
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import pickle
import os

def train_model():
    """Train and save the ML model"""
    
    # Load data
    data_file = "data/uidai_sample_data.csv"
    if not os.path.exists(data_file):
        print(f"Data file not found: {data_file}")
        print("Please run generate_data.py first")
        return
    
    df = pd.read_csv(data_file)
    df['auth_timestamp'] = pd.to_datetime(df['auth_timestamp'])
    
    # Feature engineering
    df['month'] = df['auth_timestamp'].dt.month
    df['day_of_week'] = df['auth_timestamp'].dt.dayofweek
    df['hour'] = df['auth_timestamp'].dt.hour
    
    # Encode categorical variables
    label_encoders = {}
    categorical_features = ['age_group', 'biometric_type', 'device_model', 'state', 'gender']
    
    for feature in categorical_features:
        le = LabelEncoder()
        df[f'{feature}_encoded'] = le.fit_transform(df[feature])
        label_encoders[feature] = le
    
    # Prepare features
    feature_cols = [f'{feat}_encoded' for feat in categorical_features] + ['month', 'day_of_week', 'hour']
    X = df[feature_cols]
    y = (df['auth_result'] == 'failure').astype(int)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost model
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Train accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Save model
    os.makedirs("models", exist_ok=True)
    model_file = "models/biometric_model.pkl"
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_file}")
    
    # Save label encoders
    encoders_file = "models/label_encoders.pkl"
    with open(encoders_file, 'wb') as f:
        pickle.dump(label_encoders, f)
    print(f"Label encoders saved to {encoders_file}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 5 Feature Importances:")
    print(feature_importance.head())

if __name__ == "__main__":
    train_model()

