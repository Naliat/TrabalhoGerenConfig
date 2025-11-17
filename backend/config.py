import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    # Lendo a URI completa do .env (Correto)
    MONGO_URI = os.getenv("MONGO_URI")

    # 🚀 ADICIONADO: Define o nome do Banco de Dados.
    # Isto impede que mongo.db seja None, resolvendo o TypeError.
    # SUBSTITUA 'sitask_db' PELO NOME REAL DO SEU BANCO DE DADOS NO ATLAS!
    MONGO_DBNAME = 'ola' 
    
    # É útil manter DEBUG ativado para o desenvolvimento
    DEBUG = True