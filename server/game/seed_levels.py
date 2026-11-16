from config.mongodb import get_database
from game.level_data import LEVELS


def seed_levels():
    db = get_database()
    collection = db["levels"]

    for level in LEVELS:
        collection.update_one(
            {"level_id": level["level_id"]},
            {"$set": level},
            upsert=True,
        )

    print(f"Successfully saved {len(LEVELS)} levels to MongoDB.")


if __name__ == "__main__":
    seed_levels()