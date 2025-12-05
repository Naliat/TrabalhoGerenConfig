# backend/app/services/email_service.py
import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, HtmlContent, PlainTextContent

logger = logging.getLogger(__name__)

class EmailService:
    
    @staticmethod
    def send_password_reset(email, token, name=""):
        """
        Envia email de recuperação de senha via SendGrid
        """
        try:
            api_key = os.getenv("SENDGRID_API_KEY")
            sender_email = os.getenv("SENDGRID_SENDER_EMAIL", "noreply@sitasks.com")
            app_name = os.getenv("APP_NAME", "SITasks")
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5500")
            
            if not api_key:
                logger.error("❌ SENDGRID_API_KEY não configurada")
                return False, "Configuração de email não encontrada"
            
            reset_url = f"{frontend_url}/reset-password.html?email={email}&token={token}"
            
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
                    .button {{ background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }}
                    .warning {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{app_name}</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2>Olá, {name if name else 'usuário'}!</h2>
                        <p>Você solicitou a redefinição da sua senha no <strong>{app_name}</strong>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_url}" class="button" style="color: white; text-decoration: none;">
                                🔑 Redefinir Minha Senha
                            </a>
                        </div>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">
                            {reset_url}
                        </p>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong></p>
                            <p>• Este link é válido por <strong>1 hora</strong> apenas</p>
                            <p>• Se você não solicitou esta redefinição, ignore este email</p>
                        </div>
                        
                        <p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>
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
            
             
            logger.info(f"📧 Email enviado para {email} - Status: {response.status_code}")
            
            if response.status_code in [200, 202]:
                return True, "Email enviado com sucesso"
            else:
                logger.error(f"❌ SendGrid erro: {response.status_code} - {response.body}")
                return False, f"Erro ao enviar email (status {response.status_code})"
                
        except Exception as e:
            logger.error(f"❌ Erro ao enviar email para {email}: {str(e)}")
            return False, f"Erro ao enviar email: {str(e)}"
    
    @staticmethod
    def send_welcome_email(email, name=""):
        """
        Envia email de boas-vindas
        """
        try:
            api_key = os.getenv("SENDGRID_API_KEY")
            sender_email = os.getenv("SENDGRID_SENDER_EMAIL")
            app_name = os.getenv("APP_NAME", "SITasks")
            
            if not api_key:
                return False, "API Key não configurada"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body>
                <h2>🎉 Bem-vindo ao {app_name}!</h2>
                <p>Olá {name if name else 'usuário'},</p>
                <p>Sua conta foi criada com sucesso. Estamos felizes em tê-lo conosco!</p>
                <p>Atenciosamente,<br>Equipe {app_name}</p>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=From(sender_email, app_name),
                to_emails=To(email),
                subject=Subject(f"🎉 Bem-vindo ao {app_name}!"),
                html_content=HtmlContent(html_content)
            )
            
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
            
            if response.status_code in [200, 202]:
                logger.info(f"📧 Email de boas-vindas enviado para: {email}")
                return True, "Email enviado"
            else:
                return False, f"Erro: {response.status_code}"
                
        except Exception as e:
            logger.error(f"Erro email boas-vindas: {e}")
            return False, str(e)