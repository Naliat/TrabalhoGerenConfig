from flask import Blueprint, request, jsonify
from bson.json_util import dumps
from bson import ObjectId
from app.models.usuario_model import UsuarioModel
import logging
import re  


usuario_bp = Blueprint("usuario_bp", __name__)
logger = logging.getLogger(__name__)

def validar_email(email):
    """
    Valida o formato do e-mail com regex
    Retorna: (bool, str) - (válido, mensagem)
    """
    if not email or not isinstance(email, str):
        return False, "E-mail inválido"
    
    
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    
    if not re.match(email_regex, email):
        return False, "Formato de e-mail inválido. Use: usuario@provedor.com"

    
    return True, "E-mail válido"

@usuario_bp.post("/register")
def register():
    logger.info("📩 Recebida requisição POST /register")

    data = request.get_json()
    logger.debug(f"📦 Payload recebido: {data}")

    if not data or "email" not in data or "password" not in data:
        logger.warning("⚠️ Requisição inválida — campos obrigatórios ausentes")
        return jsonify({"error": "email e password são obrigatórios"}), 400
    

    email = data["email"].strip().lower()  
    email_valido, mensagem_erro = validar_email(email)
    
    if not email_valido:
        logger.warning(f"⚠️ E-mail inválido: {email} - {mensagem_erro}")
        return jsonify({"error": mensagem_erro}), 400
    
    from app.database import mongo
    try:
        usuario_existente = mongo.db["usuarios"].find_one({"email": email})
        
        if usuario_existente:
            logger.warning(f"⚠️ Tentativa de registro com e-mail duplicado: {email}")
            return jsonify({"error": "Este e-mail já está cadastrado"}), 409  
    except Exception as e:
        logger.error(f"❌ Erro ao verificar e-mail existente: {e}")
        return jsonify({"error": "Erro ao verificar disponibilidade do e-mail"}), 500

    logger.info(f"🛠 Criando usuário: {data['email']}")

    password = data["password"]
    if len(password) < 6:
        logger.warning("⚠️ Senha muito curta")
        return jsonify({"error": "A senha deve ter pelo menos 6 caracteres"}), 400

    nome = data.get("name", "").strip()
    if nome:
        if len(nome) < 2:
            return jsonify({"error": "Nome deve ter pelo menos 2 caracteres"}), 400
    
    doc, err = UsuarioModel.create(
        email,  
        password,
        nome
    )

    if err:
        logger.error(f"❌ Erro ao criar usuário: {err}")
        
        if "duplicado" in err.lower() or "já existe" in err.lower() or "already" in err.lower():
            return jsonify({"error": "Este e-mail já está cadastrado"}), 409
        
        return jsonify({"error": err}), 400

    logger.info(f"✅ Usuário criado com sucesso: {email}")
    return jsonify({
        "message": "Usuário registrado com sucesso",
        "user": {
            "id": str(doc.inserted_id) if hasattr(doc, 'inserted_id') else None,
            "email": email,
            "name": nome
        }
    }), 201


@usuario_bp.post("/check-email")
def check_email():
    """
    Verifica se um e-mail já está cadastrado
    Útil para validação em tempo real no front-end
    """
    logger.info("📩 Recebida requisição POST /check-email")
    
    data = request.get_json()
    
    if not data or "email" not in data:
        return jsonify({"error": "E-mail é obrigatório"}), 400
    
    email = data["email"].strip().lower()
    
    email_valido, mensagem_erro = validar_email(email)
    if not email_valido:
        return jsonify({
            "available": False,
            "message": mensagem_erro
        }), 200
    
    from app.database import mongo
    try:
        usuario_existente = mongo.db["usuarios"].find_one({"email": email})
        
        if usuario_existente:
            return jsonify({
                "available": False,
                "message": "Este e-mail já está cadastrado"
            }), 200
        else:
            return jsonify({
                "available": True,
                "message": "E-mail disponível"
            }), 200
    except Exception as e:
        logger.error(f"❌ Erro ao verificar e-mail: {e}")
        return jsonify({
            "available": False,
            "message": "Erro ao verificar disponibilidade"
        }), 500


@usuario_bp.get("/users")
def list_users():
    logger.info("📩 GET /users")

    from app.database import mongo

    users = list(mongo.db["usuarios"].find({}, {"password": 0}))
    return dumps(users), 200


@usuario_bp.get("/users/<id>")
def get_user(id):
    from app.database import mongo

    try:
        user = mongo.db["usuarios"].find_one({"_id": ObjectId(id)}, {"password": 0})
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return dumps(user), 200
    except:
        return jsonify({"error": "ID inválido"}), 400


@usuario_bp.put("/users/<id>")
def update_user(id):
    from app.database import mongo

    data = request.get_json()
    if not data:
        return jsonify({"error": "Nenhum dado enviado"}), 400
    
    if "email" in data:
        email = data["email"].strip().lower()
        
        
        email_valido, mensagem_erro = validar_email(email)
        if not email_valido:
            return jsonify({"error": mensagem_erro}), 400
        
        
        usuario_existente = mongo.db["usuarios"].find_one({
            "email": email,
            "_id": {"$ne": ObjectId(id)} 
        })
        
        if usuario_existente:
            return jsonify({"error": "Este e-mail já está em uso por outro usuário"}), 409

    try:
        if "email" in data:
            data["email"] = data["email"].strip().lower()
        
        update = mongo.db["usuarios"].update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )

        if update.matched_count == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"message": "Usuário atualizado com sucesso"}), 200

    except Exception as e:
        logger.error(f"❌ Erro ao atualizar usuário: {e}")
        return jsonify({"error": "ID inválido ou erro no servidor"}), 400


@usuario_bp.delete("/users/<id>")
def delete_user(id):
    from app.database import mongo

    try:
        delete = mongo.db["usuarios"].delete_one({"_id": ObjectId(id)})

        if delete.deleted_count == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"message": "Usuário deletado com sucesso"}), 200

    except:
        return jsonify({"error": "ID inválido"}), 400


@usuario_bp.post("/login")
def login():
    logger.info("📩 Recebida requisição POST /login")

    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "email e password são obrigatórios"}), 400
    
    email = data["email"].strip().lower()
    password = data["password"]

    user, err = UsuarioModel.authenticate(email, password)

    if err:
        logger.warning(f"⚠️ Falha no login para: {email} - {err}")
        return jsonify({"error": err}), 400

    logger.info(f"✅ Login bem-sucedido para: {email}")
    return jsonify({
        "message": "Login realizado com sucesso",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name")
        }
    })