from flask import Flask
# ⚠️ ADICIONADO: Importa a extensão Flask-CORS
from flask_cors import CORS 
from database import init_db 
from .routes.usuario_routes import usuario_bp
from config import Config 

def create_app():
    app = Flask(__name__)
    
    # 🚀 ADICIONADO: Inicializa o CORS. 
    # Isso permite que requisições vindas de outras origens (como o frontend na porta 5500)
    # acessem a API na porta 5000.
    CORS(app) 
    
    # 1. Carrega a configuração
    app.config.from_object(Config)

    init_db(app)


    return app