from flask_pymongo import PyMongo
from config import Config
import logging
from flask import Flask # Importar Flask é necessário para o app_context

# Configura o logger básico para que as mensagens de erro sejam visíveis
logging.basicConfig(level=logging.INFO)

# Cria a instância do PyMongo globalmente
mongo = PyMongo()

def init_db(app):
    """
    Inicializa a extensão PyMongo com a aplicação Flask e verifica a conexão.
    """
    # Inicializa o PyMongo com a aplicação (lê o MONGO_URI, etc.)
    mongo.init_app(app)
    
   # === TESTE DE CONEXÃO ===
    try:
        # Se a inicialização for bem-sucedida, mongo.cx (o cliente) não será None.
        if mongo.cx is not None:
            # Usa o cliente de conexão (mongo.cx) para rodar o comando ping.
            mongo.cx.admin.command('ping') 
        else:
            # Caso o cliente seja None (improvável se a URI estiver no app.config)
            raise ConnectionError("O cliente MongoDB não foi inicializado corretamente.")

        # Se o ping for bem-sucedido:
        print("\n" + "="*60)
        print("🚀 CONEXÃO COM MONGODB ESTABELECIDA COM SUCESSO!")
        print("============================================================")
        
    except Exception as e:
        # Se falhar (incluindo o erro original 'NoneType' ou qualquer outro erro de conexão)
        logging.error("\n" + "="*60)
        logging.error("❌ ERRO CRÍTICO: FALHA NA CONEXÃO COM O MONGODB!")
        logging.error(f"Detalhes do erro: {e}")
        logging.error("Verifique: 1. MONGO_URI (usuário/senha/nome do DB). 2. IP Whitelist no Atlas.")
        logging.error("============================================================")