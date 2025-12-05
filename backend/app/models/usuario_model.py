from werkzeug.security import generate_password_hash, check_password_hash
from app.database import get_db
import datetime
import secrets
import logging

logger = logging.getLogger(__name__)
USERS_COLL = "usuarios"

class UsuarioModel:

    @staticmethod
    def create(email, password, name=None):
        """
        Cria um novo usuário
        """
        try:
            db = get_db()
            
            email = email.strip().lower()
            
            if db[USERS_COLL].find_one({"email": email}):
                return None, "Email já cadastrado"
            
            if len(password) < 6:
                return None, "A senha deve ter pelo menos 6 caracteres"
            
            hashed = generate_password_hash(password)
            
            new_user = {
                "email": email,
                "password": hashed,
                "name": name.strip() if name else "",
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow(),
                "reset_token": None,
                "reset_token_expires": None
            }
            
            result = db[USERS_COLL].insert_one(new_user)
            new_user["_id"] = str(result.inserted_id)
            
            new_user.pop("password", None)
            new_user.pop("reset_token", None)
            new_user.pop("reset_token_expires", None)
            
            logger.info(f"✅ Usuário criado: {email}")
            return new_user, None
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar usuário {email}: {e}")
            return None, f"Erro ao criar usuário: {str(e)}"

    @staticmethod
    def authenticate(email, password):
        """
        Autentica um usuário
        """
        try:
            db = get_db()
            
            email = email.strip().lower()
            
            user = db[USERS_COLL].find_one({"email": email})
            if not user:
                logger.warning(f"⚠️ Tentativa de login com email não encontrado: {email}")
                return None, "Email ou senha incorretos"
            
            if not check_password_hash(user["password"], password):
                logger.warning(f"⚠️ Senha incorreta para: {email}")
                return None, "Email ou senha incorretos"
            
            user["_id"] = str(user["_id"])
            user.pop("password", None)
            user.pop("reset_token", None)
            user.pop("reset_token_expires", None)
            
            logger.info(f"✅ Login bem-sucedido: {email}")
            return user, None
            
        except Exception as e:
            logger.error(f"❌ Erro na autenticação para {email}: {e}")
            return None, f"Erro na autenticação: {str(e)}"

    @staticmethod
    def generate_reset_token(email):
        """
        Gera um token de redefinição de senha
        """
        try:
            db = get_db()
            
            email = email.strip().lower()
            
            user = db[USERS_COLL].find_one({"email": email})
            if not user:
                logger.warning(f"⚠️ Tentativa de reset para email não cadastrado: {email}")
                return None, "Email não encontrado"
            
            token = secrets.token_urlsafe(32)
            
            
            expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            
             
            result = db[USERS_COLL].update_one(
                {"email": email},
                {
                    "$set": {
                        "reset_token": token,
                        "reset_token_expires": expires_at,
                        "updated_at": datetime.datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                return None, "Falha ao gerar token"
            
            logger.info(f"✅ Token gerado para: {email}")
            return token, None
            
        except Exception as e:
            logger.error(f"❌ Erro ao gerar token para {email}: {e}")
            return None, f"Erro ao gerar token: {str(e)}"

    @staticmethod
    def validate_reset_token(email, token):
        """
        Valida se o token é válido e não expirou
        """
        try:
            db = get_db()
            
           
            email = email.strip().lower()
            
         
            user = db[USERS_COLL].find_one({
                "email": email,
                "reset_token": token,
                "reset_token_expires": {"$gt": datetime.datetime.utcnow()}
            })
            
            if not user:
                logger.warning(f"⚠️ Token inválido ou expirado para: {email}")
                return False, "Token inválido ou expirado"
            
            return True, "Token válido"
            
        except Exception as e:
            logger.error(f"❌ Erro ao validar token para {email}: {e}")
            return False, f"Erro ao validar token: {str(e)}"

    @staticmethod
    def reset_password(email, token, new_password):
        """
        Redefine a senha com token válido
        """
        try:
            db = get_db()
            
           
            email = email.strip().lower()
            
           
            valid, message = UsuarioModel.validate_reset_token(email, token)
            if not valid:
                return False, message
            
            
            if len(new_password) < 6:
                return False, "A nova senha deve ter pelo menos 6 caracteres"
            
          
            hashed_password = generate_password_hash(new_password)
            
           
            result = db[USERS_COLL].update_one(
                {
                    "email": email,
                    "reset_token": token
                },
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.datetime.utcnow()
                    },
                    "$unset": {
                        "reset_token": "",
                        "reset_token_expires": ""
                    }
                }
            )
            
            if result.matched_count == 0:
                return False, "Falha ao redefinir senha"
            
            logger.info(f"✅ Senha redefinida para: {email}")
            return True, "Senha redefinida com sucesso"
            
        except Exception as e:
            logger.error(f"❌ Erro ao redefinir senha para {email}: {e}")
            return False, f"Erro ao redefinir senha: {str(e)}"

    @staticmethod
    def change_password(user_id, current_password, new_password):
        """
        Altera senha com validação da senha atual (usuário logado)
        """
        try:
            db = get_db()
            
            # Busca usuário
            user = db[USERS_COLL].find_one({"_id": user_id})
            
            if not user:
                return False, "Usuário não encontrado"
            
          
            if not check_password_hash(user["password"], current_password):
                return False, "Senha atual incorreta"
            
           
            if len(new_password) < 6:
                return False, "A nova senha deve ter pelo menos 6 caracteres"
            
            if current_password == new_password:
                return False, "A nova senha deve ser diferente da atual"
            
             
            hashed_password = generate_password_hash(new_password)
            
             
            result = db[USERS_COLL].update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                return False, "Falha ao alterar senha"
            
            logger.info(f"✅ Senha alterada para usuário: {user_id}")
            return True, "Senha alterada com sucesso"
            
        except Exception as e:
            logger.error(f"❌ Erro ao alterar senha para usuário {user_id}: {e}")
            return False, f"Erro ao alterar senha: {str(e)}"

    @staticmethod
    def get_user_by_email(email):
        """
        Busca usuário por email (sem senha)
        """
        try:
            db = get_db()
            
            email = email.strip().lower()
            user = db[USERS_COLL].find_one({"email": email})
            
            if user:
                user["_id"] = str(user["_id"])
                user.pop("password", None)
                user.pop("reset_token", None)
                user.pop("reset_token_expires", None)
            
            return user
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar usuário {email}: {e}")
            return None

    @staticmethod
    def get_user_by_id(user_id):
        """
        Busca usuário por ID (sem senha)
        """
        try:
            db = get_db()
            
            user = db[USERS_COLL].find_one({"_id": user_id})
            
            if user:
                user["_id"] = str(user["_id"])
                user.pop("password", None)
                user.pop("reset_token", None)
                user.pop("reset_token_expires", None)
            
            return user
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar usuário {user_id}: {e}")
            return None

    @staticmethod
    def update_profile(user_id, update_data):
        """
        Atualiza dados do perfil do usuário
        """
        try:
            db = get_db()
            
            
            update_data.pop("password", None)
            update_data.pop("email", None)  
            update_data.pop("_id", None)
            
           
            update_data["updated_at"] = datetime.datetime.utcnow()
            
          
            result = db[USERS_COLL].update_one(
                {"_id": user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                return False, "Usuário não encontrado"
            
            logger.info(f"✅ Perfil atualizado para usuário: {user_id}")
            return True, "Perfil atualizado com sucesso"
            
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar perfil {user_id}: {e}")
            return False, f"Erro ao atualizar perfil: {str(e)}"

    @staticmethod
    def verify_current_password(user_id, password):
        """
        Verifica se a senha fornecida está correta
        """
        try:
            db = get_db()
            
            user = db[USERS_COLL].find_one({"_id": user_id})
            
            if not user:
                return False, "Usuário não encontrado"
            
            if not check_password_hash(user["password"], password):
                return False, "Senha incorreta"
            
            return True, "Senha correta"
            
        except Exception as e:
            logger.error(f"❌ Erro ao verificar senha para usuário {user_id}: {e}")
            return False, f"Erro ao verificar senha: {str(e)}"