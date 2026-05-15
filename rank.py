import json

with open('applications.json') as f:
    apps = json.load(f)

approved = [a for a in apps if a.get('status') == 'approved']

def score_app(a):
    score = 0
    rem = a.get('reviewerRemarks', '').lower()
    
    # Negative remarks
    negatives = ['no career bodham', 'bodham', 'areela', 'onnulla', 'busy', 'no answer', 'switch off', 'switched off', 'no specific academic insights', 'no idea', 'prathyekich', 'onnum areela', 'thenga kutti']
    for n in negatives:
        if n in rem:
            score -= 50
            
    # Positive remarks
    positives = ['strong', 'aspirant', 'convert', 'focusing', 'iit', 'srcc', 'jamia', 'jmi', 'cuet']
    for p in positives:
        if p in rem:
            score += 10
            
    # Essay score
    essay = a.get('essay1', '')
    score += len(essay) / 10  # 1 point per 10 characters
    
    # Quality words in essay
    qualities = ['delhi', 'community', 'grassroots', 'university', 'research', 'career', 'explore', 'leadership', 'society']
    essay_lower = essay.lower()
    for q in qualities:
        if q in essay_lower:
            score += 5
            
    return score

approved.sort(key=score_app, reverse=True)

# Print top 15
for i, a in enumerate(approved[:15]):
    print(f"Rank {i+1}:")
    print(f"Name: {a.get('name')}")
    print(f"City: {a.get('city')}, District: {a.get('district')}")
    print(f"Stream: {a.get('stream')}")
    print(f"Reviewer: {a.get('reviewerRemarks')}")
    print(f"Essay Preview: {a.get('essay1')[:150]}...")
    print(f"Score: {score_app(a):.2f}\n")
    print("-" * 40)
