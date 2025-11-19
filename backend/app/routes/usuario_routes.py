from flask import Blueprint, request, jsonify
from bson.json_util import dumps
from bson import ObjectId
from app.models.usuario_model import UsuarioModel
import logging

usuario_bp = Blueprint("usuario_bp", __name__)
logger = logging.getLogger(__name__)

# Rota de registro
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


# Rota listar todos
@usuario_bp.get("/users")
def list_users():
    logger.info("📩 GET /users")

    from app.database import mongo

    users = list(mongo.db["usuarios"].find({}, {"password": 0}))
    return dumps(users), 200


# 🔥 Rota pegar 1 usuário
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


# 🔥 Rota atualizar usuário
@usuario_bp.put("/users/<id>")
def update_user(id):
    from app.database import mongo

    data = request.get_json()
    if not data:
        return jsonify({"error": "Nenhum dado enviado"}), 400

    try:
        update = mongo.db["usuarios"].update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )

        if update.matched_count == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"message": "Usuário atualizado com sucesso"}), 200

    except:
        return jsonify({"error": "ID inválido"}), 400


# 🔥 Rota deletar usuário
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


# Rota de login
@usuario_bp.post("/login")
def login():
    logger.info("📩 Recebida requisição POST /login")

    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "email e password são obrigatórios"}), 400

    user, err = UsuarioModel.authenticate(
        data["email"],
        data["password"]
    )

    if err:
        return jsonify({"error": err}), 400

    return jsonify({
        "message": "Login realizado com sucesso",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name")
        }
    })
