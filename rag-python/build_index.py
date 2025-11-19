# build_index.py
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from dotenv import load_dotenv
from database import fetch_all_mentors
from utils import save_meta

load_dotenv()
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
INDEX_PATH = os.getenv("INDEX_PATH", "mentor_index.faiss")

def make_combined_text(rec):
    # Build the textual blob used for embedding
    parts = []
    if rec.get("name"):
        parts.append(f"Name: {rec['name']}")
    if rec.get("expertise"):
        parts.append(f"Expertise: {rec['expertise']}")
    if rec.get("department"):
        parts.append(f"Department: {rec['department']}")
    if rec.get("degree"):
        parts.append(f"Degree: {rec['degree']}")
    if rec.get("current_position"):
        parts.append(f"Current position: {rec['current_position']}")
    if rec.get("company"):
        parts.append(f"Company: {rec['company']}")
    if rec.get("location"):
        parts.append(f"Location: {rec['location']}")
    # join with separators so model sees structure
    return " || ".join([p for p in parts if p]) 

def main():
    print("Loading model:", MODEL_NAME)
    model = SentenceTransformer(MODEL_NAME)

    print("Fetching mentors from Postgres...")
    mentors = fetch_all_mentors(only_available=True)
    if not mentors:
        print("No mentors found. Exiting.")
        return

    texts = [make_combined_text(m) for m in mentors]
    print(f"Encoding {len(texts)} mentor texts...")
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    if embeddings.dtype != "float32":
        embeddings = embeddings.astype("float32")

    dim = embeddings.shape[1]
    print("Embedding dimension:", dim)

    # Using inner product index (IndexFlatIP) with normalized vectors gives cosine similarity.
    # We'll normalize vectors to unit length and use IndexFlatIP for retrieval.
    faiss.normalize_L2(embeddings)  # in-place normalization

    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    faiss.write_index(index, INDEX_PATH)
    print("Saved FAISS index to", INDEX_PATH)

    # Save metadata mapping: label idx -> mentor record
    meta = {str(i): mentors[i] for i in range(len(mentors))}
    save_meta(meta)
    print("Saved metadata to mentor_meta.json")

if __name__ == "__main__":
    main()
