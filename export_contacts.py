import requests
import json
import os

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
    
    status = fields.get('status', {}).get('stringValue', '')
    name = fields.get('name', {}).get('stringValue', 'Unknown')
    phone = fields.get('phone', {}).get('stringValue', '')
    submitted_at_str = fields.get('submittedAt', {}).get('timestampValue', '')
    
    applications.append({
        'name': name,
        'phone': phone,
        'status': status,
        'submittedAt': submitted_at_str
    })

# Sort chronologically to get the correct serial numbers, matching the dashboard
applications.sort(key=lambda x: x['submittedAt'])

vcf_lines = []
count = 0
for idx, app in enumerate(applications):
    serial_no = idx + 1
    
    # Exclude 'deleted' (trashed) items if you only want active contacts
    if app['status'] == 'deleted':
        continue
        
    # Naming format: <name> nudge f <their serial no>
    contact_name = f"{app['name']} nudge f {serial_no}"
    phone = app['phone']
    
    if phone:
        vcf_lines.append("BEGIN:VCARD")
        vcf_lines.append("VERSION:3.0")
        vcf_lines.append(f"N:;{contact_name};;;")
        vcf_lines.append(f"FN:{contact_name}")
        vcf_lines.append(f"TEL;TYPE=CELL:{phone}")
        vcf_lines.append("END:VCARD")
        count += 1

# Output file path on Desktop
output_path = "/Users/asifali/Desktop/Nudge_Fellowship_Contacts.vcf"
with open(output_path, "w") as f:
    f.write("\n".join(vcf_lines))

print(f"Generated {count} contacts and saved to: {output_path}")
