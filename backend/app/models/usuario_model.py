from werkzeug.security import generate_password_hash, check_password_hash
from app.database import get_db

USERS_COLL = "usuarios"

class UsuarioModel:

    @staticmethod
    def create(email, password, name=None):
        db = get_db()

        if db[USERS_COLL].find_one({"email": email}):
            return None, "Email já cadastrado"

        hashed = generate_password_hash(password)

        new_user = {
            "email": email,
            "password": hashed,
            "name": name
        }

        result = db[USERS_COLL].insert_one(new_user)
        new_user["_id"] = str(result.inserted_id)

        return new_user, None

    @staticmethod
    def authenticate(email, password):
        db = get_db()

        user = db[USERS_COLL].find_one({"email": email})
        if not user:
            return None, "Usuário não encontrado"

        if not check_password_hash(user["password"], password):
            return None, "Senha inválida"

        return user, None
