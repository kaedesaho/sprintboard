from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.users import users_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)