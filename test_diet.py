import urllib.request
import json

data = json.dumps({
    "report_analysis": "Patient has slightly elevated cholesterol.",
    "patient_name": "Test User",
    "age": 30,
    "gender": "Male"
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8000/api/generate-diet", data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response JSON:", json.loads(response.read().decode()))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Error output:", e.read().decode())
