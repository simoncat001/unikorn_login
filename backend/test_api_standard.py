import requests

url = "http://127.0.0.1:8000/api/standards/d39fa678-bf8c-45c0-af36-11f757f32815"
try:
    print(f"Requesting {url}...")
    resp = requests.get(url)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
