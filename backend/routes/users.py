from flask import Blueprint, request, jsonify
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
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, username, email
            """,
            (username, email, hashed_password)
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
            SELECT id, username, email, password
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
            "username": user["username"]
        }), 200
    
    except Exception as e:
        conn.rollback()
        print("LOGIN ERROR:", e)
        return jsonify({
            "sucess": False,
            "error": "Server error"
        }), 500
    
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
