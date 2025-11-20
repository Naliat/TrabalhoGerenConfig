import os
from flask import Flask, render_template, jsonify, abort # <-- Importações adicionais
from dotenv import load_dotenv
from flask_cors import CORS
from app.database import init_db
from app.logger import setup_logger
import logging


# --- AJUSTE 1: CÁLCULO DE CAMINHO PARA O FRONTEND ---
# Ponto de referência: o arquivo atual (__init__.py) está em 'backend/app/'
# Queremos chegar em 'frontend/' (que está dois níveis acima, na raiz do projeto)
base_dir = os.path.dirname(os.path.abspath(__file__))
# Calcula o caminho para a pasta 'frontend' que está fora da pasta 'backend'
FRONTEND_PATH = os.path.join(base_dir, '..', '..', 'frontend')
# ---------------------------------------------------


def create_app():
    # --------------------------------------------------
    # 1. Configurar logger
    # --------------------------------------------------
    setup_logger()
    logging.debug("🚀 Iniciando aplicação Flask...")

    # --------------------------------------------------
    # 2. Carregar variáveis do .env
    # --------------------------------------------------
    load_dotenv()
    logging.debug("📄 .env carregado!")

    # 🔍 TESTE DEFINITIVO PARA DEBUG DO .env
    print("\n=== DEBUG ENV CHECK ===")
    print("PWD:", os.getcwd())
    print(".env exists:", os.path.exists(".env"))
    print("MONGO_URI:", os.getenv("MONGO_URI"))
    print("ADMIN_KEY:", os.getenv("ADMIN_KEY"))
    print("========================\n")

    # --------------------------------------------------
    # 3. Criar app Flask e CONFIGURAR CAMINHOS DO FRONTEND
    # --------------------------------------------------
    app = Flask(__name__,
                # Diz ao Flask onde procurar o index.html e outros HTMLs (templates)
                template_folder=FRONTEND_PATH, 
                # Diz ao Flask onde procurar CSS, JS e Assets (arquivos estáticos)
                static_folder=FRONTEND_PATH, 
                # Configura a URL base dos arquivos estáticos para ser a raiz (/)
                # Ex: 'css/style.css' será procurado em /css/style.css
                static_url_path='') 
    
    CORS(app)
    logging.debug("🌐 CORS habilitado")

    # --------------------------------------------------
    # 4. Ler e validar MONGO_URI
    # --------------------------------------------------
    mongo_uri = os.getenv("MONGO_URI")
    logging.debug(f"🔍 MONGO_URI lida: {mongo_uri}")

    if not mongo_uri:
        logging.error("❌ ERRO: MONGO_URI não encontrada no .env")
        raise RuntimeError("MONGO_URI não encontrada no .env")

    app.config["MONGO_URI"] = mongo_uri

    # --------------------------------------------------
    # 5. Inicializar banco de dados
    # --------------------------------------------------
    logging.debug("🔌 Inicializando conexão com o banco...")
    init_db(app)

    # --------------------------------------------------
    # 6. ADICIONAR ROTAS DE SERVIÇO DO FRONTEND (AJUSTE CRÍTICO)
    # --------------------------------------------------
    
    # Rota 1: Serve a página inicial (index.html) na raiz do site
    @app.route('/')
    def serve_index():
        return render_template('index.html')
        
    # Rota 2: Serve outros arquivos e páginas HTML do frontend (ex: pages/login.html)
    @app.route('/<path:filename>')
    def serve_frontend_files(filename):
        try:
            # Tenta servir como um template (necessário para páginas HTML em subpastas)
            return render_template(filename)
        except Exception:
            # Se não for um template conhecido, retorna 404
            abort(404)


    # --------------------------------------------------
    # 7. Registrar rotas da API
    # --------------------------------------------------
    logging.debug("📦 Registrando rotas da API...")
    from app.routes.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix="/api")

    logging.debug("✅ Aplicação Flask iniciada com sucesso!")
    return app