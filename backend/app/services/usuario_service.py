from database import mongo
from bson.objectid import ObjectId

# Nome da coleção no MongoDB
USUARIOS_COLLECTION = 'usuarios'

def listar_usuarios():
    """Lista todos os usuários (apenas para debug ou admin)."""
    # Consulta o MongoDB
    usuarios = mongo.db[USUARIOS_COLLECTION].find()
    
    # Converte o cursor do MongoDB em uma lista de dicionários
    # e converte o ObjectId para string
    lista_usuarios = []
    for user in usuarios:
        user['_id'] = str(user['_id'])
        # Remove a senha antes de retornar (boa prática)
        user.pop('password', None) 
        lista_usuarios.append(user)
        
    return lista_usuarios

def criar_usuario(dados):
    """Cria um novo usuário no MongoDB."""
    
    # 1. Validação simples
    email = dados.get('email')
    password = dados.get('password')
    
    if not email or not password:
        return {"erro": "Email e senha são obrigatórios."}
        
    # 2. Verificar se o usuário já existe
    user_exists = mongo.db[USUARIOS_COLLECTION].find_one({'email': email})
    if user_exists:
        return {"erro": "Este email já está cadastrado."}
        
    # 3. Inserir o novo usuário
    try:
        # Nota: Em um app real, a senha DEVE ser hasheada antes de salvar (ex: usando Flask-Bcrypt)
        novo_usuario = {
            'email': email,
            'password': password, 
        }
        
        resultado = mongo.db[USUARIOS_COLLECTION].insert_one(novo_usuario)
        
        # Retorna o ID do novo usuário criado
        return {
            "_id": str(resultado.inserted_id),
            "email": email
        }
    
    except Exception as e:
        # Retorna um erro caso a inserção falhe
        return {"erro": f"Falha ao salvar usuário no banco de dados: {str(e)}"}