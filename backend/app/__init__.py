import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from app.database import init_db
from app.logger import setup_logger
import logging


def create_app():
    # ✅ Ativar logs coloridos e configurados
    setup_logger()
    logging.debug("🚀 Iniciando aplicação Flask...")

    # 1. Carregar variáveis do .env
    load_dotenv()
    logging.debug("📄 .env carregado!")

    app = Flask(__name__)
    CORS(app)
    logging.debug("🌐 CORS habilitado")

    # 2. Ler MONGO_URI
    mongo_uri = os.getenv("MONGO_URI")
    logging.debug(f"🔍 MONGO_URI lida: {mongo_uri}")

    if not mongo_uri:
        logging.error("❌ ERRO: MONGO_URI não encontrada no .env")
        raise RuntimeError("MONGO_URI não encontrada no .env")

    app.config["MONGO_URI"] = mongo_uri

    # 3. Inicializar banco
    logging.debug("🔌 Inicializando conexão com o banco...")
    init_db(app)

    # 4. Registrar rotas
    logging.debug("📦 Registrando rotas...")
    from app.routes.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix="/api")

    logging.debug("✅ Aplicação Flask iniciada com sucesso!")
    return app
