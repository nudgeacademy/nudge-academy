import urllib.request
import json
import ssl

url = "https://formsubmit.co/ajax/info@nudge.academy"
headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0'
}
data = {
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Response:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
