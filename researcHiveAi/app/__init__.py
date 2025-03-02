from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for React frontend

    load_dotenv()
    app.config.from_object('app.config.Config')  # Ensure this points to the correct config class

    # Register blueprints
    from app.routes.graph import graph_bp
    from app.routes.chat_routes import chat_routes

    app.register_blueprint(graph_bp, url_prefix="/api/graph")
    app.register_blueprint(chat_routes, url_prefix="/api/chat")

    return app
