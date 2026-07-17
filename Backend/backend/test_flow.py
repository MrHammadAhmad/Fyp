import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_login_and_fetch():
    print("Logging in...")
    # Using the admin user for testing, or any known user
    login_data = {
        "email": "hammad@saloon.com",
        "password": "QU*23WEIR6#$TYOP1%^&7890!@45()"
    }
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
        
    token = res.json()["access_token"]
    print("Login successful. Token acquired.")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nFetching profile...")
    prof = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    print(f"Profile status: {prof.status_code}")
    if prof.status_code != 200:
        print(f"Error: {prof.text}")
        
    print("\nFetching appointments...")
    appts = requests.get(f"{BASE_URL}/api/appointments/", headers=headers)
    print(f"Appointments status: {appts.status_code}")
    if appts.status_code != 200:
        print(f"Error: {appts.text}")
        
    print("\nFetching owner reports...")
    reports = requests.get(f"{BASE_URL}/api/owner/reports/performance", headers=headers)
    print(f"Reports status: {reports.status_code}")
    if reports.status_code != 200:
        print(f"Error: {reports.text}")

if __name__ == "__main__":
    test_login_and_fetch()
