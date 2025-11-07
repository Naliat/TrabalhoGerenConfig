# Importação relativa: usa '..' para subir um nível (do 'routes' para o 'app')
# e então descer para 'services'
from ..services.usuario_service import listar_usuarios, criar_usuario
from flask import Blueprint, jsonify, request

usuario_bp = Blueprint('usuarios', __name__)

@usuario_bp.route('/', methods=['GET'])
def listar():
    """Lista todos os usuários."""
    # Chama a função de serviço para obter os dados
    usuarios = listar_usuarios()
    return jsonify(usuarios)

@usuario_bp.route('/', methods=['POST'])
def criar():
    """Cria um novo usuário."""
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "Dados ausentes"}), 400
    
    # Chama a função de serviço para criar o usuário
    novo_usuario = criar_usuario(dados)
    
    if "erro" in novo_usuario:
        return jsonify(novo_usuario), 400
        
    return jsonify(novo_usuario), 201

# Adicione outras rotas aqui conforme necessário