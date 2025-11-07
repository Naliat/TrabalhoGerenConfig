def usuario_to_dict(usuario):
    return {
        "_id": str(usuario["_id"]),
        "nome": usuario["nome"],
        "email": usuario["email"]
    }
