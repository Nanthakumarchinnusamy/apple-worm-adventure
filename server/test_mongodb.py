
from config.mongodb import get_database

try:
    db = get_database()

    db.connection_tests.insert_one({
        "message": "MongoDB connected successfully",
        "project": "APPLE WORM ADVENTURE",
    })

    print("MongoDB connection successful!")
    print("Database:", db.name)

except Exception as error:
    print("MongoDB connection failed:", error)
