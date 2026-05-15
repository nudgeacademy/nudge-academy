import json

with open('applications.json') as f:
    apps = json.load(f)

approved = [a for a in apps if a.get('status') == 'approved']

def score_app(a):
    score = 0
    rem = a.get('reviewerRemarks', '').lower()
    
    negatives = ['no career bodham', 'bodham', 'areela', 'onnulla', 'busy', 'no answer', 'switch off', 'switched off', 'no specific academic insights', 'no idea', 'prathyekich', 'onnum areela', 'thenga kutti']
    for n in negatives:
        if n in rem:
            score -= 100  # Penalize heavy red flags
            
    # Positive reviewer remarks still matter a bit
    positives = ['strong', 'aspirant', 'convert', 'focusing', 'iit', 'srcc', 'jamia', 'jmi', 'cuet']
    for p in positives:
        if p in rem:
            score += 20
            
    essay = a.get('essay1', '')
    
    # 1 point per word (gives good weight to long, descriptive essays)
    words = essay.split()
    score += len(words) * 5  # 5 points per word

    # High weight to key terms
    qualities = ['delhi', 'community', 'grassroots', 'university', 'research', 'career', 'explore', 'leadership', 'society', 'vision', 'opportunity', 'impact', 'learn', 'grow', 'experience']
    essay_lower = essay.lower()
    for q in qualities:
        count = essay_lower.count(q)
        score += count * 50  # 50 points per mention of a strong keyword
            
    return score

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

print("Top students by stream (SOP Weighted):")
for stream, students in streams.items():
    print(f"\n--- {stream} ---")
    students.sort(key=score_app, reverse=True)
    for i, a in enumerate(students[:3]):
        print(f"Rank {i+1}: {a.get('name')} | City: {a.get('city')} | Score: {score_app(a):.2f}")
        print(f"   Reviewer: {a.get('reviewerRemarks')}")
        print(f"   SOP length: {len(a.get('essay1', '').split())} words")
        print(f"   SOP Preview: {a.get('essay1', '')[:100]}...")
