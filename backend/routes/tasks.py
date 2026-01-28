from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from db import get_db

tasks_bp = Blueprint('taskss_bp', __name__)

# Fetch all tasks in the project (for dependencies)
@tasks_bp.route('', methods=['GET'])
def get_tasks():
    project_id = request.args.get('project_id')

    if not project_id:
        return jsonify({"error": "project_id is required"}), 400

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, title
            FROM tasks
            WHERE project_id = %s
            ORDER BY created_at DESC;
        """, (project_id,))
        tasks = cur.fetchall()
    
    return jsonify(tasks), 200


# Fetch all categories in the project (for category selection)
@tasks_bp.route('/categories', methods=['GET'])
def get_categories():
    project_id = request.args.get('project_id')

    if not project_id:
        return jsonify({"error": "project_id is required"}), 400

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, name
            FROM categories
            WHERE project_id = %s
            ORDER BY name;
        """, (project_id,))
        categories = cur.fetchall()
    
    return jsonify(categories), 200


# Fetch all project members (for assignees)
@tasks_bp.route('/users', methods=['GET'])
def get_users():
    project_id = request.args.get('project_id')

    if not project_id:
        return jsonify({"error": "project_id is required"}), 400

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT u.id, u.username
            FROM users u
            JOIN project_members pm ON u.id = pm.user_id
            WHERE pm.project_id = %s
            ORDER BY u.username;
        """, (project_id,))
        users = cur.fetchall()
    
    return jsonify(users), 200