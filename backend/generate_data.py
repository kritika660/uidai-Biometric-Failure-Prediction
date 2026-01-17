"""
Generate sample UIDAI biometric authentication dataset
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Indian states and districts
STATES = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", 
          "West Bengal", "Uttar Pradesh", "Bihar", "Punjab", "Haryana", "Kerala"]

DISTRICTS = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"]
}

AGE_GROUPS = ["young", "adult", "elderly"]
BIOMETRIC_TYPES = ["fingerprint", "iris"]
DEVICE_MODELS = ["UIDAI_Device_A", "UIDAI_Device_B", "UIDAI_Device_C", "UIDAI_Device_D", "UIDAI_Device_E"]
FAILURE_REASONS = ["poor_quality", "environmental", "device_error", "user_error", "network_timeout", None]

def generate_sample_data(n_records=10000):
    """Generate sample UIDAI authentication data"""
    
    records = []
    start_date = datetime.now() - timedelta(days=365)
    
    for i in range(n_records):
        # Random timestamp
        days_offset = random.randint(0, 365)
        hours_offset = random.randint(0, 23)
        timestamp = start_date + timedelta(days=days_offset, hours=hours_offset)
        
        # Random state and district
        state = random.choice(STATES)
        district = random.choice(DISTRICTS[state])
        
        # Random demographics
        age_group = random.choices(
            AGE_GROUPS,
            weights=[0.3, 0.5, 0.2]  # More adults, fewer elderly
        )[0]
        
        gender = random.choice(["male", "female", "other"])
        
        # Biometric type with some correlation to age
        if age_group == "elderly":
            biometric_type = random.choices(
                BIOMETRIC_TYPES,
                weights=[0.4, 0.6]  # Elderly prefer iris
            )[0]
        else:
            biometric_type = random.choice(BIOMETRIC_TYPES)
        
        # Device model
        device_model = random.choice(DEVICE_MODELS)
        
        # Failure probability based on various factors
        base_failure_rate = 0.15
        
        # Age factor
        if age_group == "elderly":
            base_failure_rate += 0.1
        elif age_group == "young":
            base_failure_rate -= 0.02
        
        # Biometric type factor
        if biometric_type == "fingerprint":
            base_failure_rate += 0.05
        
        # Device model factor (some devices are worse)
        if device_model in ["UIDAI_Device_C", "UIDAI_Device_D"]:
            base_failure_rate += 0.08
        
        # Seasonal factor (winter months have higher failure)
        month = timestamp.month
        if month in [11, 12, 1, 2]:  # Winter
            base_failure_rate += 0.05
        
        # Regional factor (some states have higher failure)
        if state in ["Bihar", "Rajasthan", "Uttar Pradesh"]:
            base_failure_rate += 0.05
        
        # Determine success/failure
        auth_result = "failure" if random.random() < base_failure_rate else "success"
        
        # Failure reason (only if failed)
        failure_reason = None
        if auth_result == "failure":
            failure_reason = random.choice(FAILURE_REASONS[:-1])  # Exclude None
        
        # Attempt count (usually 1, sometimes retries)
        attempt_count = 1
        if auth_result == "failure" and random.random() < 0.3:
            attempt_count = random.randint(2, 4)
        
        records.append({
            "auth_timestamp": timestamp,
            "state": state,
            "district": district,
            "age_group": age_group,
            "gender": gender,
            "biometric_type": biometric_type,
            "device_model": device_model,
            "auth_result": auth_result,
            "failure_reason": failure_reason,
            "attempt_count": attempt_count
        })
    
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    print("Generating sample UIDAI dataset...")
    df = generate_sample_data(n_records=15000)
    
    # Create directories
    import os
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    
    # Save to CSV
    output_file = "data/uidai_sample_data.csv"
    df.to_csv(output_file, index=False)
    print(f"Generated {len(df)} records")
    print(f"Saved to {output_file}")
    print(f"\nSample statistics:")
    print(f"Total records: {len(df)}")
    print(f"Failure rate: {len(df[df['auth_result'] == 'failure']) / len(df) * 100:.2f}%")
    print(f"\nBy age group:")
    for age in df['age_group'].unique():
        age_df = df[df['age_group'] == age]
        failure_rate = len(age_df[age_df['auth_result'] == 'failure']) / len(age_df) * 100
        print(f"  {age}: {failure_rate:.2f}%")
    print(f"\nBy biometric type:")
    for bio in df['biometric_type'].unique():
        bio_df = df[df['biometric_type'] == bio]
        failure_rate = len(bio_df[bio_df['auth_result'] == 'failure']) / len(bio_df) * 100
        print(f"  {bio}: {failure_rate:.2f}%")

