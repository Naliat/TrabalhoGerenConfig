# Corrigido: Importação relativa. Sobe dois níveis (services -> app -> backend) para database.py
from database import mongo
from bson.objectid import ObjectId # Garante que ObjectId está disponível se necessário

# Exemplo de uso
def listar_usuarios():
    # Exemplo: Acessa uma coleção e retorna os documentos
    try:
        usuarios = list(mongo.db.usuarios.find({}))
        # Converte ObjectId para string para serialização JSON
        for user in usuarios:
            user['_id'] = str(user['_id']) 
        return usuarios
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")
        return {"erro": "Falha ao acessar o banco de dados."}

def criar_usuario(dados):
    # Exemplo: Insere um novo documento
    try:
        resultado = mongo.db.usuarios.insert_one(dados)
        return {"id": str(resultado.inserted_id), "mensagem": "Usuário criado com sucesso"}
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")
        return {"erro": "Falha ao inserir no banco de dados."}