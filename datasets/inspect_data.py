import pandas as pd
import os

datasets_dir = r"d:\mini\datasets"
files = ["glassdoor_jobs.csv", "salary_data_cleaned.csv", "eda_data.csv"]

for file in files:
    path = os.path.join(datasets_dir, file)
    print(f"\n--- {file} ---")
    try:
        df = pd.read_csv(path)
        print("Columns:", df.columns.tolist())
        print("Shape:", df.shape)
        print("Data Types:\n", df.dtypes)
        print("First 2 rows:\n", df.head(2).to_string())
    except Exception as e:
        print(f"Error reading {file}: {e}")
