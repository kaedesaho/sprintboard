from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from db import get_db

notes_bp = Blueprint('notes_bp', __name__)

NOTE_SELECT = """
    SELECT
        mn.id, mn.project_id, mn.title, mn.note_type, mn.sprint_num, mn.creator_id,
        mn.leader_id, leader.username AS leader_name,
        mn.note_taker_id, taker.username AS note_taker_name,
        mn.planned_time, mn.place,
        mn.content, mn.is_shared,
        mn.created_at, mn.updated_at
    FROM notes mn
    LEFT JOIN users leader ON leader.id = mn.leader_id
    LEFT JOIN users taker  ON taker.id  = mn.note_taker_id
"""


@notes_bp.route('/<int:project_id>', methods=['GET'])
def list_notes(project_id):
    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            NOTE_SELECT + "WHERE mn.project_id = %s ORDER BY mn.created_at DESC;",
            (project_id,)
        )
        notes = cur.fetchall()
    return jsonify(notes), 200


@notes_bp.route('/<int:project_id>/<int:note_id>', methods=['GET'])
def get_note(project_id, note_id):
    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            NOTE_SELECT + "WHERE mn.project_id = %s AND mn.id = %s;",
            (project_id, note_id)
        )
        note = cur.fetchone()
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note), 200


@notes_bp.route('/<int:project_id>', methods=['POST'])
def create_note(project_id):
    data = request.get_json()
    required = ['creator_id', 'title', 'note_type', 'content']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            INSERT INTO notes
                (project_id, title, note_type, sprint_num, creator_id,
                 leader_id, note_taker_id, planned_time, place, content, is_shared)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            project_id,
            data['title'],
            data['note_type'],
            data.get('sprint_num'),
            data['creator_id'],
            data.get('leader_id'),
            data.get('note_taker_id'),
            data.get('planned_time'),
            data.get('place'),
            data['content'],
            data.get('is_shared', False),
        ))
        note_id = cur.fetchone()['id']
        conn.commit()

        cur.execute(
            NOTE_SELECT + "WHERE mn.project_id = %s AND mn.id = %s;",
            (project_id, note_id)
        )
        note = cur.fetchone()
    return jsonify(note), 201


@notes_bp.route('/<int:project_id>/<int:note_id>', methods=['PATCH'])
def update_note(project_id, note_id):
    data = request.get_json()
    allowed = ['title', 'note_type', 'sprint_num', 'leader_id', 'note_taker_id',
               'planned_time', 'place', 'content', 'is_shared']
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [project_id, note_id]

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"UPDATE notes SET {set_clause} WHERE project_id = %s AND id = %s;",
            values
        )
        if cur.rowcount == 0:
            return jsonify({"error": "Note not found"}), 404
        conn.commit()

        cur.execute(
            NOTE_SELECT + "WHERE mn.project_id = %s AND mn.id = %s;",
            (project_id, note_id)
        )
        note = cur.fetchone()
    return jsonify(note), 200


@notes_bp.route('/<int:project_id>/<int:note_id>', methods=['DELETE'])
def delete_note(project_id, note_id):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM notes WHERE project_id = %s AND id = %s;",
            (project_id, note_id)
        )
        if cur.rowcount == 0:
            return jsonify({"error": "Note not found"}), 404
        conn.commit()
    return jsonify({"message": "Note deleted"}), 200
