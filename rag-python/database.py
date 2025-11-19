# database.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "reunion")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASS = os.getenv("PG_PASS", "")

def get_conn():
    conn = psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASS
    )
    return conn

def fetch_all_mentors(only_available=True):
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
    SELECT
        m.alumni_id AS mentor_id,
        u.name AS name,
        u.email AS email,
        a.graduation_year,
        a.degree,
        a.department,
        a.current_position,
        a.company,
        a.location,
        m.expertise,
        m.availability,
        m.max_mentees,
        m.created_at
    FROM mentors m
    JOIN alumni a ON a.user_id = m.alumni_id
    JOIN users u ON u.user_id = m.alumni_id
    """
    if only_available:
        query += " WHERE m.availability = TRUE"

    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
