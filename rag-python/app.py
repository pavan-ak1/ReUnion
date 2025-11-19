# app.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import subprocess
from dotenv import load_dotenv
from database import fetch_all_mentors
from search import MentorSearch

load_dotenv()
app = FastAPI(title="ReUnion RAG Service")

class StudentProfile(BaseModel):
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    preferred_domain: Optional[str] = None
    country: Optional[str] = None
    career_goal: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    top_k: Optional[int] = 5

def compose_query(profile: StudentProfile) -> str:
    parts = []
    if profile.degree:
        parts.append(f"Degree: {profile.degree}")
    if profile.department:
        parts.append(f"Department: {profile.department}")
    if profile.skills:
        parts.append("Skills: " + ", ".join(profile.skills))
    if profile.interests:
        parts.append("Interests: " + ", ".join(profile.interests))
    if profile.preferred_domain:
        parts.append(f"Preferred domain: {profile.preferred_domain}")
    if profile.career_goal:
        parts.append(f"Career goal: {profile.career_goal}")
    if profile.country:
        parts.append(f"Country preference: {profile.country}")
    return " || ".join(parts)

@app.get("/")
def root():
    return {"message": "ReUnion RAG Service Running!"}

@app.get("/mentors")
def mentors_list():
    try:
        mentors = fetch_all_mentors(only_available=False)
        return {"count": len(mentors), "mentors": mentors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/build-index")
def build_index():
    import sys
    try:
        result = subprocess.run(
            [sys.executable, "build_index.py"],
            capture_output=True,
            text=True,
            check=True
        )
        return {"status": "ok", "stdout": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "stderr": e.stderr}

@app.post("/recommend")
def recommend(profile: StudentProfile):
    try:
        query = compose_query(profile)
        ms = MentorSearch()
        results = ms.recommend(query_text=query, top_k=profile.top_k or 5,
                               filter_country=profile.country, filter_department=profile.department)
        return {"query": query, "results": results}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
