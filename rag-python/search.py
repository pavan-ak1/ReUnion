# search.py
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from dotenv import load_dotenv
from utils import load_meta

load_dotenv()

INDEX_PATH = os.getenv("INDEX_PATH", "mentor_index.faiss")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ---------------------------------------
# CITY → COUNTRY MAPPING (CUSTOMIZABLE)
# ---------------------------------------
CITY_TO_COUNTRY = {
    "bangalore": "india",
    "bengaluru": "india",
    "pune": "india",
    "chennai": "india",
    "mumbai": "india",
    "delhi": "india",
    "hyderabad": "india"
}


class MentorSearch:
    def __init__(self):
        if not os.path.exists(INDEX_PATH):
            raise FileNotFoundError("FAISS index not found. Run build_index.py first.")

        self.model = SentenceTransformer(MODEL_NAME)
        self.index = faiss.read_index(INDEX_PATH)
        self.meta = load_meta()

    # ---------------------------------------
    # Main Recommendation Function
    # ---------------------------------------
    def recommend(
        self, 
        query_text: str, 
        top_k: int = 5, 
        filter_country: str = None, 
        filter_department: str = None
    ):
        # Encode query → numpy → float32 → normalized
        q_vec = self.model.encode([query_text], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(q_vec)

        # Retrieve many results → we filter later
        D, I = self.index.search(q_vec, top_k * 5)

        results = []

        for dist, idx in zip(D[0], I[0]):
            idx = int(idx)
            dist = float(dist)

            if idx < 0:
                continue

            entry = self.meta.get(str(idx))
            if not entry:
                continue

            # -------------------------------
            # Country Filtering (Smart Logic)
            # -------------------------------
            if filter_country:
                mentor_city = (entry.get("location") or "").lower()
                mentor_country = CITY_TO_COUNTRY.get(mentor_city, mentor_city)

                if mentor_country != filter_country.lower():
                    continue

            # -------------------------------
            # Department Filtering (optional)
            # -------------------------------
            if filter_department:
                mentor_dept = (entry.get("department") or "").lower()
                if filter_department.lower() not in mentor_dept:
                    continue

            # Cosine similarity score (0 → 1)
            score = float(dist)

            # -------------------------------
            # Prepare clean JSON-safe result
            # -------------------------------
            results.append({
                "mentor_label": idx,
                "mentor_id": int(entry.get("mentor_id")),
                "name": entry.get("name"),
                "email": entry.get("email"),
                "department": entry.get("department"),
                "company": entry.get("company"),
                "position": entry.get("current_position"),
                "location": entry.get("location"),
                "expertise": entry.get("expertise"),
                "availability": entry.get("availability"),
                "score": score
            })

            if len(results) >= top_k:
                break

        return results
