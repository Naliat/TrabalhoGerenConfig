import os
from flask import Flask, render_template, jsonify, abort 
from dotenv import load_dotenv
from flask_cors import CORS
from app.database import init_db
from app.logger import setup_logger
import logging

base_dir = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PATH = os.path.join(base_dir, '..', '..', 'frontend')

def create_app():
    setup_logger()
    logging.debug("🚀 Iniciando aplicação Flask...")

    load_dotenv()
    logging.debug("📄 .env carregado!")

    print("\n=== DEBUG ENV CHECK ===")
    print("PWD:", os.getcwd())
    print(".env exists:", os.path.exists(".env"))
    print("MONGO_URI:", os.getenv("MONGO_URI"))
    print("ADMIN_KEY:", os.getenv("ADMIN_KEY"))
    print("========================\n")

    
    app = Flask(__name__,
                template_folder=FRONTEND_PATH, 
                static_folder=FRONTEND_PATH, 
                static_url_path='') 
    
  
    CORS(app, resources={r"/*": {"origins": "*"}}) 
    logging.debug("🌐 CORS habilitado")

    
    mongo_uri = os.getenv("MONGO_URI")
    logging.debug(f"🔍 MONGO_URI lida: {mongo_uri}")

    if not mongo_uri:
        logging.error("❌ ERRO: MONGO_URI não encontrada no .env")
        raise RuntimeError("MONGO_URI não encontrada no .env")

    app.config["MONGO_URI"] = mongo_uri

   
    logging.debug("🔌 Inicializando conexão com o banco...")
    init_db(app)

    
    @app.route('/')
    def serve_index():
        return render_template('index.html')
        
    @app.route('/<path:filename>')
    def serve_frontend_files(filename):
        try:
            return render_template(filename)
        except Exception:
            abort(404)


    logging.debug("📦 Registrando rotas da API...")
    from app.routes.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix="/api")

    logging.debug("✅ Aplicação Flask iniciada com sucesso!")
    return app