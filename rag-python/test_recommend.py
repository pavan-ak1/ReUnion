from search import MentorSearch

ms = MentorSearch()
query = """
Degree: BTech || Department: CSE || Skills: python, ml || Interests: ai, research
Career goal: Machine Learning Engineer || Preferred domain: AI || Country preference: India
"""

results = ms.recommend(query, top_k=5)
print(results)
