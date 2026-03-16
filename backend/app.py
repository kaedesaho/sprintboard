import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.users import users_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.notes import notes_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Ensure avatar upload directory exists
    avatars_dir = os.path.join(app.root_path, 'static', 'avatars')
    os.makedirs(avatars_dir, exist_ok=True)

    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(notes_bp, url_prefix="/api/notes")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)