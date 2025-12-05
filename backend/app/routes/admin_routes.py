import os
from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from bson.json_util import dumps
from app.database import mongo
import logging

admin_bp = Blueprint("admin_bp", __name__)
logger = logging.getLogger(__name__)

# 🔐 Chave secreta vinda do .env
ADMIN_KEY = os.getenv("ADMIN_KEY")


# ---------------------------------------------
# 🔒 Verificar a chave antes de cada requisição
# ---------------------------------------------
def require_admin_key(req):
    key = req.headers.get("X-ADMIN-KEY")
    if not key:
        return False, "Chave administrativa ausente."

    if key != ADMIN_KEY:
        return False, "Chave administrativa inválida."

    return True, None


# ---------------------------------------------
# 👁 Listar todos os usuários
# ---------------------------------------------
@admin_bp.get("/admin/users")
def admin_list_users():
    logger.info("📩 GET /admin/users recebido")

    ok, err = require_admin_key(request)
    if not ok:
        logger.warning(f"❌ Tentativa de acesso negado: {err}")
        return jsonify({"error": err}), 403

    users = list(mongo.db["usuarios"].find({}, {"password": 0}))
    logger.info(f"📤 Retornando {len(users)} usuários para admin")

    return dumps(users), 200


# ---------------------------------------------
# ❌ Deletar usuário
# ---------------------------------------------
@admin_bp.delete("/admin/user/<user_id>")
def admin_delete_user(user_id):
    logger.info(f"🗑 Solicitação DELETE /admin/user/{user_id}")

    ok, err = require_admin_key(request)
    if not ok:
        logger.warning(f"❌ Acesso negado ao deletar usuário")
        return jsonify({"error": err}), 403

    result = mongo.db["usuarios"].delete_one({"_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        logger.warning(f"⚠️ Usuário {user_id} não encontrado.")
        return jsonify({"error": "Usuário não encontrado"}), 404

    logger.info(f"✅ Usuário {user_id} removido com sucesso.")
    return jsonify({"message": "Usuário deletado"}), 200


# ---------------------------------------------
# ✏ Atualizar usuário
# ---------------------------------------------
@admin_bp.put("/admin/user/<user_id>")
def admin_update_user(user_id):
    logger.info(f"✏ PUT /admin/user/{user_id}")

    ok, err = require_admin_key(request)
    if not ok:
        logger.warning("❌ Acesso negado ao atualizar usuário")
        return jsonify({"error": err}), 403

    data = request.get_json()
    logger.debug(f"📦 Payload recebido: {data}")

    update_fields = {}
    if "email" in data:
        update_fields["email"] = data["email"]
    if "name" in data:
        update_fields["name"] = data["name"]

    if not update_fields:
        return jsonify({"error": "Nenhum campo para atualizar"}), 400

    result = mongo.db["usuarios"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        logger.warning(f"⚠️ Usuário {user_id} não encontrado para edição.")
        return jsonify({"error": "Usuário não encontrado"}), 404

    logger.info(f"✨ Usuário {user_id} atualizado com sucesso.")
    return jsonify({"message": "Usuário atualizado"}), 200
