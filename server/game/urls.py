from django.urls import path
from .views import game_info,get_levels,player_progress

urlpatterns = [
    path("info/", game_info, name="game_info"),
    path("levels/", get_levels, name="get_levels"),
    path("progress/", player_progress, name="player_progress"),

]