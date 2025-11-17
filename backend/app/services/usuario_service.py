from datetime import datetime, timedelta, UTC
from app.database import mongo
from bson.objectid import ObjectId

SCHEDULE_COLL = 'schedules'
STUDY_COLL = 'studies'
REVISION_COLL = 'revisions'

DEFAULT_OFFSETS = [1, 7, 14]

def create_study_and_revisions(user_id, subject, topic, minutes, offsets=None):
    db = mongo.db

    if offsets is None:
        offsets = DEFAULT_OFFSETS

    offsets = [int(x) for x in offsets] if isinstance(offsets, (list, tuple)) else DEFAULT_OFFSETS
    now = datetime.now(UTC)

    study_doc = {
        'user_id': ObjectId(user_id),
        'subject': subject,
        'topic': topic or '',
        'minutes': int(minutes),
        'studied_at': now,
        'created_at': now
    }

    res = db[STUDY_COLL].insert_one(study_doc)
    study_id = res.inserted_id

    revisions = []

    for d in offsets:
        due_date = now + timedelta(days=int(d))

        r = {
            'user_id': ObjectId(user_id),
            'study_id': study_id,
            'due_date': due_date,
            'completed': False,
            'created_at': now
        }

        rr = db[REVISION_COLL].insert_one(r)

        r['id'] = str(rr.inserted_id)
        r['study_id'] = str(study_id)
        r['due_date'] = due_date.isoformat()

        revisions.append(r)

    study_doc['id'] = str(study_id)
    study_doc['studied_at'] = study_doc['studied_at'].isoformat()
    study_doc['created_at'] = study_doc['created_at'].isoformat()

    return study_doc, revisions
