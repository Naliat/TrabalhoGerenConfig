from flask import Flask
from database import init_db # database.py está no mesmo nível que a pasta app/
from .routes.usuario_routes import usuario_bp # Importação relativa para dentro de 'app/'
from config import Config # Importa a classe Config diretamente (se estiver no topo)

def create_app():
    app = Flask(__name__)
    
    # 1. Carrega a configuração do objeto Config que está no mesmo nível de run.py
    # Se você já tiver importado Config acima, use: app.config.from_object(Config)
    # Se quiser manter carregando via string, use apenas o nome do arquivo se ele estiver no PYTHONPATH:
    app.config.from_object(Config)

    init_db(app)

    # O Flask usa o nome do blueprint
    app.register_blueprint(usuario_bp, url_prefix="/api/usuarios")
    return app