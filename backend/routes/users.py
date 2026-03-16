import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.errors import UniqueViolation
from psycopg2.extras import RealDictCursor
from db import get_db

users_bp = Blueprint("users_bp", __name__)

@users_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "").strip() or None
    last_name = data.get("last_name", "").strip() or None

    if not username or not email or not password:
        return jsonify({
            'success': False,
            'error': 'All fields are required'
            }), 400

    hashed_password = generate_password_hash(password)

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            """
            INSERT INTO users (username, email, password, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, username, email
            """,
            (username, email, hashed_password, first_name, last_name)
        )

        user = cur.fetchone()
        conn.commit()

        return jsonify({
            "success": True,
        }), 201

    except UniqueViolation:
        conn.rollback()
        return jsonify({
            "success": False,
            "error": "Username or email already exists"
        }), 409

    except Exception as e:
        conn.rollback()
        print("SIGNUP ERROR:", e)
        return jsonify({
            "success": False,
            "error": "Server error"
        }), 500

    finally:
        cur.close()
        conn.close()


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({
            "success": False,
            "error": "All fields are required"
        }), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            """
            SELECT id, username, email, password, photo_url
            FROM users
            WHERE username = %s OR email = %s
            """,
            (identifier, identifier)
        )
        user = cur.fetchone()

        if not user or not check_password_hash(user["password"], password):
            return jsonify({
                "success": False,
                "error": "Username/email or password is incorrect"
            }), 401

        return jsonify({
            "success": True,
            "id": user["id"],
            "username": user["username"],
            "photo_url": user["photo_url"]
        }), 200

    except Exception as e:
        conn.rollback()
        print("LOGIN ERROR:", e)
        return jsonify({
            "success": False,
            "error": "Server error"
        }), 500

    finally:
        cur.close()
        conn.close()

@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "SELECT id, username, email, first_name, last_name, photo_url FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        return jsonify(user), 200
    finally:
        cur.close()
        conn.close()


@users_bp.route("/<int:user_id>", methods=["PATCH"])
def update_user(user_id):
    data = request.json
    allowed = ["first_name", "last_name", "username", "email"]
    updates = {k: (v.strip() or None) for k, v in data.items() if k in allowed and isinstance(v, str)}
    if not updates:
        return jsonify({"success": False, "error": "No valid fields to update"}), 400

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [user_id]

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"UPDATE users SET {set_clause} WHERE id = %s RETURNING id, username, email, first_name, last_name",
            values
        )
        user = cur.fetchone()
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        conn.commit()
        return jsonify({"success": True, "user": user}), 200
    except UniqueViolation:
        conn.rollback()
        return jsonify({"success": False, "error": "Username or email already taken"}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@users_bp.route("/<int:user_id>/password", methods=["PATCH"])
def change_password(user_id):
    data = request.json
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"success": False, "error": "Both fields are required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user or not check_password_hash(user["password"], current_password):
            return jsonify({"success": False, "error": "Current password is incorrect"}), 401

        cur.execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (generate_password_hash(new_password), user_id)
        )
        conn.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@users_bp.route("/<int:user_id>/photo", methods=["POST"])
def upload_photo(user_id):
    if 'photo' not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'jpg'
    if ext not in ('jpg', 'jpeg', 'png', 'gif', 'webp'):
        return jsonify({"success": False, "error": "Invalid file type"}), 400

    avatars_dir = os.path.join(current_app.root_path, 'static', 'avatars')
    os.makedirs(avatars_dir, exist_ok=True)
    filename = f"{user_id}.{ext}"
    file.save(os.path.join(avatars_dir, filename))

    photo_url = f"http://127.0.0.1:5000/static/avatars/{filename}"

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("UPDATE users SET photo_url = %s WHERE id = %s", (photo_url, user_id))
        conn.commit()
        return jsonify({"success": True, "photo_url": photo_url}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@users_bp.route("/search")
def search_users():
    query = request.args.get("query", "")
    cur = get_db().cursor()
    cur.execute(
        "SELECT id, username FROM users WHERE username ILIKE %s LIMIT 10",
        (f"%{query}%",)
    )
    users = [{"id": row[0], "username": row[1]} for row in cur.fetchall()]
    return jsonify(users)
