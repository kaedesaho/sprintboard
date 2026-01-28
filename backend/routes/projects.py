from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from db import get_db


projects_bp = Blueprint('projects_bp', __name__)

@projects_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_projects(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT
            p.id AS project_id,
            p.title,
            p.description,
            p.last_updated,
            pm.role
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = %s
        ORDER BY p.last_updated DESC;
        """
    
    cur.execute(query, (user_id,))
    projects = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(projects)


@projects_bp.route("", methods=["POST"])
def create_project():
    data = request.get_json()
    title = data["title"]
    description = data.get("description", "")
    members = data.get("members", [])

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert project
        cur.execute(
            """
            INSERT INTO projects (title, description, last_updated) 
            VALUES (%s, %s, NOW()) 
            RETURNING id, title, description, last_updated
            """,
            (title, description)
        )

        project_id = cur.fetchone()["id"]

        for m in members:
            if "user_id" not in m or "role" not in m:
                continue  
            cur.execute(
                """
                INSERT INTO project_members (project_id, user_id, role) 
                VALUES (%s, %s, %s)
                """,
                (project_id, m["user_id"], m["role"])
            )

        conn.commit()

        return jsonify({"success": True, "project_id": project_id})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project_overview(project_id):
    user_id = request.args.get("user_id")

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        """
        SELECT
            p.id,
            p.title,
            p.description,
            p.last_updated,
            pm.role
        FROM projects p
        JOIN project_members pm ON pm.project_id = p.id
        WHERE p.id = %s AND pm.user_id = %s
        """, (project_id, user_id))

    project = cur.fetchone()

    cur.close()
    conn.close()

    if not project:
        return jsonify({"error": "Not found"}), 404

    return jsonify(project)

@projects_bp.route("/<int:project_id>/members", methods=["GET"])
def get_project_members(project_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT u.id AS user_id, u.username, pm.role
        FROM project_members pm
        JOIN users u ON u.id = pm.user_id
        WHERE pm.project_id = %s
    """, (project_id,))

    members = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(members)

@projects_bp.route("/<int:project_id>", methods=["PATCH"])
def edit_project(project_id):
    data = request.get_json()
    title = data["title"]
    description = data.get("description", "")
    members = data.get("members", [])

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert project
        cur.execute(
            """
            UPDATE projects 
            SET title = %s, description = %s, last_updated = NOW() 
            WHERE id = %s
            """,
            (title, description, project_id)
        )

        cur.execute("DELETE FROM project_members WHERE project_id = %s", (project_id,))

        for m in members:
            if "user_id" not in m or "role" not in m:
                continue  
            cur.execute(
                """
                INSERT INTO project_members (project_id, user_id, role) 
                VALUES (%s, %s, %s)
                """,
                (project_id, m["user_id"], m["role"])
            )

        conn.commit()

        return jsonify({"success": True, "project_id": project_id})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Check if project exists
        cur.execute("SELECT * FROM projects WHERE id = %s;", (project_id,))
        project = cur.fetchone()
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        # Delete the project
        cur.execute("DELETE FROM projects WHERE id = %s;", (project_id,))
        conn.commit()

        return jsonify({'message': f'Project "{project["title"]}" deleted successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cur.close()