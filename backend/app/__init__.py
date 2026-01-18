import os
import logging
from flask import Flask, render_template, jsonify, abort, send_from_directory
from dotenv import load_dotenv
from flask_cors import CORS
from app.database import init_db
from app.logger import setup_logger

def find_frontend_path():
  
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path1 = os.path.abspath(os.path.join(base_dir, '..', '..', 'frontend'))
    path2 = os.path.join(os.getcwd(), 'frontend')
    
    if os.path.exists(os.path.join(path2, 'index.html')):
        return path2
    return path1

def create_app():
    setup_logger()
    logging.debug("🚀 Iniciando aplicação Flask...")

    load_dotenv()
    logging.debug("📄 .env carregado!")

    # Localiza o caminho correto do frontend
    FRONTEND_PATH = find_frontend_path()

    print("\n=== DEBUG ENV CHECK ===")
    print("PWD (Onde o comando roda):", os.getcwd())
    print("FRONTEND_PATH Detectado:", FRONTEND_PATH)
    print("INDEX.HTML EXISTE?", os.path.exists(os.path.join(FRONTEND_PATH, 'index.html')))
    print("MONGO_URI:", os.getenv("MONGO_URI")[:25] + "..." if os.getenv("MONGO_URI") else "Não encontrada")
    print("PORTA CONFIGURADA:", os.getenv("PORT", "5000"))
    print("========================\n")

    app = Flask(__name__,
                template_folder=FRONTEND_PATH, 
                static_folder=FRONTEND_PATH, 
                static_url_path='') 
    
    # CORS: Permitir tudo em desenvolvimento, ou usar CORS_ORIGINS do .env
    cors_origin = os.getenv("CORS_ORIGINS", "*")
    CORS(app, resources={r"/*": {"origins": cors_origin}}) 
    logging.debug(f"🌐 CORS habilitado para: {cors_origin}")

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        logging.error("❌ ERRO: MONGO_URI não encontrada no .env")
        raise RuntimeError("MONGO_URI não encontrada no .env")

    app.config["MONGO_URI"] = mongo_uri

    logging.debug("🔌 Inicializando conexão com o banco...")
    init_db(app)

    # --- ROTAS ---

    @app.route('/api/status')
    def status():
        """Rota de teste para ver se a API está viva"""
        return jsonify({
            "status": "online",
            "frontend_path": FRONTEND_PATH,
            "port": os.getenv("PORT", "5000")
        }), 200

    @app.route('/')
    def serve_index():
        try:
            return render_template('index.html')
        except Exception as e:
            logging.error(f"Erro ao servir index.html: {e}")
            return f"Erro: index.html não encontrado em {FRONTEND_PATH}", 404
        
    @app.route('/<path:filename>')
    def serve_frontend_files(filename):
        """Serve arquivos como login.html, CSS, JS, etc."""
        try:
            
            return render_template(filename)
        except Exception:
            
            return send_from_directory(FRONTEND_PATH, filename)

    logging.debug("📦 Registrando rotas da API...")
    from app.routes.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix="/api")

    logging.debug("✅ Aplicação Flask iniciada com sucesso!")
    return app