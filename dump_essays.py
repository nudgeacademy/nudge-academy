import json

with open('applications.json') as f:
    apps = json.load(f)

approved = [a for a in apps if a.get('status') == 'approved']

from collections import defaultdict
streams = defaultdict(list)

for a in approved:
    stream = a.get('stream', 'Unknown').strip()
    if 'art' in stream.lower() or 'humanit' in stream.lower():
        stream = 'Arts/Humanities'
    elif 'sci' in stream.lower():
        stream = 'Science'
    elif 'com' in stream.lower():
        stream = 'Commerce'
        
    streams[stream].append(a)

with open('essays_dump.txt', 'w') as f:
    for stream, students in streams.items():
        f.write(f"\n========================================\n")
        f.write(f"STREAM: {stream}\n")
        f.write(f"========================================\n\n")
        for a in students:
            essay = a.get('essay1', '').strip().replace('\n', ' ')
            rem = a.get('reviewerRemarks', '')
            if len(essay) > 50: # Skip very short useless ones
                f.write(f"Name: {a.get('name')} | City: {a.get('city')}\n")
                f.write(f"Reviewer: {rem}\n")
                f.write(f"Essay: {essay}\n")
                f.write(f"----------\n")
