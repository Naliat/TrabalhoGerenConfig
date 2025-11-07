from datetime import datetime, timedelta

def create_study_record(disciplina, tema, tempo):
    today = datetime.utcnow()
    return {
        "disciplina": disciplina,
        "tema": tema,
        "tempo": tempo,
        "data_estudo": today,
        "revisoes": [
            {"data": today + timedelta(days=1), "status": "pendente"},
            {"data": today + timedelta(days=7), "status": "pendente"},
            {"data": today + timedelta(days=14), "status": "pendente"}
        ]
    }
