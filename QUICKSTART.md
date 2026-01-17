# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate sample data (15,000 records)
python generate_data.py

# (Optional) Train ML model
python train_model.py

# Start the FastAPI server
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Step 2: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Step 3: Access the Dashboard

1. Open your browser and go to `http://localhost:3000`
2. The dashboard will automatically fetch data from the backend
3. Explore the features:
   - View KPI cards at the top
   - Interact with the risk zone map
   - Use the prediction panel
   - Check trends and insights

## 📊 What to Expect

- **KPI Cards**: Overall failure rate, highest risk district, worst device, etc.
- **Risk Zone Map**: Interactive visualization of failure rates by state
- **Prediction Panel**: Input parameters and get failure probability predictions
- **Trends Chart**: Monthly, age group, and device performance trends
- **Feature Importance**: Understanding which factors contribute most to failures
- **Insights Sidebar**: Auto-generated actionable recommendations

## 🔧 Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change port in `uvicorn main:app --reload --port 8001`
- **Module not found**: Ensure virtual environment is activated and dependencies installed
- **Data file not found**: Run `python generate_data.py` first

### Frontend Issues

- **Port 3000 already in use**: Next.js will automatically use 3001
- **API connection errors**: Ensure backend is running on port 8000
- **Build errors**: Delete `node_modules` and `.next` folder, then `npm install` again

### CORS Issues

If you see CORS errors, ensure the backend `main.py` has the correct frontend URL in CORS middleware.

## 📝 Notes

- First run may take a few seconds to generate sample data
- The dashboard works with or without trained ML models (uses historical data if models not available)
- Sample data includes realistic patterns (seasonal variations, age group differences, etc.)

## 🎯 Demo Tips

1. **Start with KPIs**: Show the overall failure rate and key metrics
2. **Explore Risk Zones**: Filter by biometric type and age group
3. **Make Predictions**: Try different combinations (elderly + fingerprint + winter months)
4. **Check Insights**: Show how the system generates actionable recommendations
5. **View Trends**: Demonstrate seasonal patterns and demographic differences

Happy demoing! 🚀

