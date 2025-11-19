# utils.py
import os
import json
import datetime
from dotenv import load_dotenv

load_dotenv()
META_PATH = os.getenv("META_PATH", "mentor_meta.json")

def default_serializer(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    return str(obj)

def save_meta(meta: dict):
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2, default=default_serializer)

def load_meta():
    if not os.path.exists(META_PATH):
        return {}
    with open(META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
