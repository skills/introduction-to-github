import requests
import pytest

URL = "https://api.pokemonbattle.ru/v2"
TOKEN = "c0082b5c030aed96fbebf93110976915"
HEADER = {'Content-Type':'application/json', 'trainer_token' : TOKEN}
TRENER_ID = '29888'

def test_status_code():
    response = requests.get(url = f'{URL}/pokemons', params = {'trainer_id' : TRENER_ID})
    assert response.status_code == 200
    
def test_part_of_response():
   response_get = requests.get(url = f'{URL}/pokemons', params = {'trainer_id' : TRENER_ID})
   assert response_get.json()["date"][0]["name"] == 'Бульбазавр'
