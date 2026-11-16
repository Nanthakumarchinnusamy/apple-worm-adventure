
LEVELS = [
    {
        "level_id": 1,
        "name": "First Steps",
        "grid_size": 5,
        "start": {"x": 0, "y": 4},
        "goal": {"x": 4, "y": 0},
        "apples": [{"x": 2, "y": 2}],
        "walls": [],
        "portals": [],
    },
    {
        "level_id": 2,
        "name": "Around the Wall",
        "grid_size": 5,
        "start": {"x": 0, "y": 4},
        "goal": {"x": 4, "y": 0},
        "apples": [{"x": 2, "y": 3}],
        "walls": [
            {"x": 2, "y": 1},
            {"x": 2, "y": 2},
        ],
        "portals": [],
    },
    {
        "level_id": 3,
        "name": "Portal Practice",
        "grid_size": 6,
        "start": {"x": 0, "y": 5},
        "goal": {"x": 5, "y": 0},
        "apples": [{"x": 2, "y": 4}],
        "walls": [],
        "portals": [
            {"x": 1, "y": 2},
            {"x": 4, "y": 3},
        ],
    },
]

# Additional levels: 4 through 50.
LEVEL_NAMES = [
    "Apple Trail", "Growing Challenge", "Garden Path",
    "Winding Journey", "Golden Apple", "Forest Walk",
    "Worm's Journey", "Apple Quest", "Green Valley",
    "Hidden Orchard", "Emerald Trail", "Apple Crossing",
    "Woodland Adventure", "Twisty Path", "Orchard Run",
    "Mystery Garden", "Lucky Apples", "Nature Trail",
    "Clever Worm", "Apple Kingdom", "Forest Challenge",
    "Green Maze", "Golden Garden", "Worm Explorer",
    "Apple Expedition", "Wild Orchard", "Secret Path",
    "Emerald Quest", "Worm Master", "Apple Adventure",
    "Deep Forest", "Royal Orchard", "Twilight Trail",
    "Crystal Garden", "Ultimate Journey", "Apple Champion",
    "Magic Orchard", "Brave Worm", "Grand Adventure",
    "Golden Journey", "Master of Apples", "Wonder Garden",
    "Final Orchard", "Legendary Trail", "Ultimate Apple Quest",
    "Worm Legend", "Grand Finale",
]

for level_id in range(4, 51):
    grid_size = min(5 + (level_id - 3) // 8, 10)

    LEVELS.append({
        "level_id": level_id,
        "name": LEVEL_NAMES[level_id - 4],
        "grid_size": grid_size,
        "start": {"x": 0, "y": grid_size - 1},
        "goal": {"x": grid_size - 1, "y": 0},
        # On a clear route from the start toward the goal.
        "apples": [
            {"x": grid_size - 1, "y": grid_size - 2}
        ],
        "walls": [],
        "portals": [],
    })
