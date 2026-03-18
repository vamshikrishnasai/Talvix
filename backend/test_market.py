import sys
import os

# Add the backend directory to sys.path
sys.path.append(r"d:\mini\backend")

from app.services.market_service import market_service

print("--- Testing Market Service ---")
insights = market_service.get_market_insights()
if "error" in insights:
    print("Error:", insights["error"])
else:
    print("Total Jobs:", insights["summary"]["total_jobs"])
    print("Avg Salary:", insights["summary"]["avg_salary"])
    print("Top Skills:", insights["top_skills"][:3])
    print("Prediction Trend:", insights["prediction_trend"][:2])

filters = market_service.get_market_filters()
print("\nFilters Found:", len(filters.get("roles", [])), "roles,", len(filters.get("locations", [])), "locations")
