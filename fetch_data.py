import requests
import json

API_KEY = "AIzaSyDnSEUKCzaWuh350K2UG3BpWvUblZ_vrTs"
PROJECT_ID = "nudge-fellowship"

url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/fellowshipApplications?key={API_KEY}&pageSize=1000"

response = requests.get(url)
data = response.json()

if 'documents' not in data:
    print("No documents found or error:", data)
    exit(1)

applications = []
for doc in data.get('documents', []):
    fields = doc.get('fields', {})
    
    app_data = {}
    for k, v in fields.items():
        if 'stringValue' in v:
            app_data[k] = v['stringValue']
        elif 'integerValue' in v:
            app_data[k] = v['integerValue']
        elif 'timestampValue' in v:
            app_data[k] = v['timestampValue']
        elif 'booleanValue' in v:
            app_data[k] = v['booleanValue']
        else:
            app_data[k] = str(v)
            
    applications.append(app_data)

with open('applications.json', 'w') as f:
    json.dump(applications, f, indent=2)

print(f"Saved {len(applications)} applications to applications.json")
