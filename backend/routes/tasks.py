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

# Create a new category
@tasks_bp.route("/categories/create", methods=["POST"])
def create_category():
    data = request.get_json()
    name = data.get("name")
    project_id = data.get("project_id")

    # Validate required fields
    if not name or not project_id:
        return jsonify({"error": "Missing required field"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert new category
        cur.execute(
            """
            INSERT INTO categories (name, project_id)
            VALUES (%s, %s)
            RETURNING *;
            """,
            (name, project_id)
        )
        new_category = cur.fetchone()
        conn.commit()
        return jsonify(new_category), 201

    except Exception as e:
        conn.rollback()
        print("Error creating category:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()
      

@tasks_bp.route("", methods=["POST"])
def create_task():
    data = request.get_json()

    # Validate required fields
    if "title" not in data or "project_id" not in data:
            return jsonify({"error": "Missing required field"}), 400

    title = data["title"]
    description = data.get("description")
    status = data.get("status", "backlog")
    priority = data.get("priority")
    sprint = data.get("sprint")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    time_estimation = data.get("time_estimation")
    project_id = data["project_id"]
    assignees = data.get("assignees", []) 
    dependencies = data.get("dependency_ids", []) 
    categories = data.get("category_ids", []) 

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert into tasks table
        cur.execute(
            """
            INSERT INTO tasks 
            (title, description, status, priority, sprint, start_date, end_date, time_estimation, project_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (title, description, status, priority, sprint, start_date, end_date, time_estimation, project_id)
        )
        task = cur.fetchone()
        task_id = task["id"]

        # Insert into task_assignees table
        if assignees:
            for user_id in assignees:
                cur.execute(
                    """
                    INSERT INTO task_assignees 
                    (task_id, user_id) 
                    VALUES (%s, %s) ON CONFLICT DO NOTHING;
                    """,
                    (task_id, user_id)
                )

        # Insert into task_categories tabel
        if categories:
            for category_id in categories:
                cur.execute(
                    """
                    INSERT INTO task_categories 
                    (task_id, category_id) 
                    VALUES (%s, %s) ON CONFLICT DO NOTHING;
                    """,
                    (task_id, category_id)
                )

        # Insert into task_dependencies tabel
        if dependencies:
            for depends_on_task_id in dependencies:
                cur.execute(
                    """
                    INSERT INTO task_dependencies 
                    (task_id, depends_on_task_id) 
                    VALUES (%s, %s) ON CONFLICT DO NOTHING;
                    """,
                    (task_id, depends_on_task_id)
                )

        conn.commit()
        return jsonify(task), 201

    except Exception as e:
        conn.rollback()
        print("Error creating task:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()


@tasks_bp.route("/<int:project_id>/tasks", methods=["GET"])
def get_project_tasks(project_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT t.id, t.title, t.status, t.priority,
               t.sprint, t.start_date, t.end_date, t.time_estimation,
               t.created_at, t.updated_at,
               COALESCE(
                    ARRAY_REMOVE(ARRAY_AGG(DISTINCT u.username), NULL),
                    '{}'
                ) AS assignees,
                COALESCE(
                    ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.name), NULL),
                    '{}'
                ) AS category_ids
        FROM tasks t
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u ON ta.user_id = u.id
        LEFT JOIN task_categories tc ON t.id = tc.task_id
        LEFT JOIN categories c ON tc.category_id = c.id
        WHERE t.project_id = %s
        GROUP BY t.id
        ORDER BY t.created_at ASC;
    """

    try:
        cur.execute(query, (project_id,))
        tasks = cur.fetchall()
        return jsonify(tasks), 200
    
    except Exception as e:
        print("Error fetching tasks:", e)
        return jsonify({"error": "Failed to fetch tasks"}), 500
    
    finally:
        cur.close()
        conn.close()


# Fetch specific task
@tasks_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                t.id, t.title, t.description, t.status, t.priority, 
                t.sprint, t.start_date, t.end_date, t.time_estimation, 
                t.created_at, t.updated_at,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT td.depends_on_task_id), NULL) AS dependency_ids,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT tc.category_id), NULL) AS category_ids,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT ta.user_id), NULL) AS assignees
            FROM tasks t
            LEFT JOIN task_dependencies td ON t.id = td.task_id
            LEFT JOIN task_categories tc ON t.id = tc.task_id
            LEFT JOIN task_assignees ta ON t.id = ta.task_id
            WHERE t.id = %s
            GROUP BY t.id
        """, (task_id,))
        
        task = cur.fetchone()
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        return jsonify(task)
    
    except Exception as e:
        print("Error fetching task:", e)
        return jsonify({"error": "Internal server error"}), 500
    

@tasks_bp.route("/<int:task_id>", methods=["PATCH"])
def edit_task(task_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        allowed_fields = [
            "title",
            "description",
            "status",
            "priority",
            "sprint",
            "start_date",
            "end_date",
            "time_estimation",
        ]

        set_clauses = []
        values = []

        for field in allowed_fields:
            if field in data:
                set_clauses.append(f"{field} = %s")
                values.append(data[field])

        if not set_clauses:
            return jsonify({"error": "No valid fields to update"}), 400

        values.append(task_id)

        cur.execute(
            f"""
            UPDATE tasks
            SET {", ".join(set_clauses)}
            WHERE id = %s
            RETURNING *;
            """
            ,
            values
        )

        task = cur.fetchone()
        
        if not task:
            return jsonify({"error": "Task not found"}), 404

        if "assignees" in data:
            cur.execute(
                "DELETE FROM task_assignees WHERE task_id = %s;",
                (task_id,)
            )

            for user_id in data.get("assignees", []):
                cur.execute(
                    """
                    INSERT INTO task_assignees (task_id, user_id)
                    VALUES (%s, %s);
                    """,
                    (task_id, user_id)
                )

        if "category_ids" in data:
            cur.execute(
                "DELETE FROM task_categories WHERE task_id = %s;",
                (task_id,)
            )

            for category_id in data.get("category_ids", []):
                cur.execute(
                    """
                    INSERT INTO task_categories (task_id, category_id)
                    VALUES (%s, %s);
                    """,
                    (task_id, category_id)
                )

        if "dependency_ids" in data:
            cur.execute(
                "DELETE FROM task_dependencies WHERE task_id = %s;",
                (task_id,)
            )

            for depends_on_task_id in data.get("dependency_ids", []):
                cur.execute(
                    """
                    INSERT INTO task_dependencies (task_id, depends_on_task_id)
                    VALUES (%s, %s);
                    """,
                    (task_id, depends_on_task_id)
                )

        conn.commit()
        return jsonify(task), 200

    except Exception as e:
        conn.rollback()
        print("Error editing task:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id FROM tasks WHERE id = %s;",
            (task_id,)
        )
        if not cur.fetchone():
            return jsonify({"error": "Task not found"}), 404

        cur.execute(
            "DELETE FROM task_dependencies WHERE task_id = %s;",
            (task_id,)
        )

        cur.execute(
            "DELETE FROM task_assignees WHERE task_id = %s;",
            (task_id,)
        )

        cur.execute(
            "DELETE FROM task_categories WHERE task_id = %s;",
            (task_id,)
        )

        cur.execute(
            "DELETE FROM tasks WHERE id = %s;",
            (task_id,)
        )

        conn.commit()
        return "", 200

    except Exception as e:
        conn.rollback()
        print("Error deleting task:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()


@tasks_bp.route("/<int:task_id>/move", methods=["PATCH"])
def move_task(task_id):
    data = request.json
    new_status = data.get("status")  
    new_index = data.get("index")    # optional: position in column

    if not new_status:
        return jsonify({"error": "Missing new status"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE tasks SET status = %s WHERE id = %s",
            (new_status, task_id)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify({"success": True, "task_id": task_id, "new_status": new_status})
