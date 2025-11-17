from flask import Blueprint, request, jsonify
from bson.json_util import dumps
from app.models.usuario_model import UsuarioModel
import logging

usuario_bp = Blueprint("usuario_bp", __name__)
logger = logging.getLogger(__name__)

#Rota de registro
@usuario_bp.post("/register")
def register():
    logger.info("📩 Recebida requisição POST /register")

    data = request.get_json()
    logger.debug(f"📦 Payload recebido: {data}")

    if not data or "email" not in data or "password" not in data:
        logger.warning("⚠️ Requisição inválida — campos obrigatórios ausentes")
        return jsonify({"error": "email e password são obrigatórios"}), 400

    logger.info(f"🛠 Criando usuário: {data['email']}")

    doc, err = UsuarioModel.create(
        data["email"],
        data["password"],
        data.get("name")
    )

    if err:
        logger.error(f"❌ Erro ao criar usuário: {err}")
        return jsonify({"error": err}), 400

    logger.info(f"✅ Usuário criado com sucesso: {data['email']}")
    return jsonify({"message": "Usuário registrado com sucesso"}), 201


# Rota de listar usuarios
@usuario_bp.get("/users")
def list_users():
    logger.info("📩 Recebida requisição GET /users")

    from app.database import mongo

    logger.debug("🔍 Buscando usuários no banco (sem senha)...")

    users = list(mongo.db["usuarios"].find({}, {"password": 0}))

    logger.info(f"📤 Retornando {len(users)} usuários")
    return dumps(users), 200


# Rota de login
@usuario_bp.post("/login")
def login():
    logger.info("📩 Recebida requisição POST /login")

    data = request.get_json()
    logger.debug(f"📦 Payload recebido: {data}")

    if not data or "email" not in data or "password" not in data:
        logger.warning("⚠️ Campos obrigatórios ausentes no login")
        return jsonify({"error": "email e password são obrigatórios"}), 400

    email = data["email"]
    logger.info(f"🔑 Tentando login de: {email}")

    user, err = UsuarioModel.authenticate(
        data["email"],
        data["password"]
    )

    if err:
        logger.warning(f"❌ Falha no login para {email}: {err}")
        return jsonify({"error": err}), 400

    logger.info(f"✅ Login bem-sucedido para {email}")

    return jsonify({
        "message": "Login realizado com sucesso",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name")
        }
    })
