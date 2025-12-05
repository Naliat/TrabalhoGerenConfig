import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-123456")
    
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/sitask")
    
    ADMIN_KEY = os.getenv("ADMIN_KEY", "default-admin-key")
    
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    
    SENDGRID_SENDER_EMAIL = os.getenv("SENDGRID_SENDER_EMAIL", "noreply@sitasks.com")
    
    APP_NAME = os.getenv("APP_NAME", "SITasks")
    
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5500")
    
    FLASK_ENV = os.getenv("FLASK_ENV", "production")
    
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1" or FLASK_ENV == "development"
    
    RESET_TOKEN_EXPIRY_HOURS = int(os.getenv("RESET_TOKEN_EXPIRY_HOURS", "1"))
    
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    
    MIN_PASSWORD_LENGTH = int(os.getenv("MIN_PASSWORD_LENGTH", "8"))
    
    PORT = int(os.getenv("PORT", "5000"))
    
    HOST = os.getenv("HOST", "0.0.0.0")
    
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5500,http://127.0.0.1:5500").split(",")
    
    EMAIL_RESET_SUBJECT = f"{APP_NAME} - Redefinição de Senha"
    
    EMAIL_WELCOME_SUBJECT = f"Bem-vindo ao {APP_NAME}!"
    
    EMAIL_PASSWORD_CHANGED_SUBJECT = f"{APP_NAME} - Senha Alterada"
    
    @classmethod
    def validate(cls):
        errors = []
        
        if not cls.MONGO_URI:
            errors.append("MONGO_URI não configurada")
        
        if not cls.SENDGRID_API_KEY and cls.FLASK_ENV == "production":
            errors.append("SENDGRID_API_KEY não configurada (obrigatória em produção)")
        
        if not cls.SENDGRID_SENDER_EMAIL:
            errors.append("SENDGRID_SENDER_EMAIL não configurada")
        
        if cls.MONGO_URI and "mongodb://" not in cls.MONGO_URI and "mongodb+srv://" not in cls.MONGO_URI:
            errors.append("MONGO_URI deve começar com mongodb:// ou mongodb+srv://")
        
        if cls.SENDGRID_SENDER_EMAIL and "@" not in cls.SENDGRID_SENDER_EMAIL:
            errors.append("SENDGRID_SENDER_EMAIL deve ser um email válido")
        
        if errors:
            error_message = "Erros de configuração:\n" + "\n".join(f"  • {error}" for error in errors)
            raise ValueError(error_message)
        
        return True
    
    @classmethod
    def log_configuration(cls):
        import logging
        logger = logging.getLogger(__name__)
        
        config_info = {
            "app_name": cls.APP_NAME,
            "environment": cls.FLASK_ENV,
            "debug": cls.DEBUG,
            "frontend_url": cls.FRONTEND_URL,
            "mongo_configured": bool(cls.MONGO_URI),
            "sendgrid_configured": bool(cls.SENDGRID_API_KEY),
            "sendgrid_sender": cls.SENDGRID_SENDER_EMAIL,
            "port": cls.PORT,
            "log_level": cls.LOG_LEVEL,
            "cors_origins": cls.CORS_ORIGINS,
            "reset_token_expiry": f"{cls.RESET_TOKEN_EXPIRY_HOURS}h",
            "min_password_length": cls.MIN_PASSWORD_LENGTH
        }
        
        logger.info("=" * 50)
        logger.info("CONFIGURAÇÕES DA APLICAÇÃO")
        logger.info("=" * 50)
        
        for key, value in config_info.items():
            if key == "sendgrid_sender" and value:
                value = value[:3] + "***" + value[value.find("@"):]
            elif key == "mongo_uri" and value:
                value = "mongodb://***:***@***" if "mongodb+srv://" in value else "mongodb://***"
            
            logger.info(f"{key.replace('_', ' ').title()}: {value}")
        
        logger.info("=" * 50)
    
    @classmethod
    def get_database_name(cls):
        try:
            if "mongodb+srv://" in cls.MONGO_URI:
                parts = cls.MONGO_URI.split("/")
                if len(parts) > 3:
                    db_part = parts[3].split("?")[0]
                    return db_part
            elif "mongodb://" in cls.MONGO_URI:
                parts = cls.MONGO_URI.split("/")
                if len(parts) > 3:
                    db_part = parts[3].split("?")[0]
                    return db_part
        except Exception:
            pass
        
        return "sitask"
    
    @classmethod
    def is_development(cls):
        return cls.FLASK_ENV == "development"
    
    @classmethod
    def is_production(cls):
        return cls.FLASK_ENV == "production"
    
    @classmethod
    def get_allowed_origins(cls):
        origins = cls.CORS_ORIGINS
        
        if cls.is_development():
            dev_origins = ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5000"]
            for origin in dev_origins:
                if origin not in origins:
                    origins.append(origin)
        
        return origins
    
    @classmethod
    def get_reset_token_expiry_seconds(cls):
        return cls.RESET_TOKEN_EXPIRY_HOURS * 3600

config = Config()

try:
    config.validate()
    config.log_configuration()
except ValueError as e:
    print(f"⚠️ AVISO: {e}")
    if config.is_production():
        print("❌ ERRO: Configurações inválidas em produção. Aplicação não pode iniciar.")
        raise
    else:
        print("⚠️ Continuando em modo desenvolvimento com configurações incompletas...")