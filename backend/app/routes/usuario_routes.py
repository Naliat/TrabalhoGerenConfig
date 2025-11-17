
from ..services.usuario_service import listar_usuarios, criar_usuario




from flask import Blueprint, jsonify, request

# Define o Blueprint (conjunto de rotas)
usuario_bp = Blueprint('usuarios', __name__)

@usuario_bp.route('/', methods=['GET'])
def listar():
    """Lista todos os usuários (rota para debug/admin)."""
    # Chama a função de serviço para obter os dados
    try:
        usuarios = listar_usuarios()
        return jsonify(usuarios), 200
    except Exception as e:
        return jsonify({"erro": f"Falha ao listar usuários: {str(e)}"}), 500


@usuario_bp.route('/', methods=['POST'])
def criar():
    """Cria um novo usuário."""
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "Dados ausentes"}), 400
    
    # Chama a função de serviço para criar o usuário (o serviço lida com o MongoDB)
    novo_usuario = criar_usuario(dados)
    
    if "erro" in novo_usuario:
        # Erros retornados pelo serviço (ex: email já cadastrado, validação)
        return jsonify(novo_usuario), 400
        
    return jsonify(novo_usuario), 201