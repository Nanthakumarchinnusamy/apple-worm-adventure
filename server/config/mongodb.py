import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "apple_worm_adventure",
)

_client = None


def get_database():
    global _client

    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI is missing from .env")

    if _client is None:
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )

    # Verify that MongoDB is reachable.
    _client.admin.command("ping")

    return _client[MONGODB_DATABASE]
