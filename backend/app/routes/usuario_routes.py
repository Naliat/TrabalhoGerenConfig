from flask import Blueprint, request, jsonify
from bson.json_util import dumps
from bson import ObjectId
import logging
import re
import os
from datetime import datetime
import string
 
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, HtmlContent, PlainTextContent

from app.models.usuario_model import UsuarioModel 
from app.database import mongo

usuario_bp = Blueprint("usuario_bp", __name__)
logger = logging.getLogger(__name__)

def validar_email(email):
    
    if not email or not isinstance(email, str):
        return False, "E-mail inválido"

    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(email_regex, email):
        return False, "Formato de e-mail inválido. Use: usuario@provedor.com"

    return True, "E-mail válido"

def validar_senha_forte(senha):
    detalhes = {
        "min_len": len(senha) >= 8,
        "tem_numero": any(char.isdigit() for char in senha),
        "tem_maiuscula": any(char.isupper() for char in senha),
        "tem_minuscula": any(char.islower() for char in senha),
        "tem_simbolo": any(char in string.punctuation for char in senha)
    }
    
    valido = all(detalhes.values())
    
    if not valido:
        return False, "Senha não atende aos requisitos de segurança.", detalhes
        
    return True, "Senha forte o suficiente", detalhes

def send_reset_email_sendgrid(email, token, name=""):
    
    try:
        
        api_key = os.getenv("SENDGRID_API_KEY")
        sender_email = os.getenv("SENDGRID_SENDER_EMAIL")
        app_name = os.getenv("APP_NAME", "SITasks")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5500")
        
        if not api_key or not sender_email:
            logger.error(f"❌ Chave API ({bool(api_key)}) ou Remetente ({bool(sender_email)}) do SendGrid não configurada.")
            return False, "Configuração de email não encontrada"
        
        # CORREÇÃO APLICADA AQUI: Incluindo /pages/ no caminho do link
        reset_url = f"{frontend_url}/pages/reset-password.html?email={email}&token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }}
                .header h1 {{ margin: 0; font-size: 28px; font-weight: 700; }}
                .content {{ padding: 40px; }}
                .greeting {{ font-size: 18px; margin-bottom: 20px; color: #555555; }}
                .message {{ font-size: 16px; margin-bottom: 30px; color: #666666; }}
                .button-container {{ text-align: center; margin: 40px 0; }}
                .reset-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 5px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }}
                .reset-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }}
                .token-info {{
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 20px 0;
                    word-break: break-all;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 30px 0;
                    color: #856404;
                }}
                .warning-title {{ font-weight: 600; margin-bottom: 10px; }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    color: #6c757d;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 {app_name}</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Recuperação de Senha</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Olá, <strong>{name if name else 'usuário'}</strong>!
                    </div>
                    
                    <div class="message">
                        Você solicitou a redefinição da sua senha no <strong>{app_name}</strong>.
                        Clique no botão abaixo para criar uma nova senha:
                    </div>
                    
                    <div class="button-container">
                        <a href="{reset_url}" class="reset-button">
                            🔑 Redefinir Minha Senha
                        </a>
                    </div>
                    
                    <div class="message">
                        Ou copie e cole este link no seu navegador:
                    </div>
                    
                    <div class="token-info">
                        <div style="font-weight: 600; color: #495057; margin-bottom: 5px;">🔗 Link de redefinição:</div>
                        <div style="font-family: 'Courier New', monospace; color: #dc3545; font-size: 14px;">{reset_url}</div>
                    </div>
                    
                    <div class="warning">
                        <div class="warning-title">⚠️ Importante</div>
                        <p>• Este link é válido por <strong>1 hora</strong> apenas</p>
                        <p>• Se você não solicitou esta redefinição, ignore este email</p>
                        <p>• Sua senha atual continuará funcionando até você redefini-la</p>
                    </div>
                    
                    <div class="footer">
                        <p>Atenciosamente,<br>
                        <strong>Equipe {app_name}</strong></p>
                        
                        <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                            Este é um email automático, por favor não responda.<br>
                            Se precisar de ajuda, visite nosso site.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        REDEFINIÇÃO DE SENHA - {app_name}
        
        Olá {name if name else 'usuário'},
        
        Você solicitou a redefinição da sua senha no {app_name}.
        
        Para redefinir sua senha, clique no link abaixo:
        {reset_url}
        
        Este link é válido por 1 hora apenas.
        
        Se você não solicitou esta redefinição, ignore este email.
        
        Atenciosamente,
        Equipe {app_name}
        
        ---
        Este é um email automático, por favor não responda.
        """
        
        message = Mail(
            from_email=From(sender_email, app_name),
            to_emails=To(email),
            subject=Subject(f"🔐 Redefinição de Senha - {app_name}"),
            html_content=HtmlContent(html_content),
            plain_text_content=PlainTextContent(text_content)
        )
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        if response.status_code in [200, 202]:
            logger.info(f"✅ Email enviado com sucesso para: {email}")
            return True, "Email enviado com sucesso"
        else:
            return False, f"Erro ao enviar email (status {response.status_code}, body: {response.body})"
            
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email para {email}: {str(e)}")
        return False, f"Erro ao enviar email: {str(e)}"

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

    password = data["password"]
    senha_valida, mensagem_senha, _ = validar_senha_forte(password)
    if not senha_valida:
        logger.warning("⚠️ Senha muito curta ou fraca")
        return jsonify({"error": mensagem_senha}), 400

    nome = data.get("name", "").strip()
    if nome and len(nome) < 2:
        return jsonify({"error": "Nome deve ter pelo menos 2 caracteres"}), 400

    try:
        usuario_existente = mongo.db["usuarios"].find_one({"email": email})

        if usuario_existente:
            logger.warning(f"⚠️ Tentativa de registro com e-mail duplicado: {email}")
            return jsonify({"error": "Este e-mail já está cadastrado"}), 409
    except Exception as e:
        logger.error(f"❌ Erro ao verificar e-mail existente: {e}")
        return jsonify({"error": "Erro ao verificar disponibilidade do e-mail"}), 500

    logger.info(f"🛠 Criando usuário: {email}")

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

@usuario_bp.post("/check-email")
def check_email():
    
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

    users = list(mongo.db["usuarios"].find({}, {"password": 0}))
    return dumps(users), 200

@usuario_bp.get("/users/<id>")
def get_user(id):
    try:
        user = mongo.db["usuarios"].find_one({"_id": ObjectId(id)}, {"password": 0})
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return dumps(user), 200
    except:
        return jsonify({"error": "ID inválido"}), 400

@usuario_bp.put("/users/<id>")
def update_user(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Nenhum dado enviado"}), 400

    try:
        object_id = ObjectId(id)
    except:
        return jsonify({"error": "ID inválido"}), 400

    if "email" in data:
        email = data["email"].strip().lower()
        data["email"] = email 

        email_valido, mensagem_erro = validar_email(email)
        if not email_valido:
            return jsonify({"error": mensagem_erro}), 400

        usuario_existente = mongo.db["usuarios"].find_one({
            "email": email,
            "_id": {"$ne": object_id}
        })

        if usuario_existente:
            return jsonify({"error": "Este e-mail já está em uso por outro usuário"}), 409

    try:
        update = mongo.db["usuarios"].update_one(
            {"_id": object_id},
            {"$set": data}
        )

        if update.matched_count == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"message": "Usuário atualizado com sucesso"}), 200

    except Exception as e:
        logger.error(f"❌ Erro ao atualizar usuário: {e}")
        return jsonify({"error": "Erro no servidor ao atualizar"}), 500

@usuario_bp.delete("/users/<id>")
def delete_user(id):
    try:
        delete = mongo.db["usuarios"].delete_one({"_id": ObjectId(id)})

        if delete.deleted_count == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"message": "Usuário deletado com sucesso"}), 200

    except:
        return jsonify({"error": "ID inválido"}), 400

@usuario_bp.post("/forgot-password")
def forgot_password():
    logger.info("📩 Recebida requisição POST /forgot-password")

    data = request.get_json()

    if not data or "email" not in data:
        return jsonify({"error": "E-mail é obrigatório"}), 400

    email = data["email"].strip().lower()

    if not validar_email(email)[0]:
        return jsonify({"error": validar_email(email)[1]}), 400

    user = mongo.db["usuarios"].find_one({"email": email})

    if not user:
        logger.info(f"⚠️ Tentativa de reset para e-mail não cadastrado: {email}")
        return jsonify({
            "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha"
        }), 200

    token, err = UsuarioModel.generate_reset_token(email)

    if err:
        logger.error(f"❌ Erro ao gerar token: {err}")
        return jsonify({"error": "Erro ao processar solicitação"}), 500

    logger.info(f"✅ Token gerado para {email}")

    nome_usuario = user.get("name", "")
    email_enviado, mensagem = send_reset_email_sendgrid(email, token, nome_usuario)
    
    is_development = os.getenv("FLASK_ENV") == "development"
    
    if not email_enviado:
        logger.error(f"❌ Falha no envio de email para {email}: {mensagem}")
        
        if is_development and "Configuração de email não encontrada" in mensagem:
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5500")
            reset_url = f"{frontend_url}/reset-password.html?email={email}&token={token}" 
            return jsonify({
                "message": "Modo desenvolvimento - email não enviado (falha de configuração)",
                "token": token,
                "reset_url": reset_url,
                "warning": "Em produção, configure SENDGRID_API_KEY e SENDGRID_SENDER_EMAIL"
            }), 200
            
        logger.warning(f"⚠️ Falha no envio de email (serviço/autorização) para {email}. Retornando 200 OK genérico por segurança.")
        
    else:
        logger.info(f"📧 Email de recuperação enviado para: {email}")
        
    return jsonify({
        "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha"
    }), 200

@usuario_bp.post("/validate-reset-token")
def validate_token():
    logger.info("📩 Recebida requisição POST /validate-reset-token")

    data = request.get_json()

    if not data or "email" not in data or "token" not in data:
        return jsonify({"error": "E-mail e token são obrigatórios"}), 400

    email = data["email"].strip().lower()
    token = data["token"]

    valid, message = UsuarioModel.validate_reset_token(email, token)

    if not valid:
        return jsonify({"valid": False, "message": message}), 400

    return jsonify({"valid": True, "message": message}), 200

@usuario_bp.post("/reset-password")
def reset_password():
    logger.info("📩 Recebida requisição POST /reset-password")

    data = request.get_json()

    required_fields = ["email", "token", "new_password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} é obrigatório"}), 400

    email = data["email"].strip().lower()
    token = data["token"]
    new_password = data["new_password"]

    senha_valida, mensagem_senha, _ = validar_senha_forte(new_password)
    if not senha_valida:
        return jsonify({"error": mensagem_senha}), 400

    success, message = UsuarioModel.reset_password(email, token, new_password)

    if not success:
        return jsonify({"error": message}), 400

    logger.info(f"✅ Senha redefinida com sucesso para: {email}")
    return jsonify({"message": message}), 200

@usuario_bp.post("/change-password")
def change_password():
    logger.info("📩 Recebida requisição POST /change-password")

    data = request.get_json()

    required_fields = ["user_id", "current_password", "new_password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} é obrigatório"}), 400

    user_id = data["user_id"]
    current_password = data["current_password"]
    new_password = data["new_password"]

    senha_valida, mensagem_senha, _ = validar_senha_forte(new_password)
    if not senha_valida:
        return jsonify({"error": mensagem_senha}), 400

    try:
        user_id_obj = ObjectId(user_id)
    except:
        return jsonify({"error": "ID do usuário inválido"}), 400

    success, message = UsuarioModel.change_password(user_id_obj, current_password, new_password)

    if not success:
        return jsonify({"error": message}), 400

    logger.info(f"✅ Senha alterada com sucesso para usuário: {user_id}")
    return jsonify({"message": message}), 200

@usuario_bp.post("/verify-password")
def verify_password():
    logger.info("📩 Recebida requisição POST /verify-password")

    data = request.get_json()

    if not data or "user_id" not in data or "password" not in data:
        return jsonify({"error": "user_id e password são obrigatórios"}), 400

    user_id = data["user_id"]
    password = data["password"]

    try:
        user_id_obj = ObjectId(user_id)
    except:
        return jsonify({"error": "ID do usuário inválido"}), 400

    valid, message = UsuarioModel.verify_current_password(user_id_obj, password)

    if not valid:
        return jsonify({"valid": False, "message": message}), 400

    return jsonify({"valid": True, "message": message}), 200