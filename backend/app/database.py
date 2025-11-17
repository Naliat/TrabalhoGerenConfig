from flask_pymongo import PyMongo

mongo = PyMongo()

def init_db(app):
    print("DEBUG init_db chamado")
    mongo.init_app(app)
    print("DEBUG mongo.db =", mongo.db)
    
def get_db():
    print("DEBUG get_db retornou:", mongo.db)
    return mongo.db
