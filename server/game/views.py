
from django.http import JsonResponse
from config.mongodb import get_database

import json

from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


def game_info(request):
    try:
        db = get_database()

        return JsonResponse({
            "game_name": "APPLE WORM ADVENTURE",
            "database": db.name,
            "status": "success",
            "message": "Game API is connected to MongoDB!",
        })

    except Exception as error:
        print("GAME INFO API ERROR:", repr(error))
        return JsonResponse({
            "status": "error",
            "message": "Database connection failed",
        }, status=500)


def get_levels(request):
    try:
        db = get_database()

        levels = list(
            db["levels"]
            .find({}, {"_id": 0})
            .sort("level_id", 1)
        )

        return JsonResponse({
            "status": "success",
            "total_levels": len(levels),
            "levels": levels,
        })

    except Exception as error:
        print("LEVELS API ERROR:", repr(error))
        return JsonResponse({
            "status": "error",
            "message": "Unable to load levels.",
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def player_progress(request):
    try:
        db = get_database()
        collection = db["player_progress"]

        # Temporary player ID until authentication is implemented.
        player_id = request.GET.get("player_id", "default_player")

        if request.method == "GET":
            progress = collection.find_one(
                {"player_id": player_id},
                {"_id": 0},
            )

            if progress is None:
                progress = {
                    "player_id": player_id,
                    "score": 0,
                    "completed_levels": [],
                }

            return JsonResponse({
                "status": "success",
                "progress": progress,
            })

        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON body.",
            }, status=400)

        score = data.get("score")
        completed_levels = data.get("completed_levels")

        if (
            isinstance(score, bool)
            or not isinstance(score, int)
            or score < 0
        ):
            return JsonResponse({
                "status": "error",
                "message": "Score must be a non-negative integer.",
            }, status=400)

        if (
            not isinstance(completed_levels, list)
            or any(
                isinstance(level_id, bool)
                or not isinstance(level_id, int)
                or level_id < 1
                for level_id in completed_levels
            )
        ):
            return JsonResponse({
                "status": "error",
                "message": "completed_levels must be a list of positive integers.",
            }, status=400)

        completed_levels = sorted(set(completed_levels))

        collection.update_one(
            {"player_id": player_id},
            {
                "$set": {
                    "score": score,
                    "completed_levels": completed_levels,
                }
            },
            upsert=True,
        )

        return JsonResponse({
            "status": "success",
            "message": "Player progress saved.",
            "progress": {
                "player_id": player_id,
                "score": score,
                "completed_levels": completed_levels,
            },
        })

    except Exception as error:
        print("PLAYER PROGRESS API ERROR:", repr(error))
        return JsonResponse({
            "status": "error",
            "message": "Unable to access player progress.",
        }, status=500)