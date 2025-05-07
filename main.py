import requests

URL = "https://api.pokemonbattle.ru/v2"
TOKEN = "c0082b5c030aed96fbebf93110976915"
HEADER = {'Content-Type':'application/json', 'trainer_token' : TOKEN}

body_pokeboll = {
    "pokemon_id": "307081"
}
body_confirmation = {
    "pokemon_id": "307081",
    "name": "keti",
    "photo_id": 1
}
   

body_create = {
    "name": "Бульбазавр",
    "photo_id": 1
} 

response_pokeboll = requests.post(url = f'{URL}/trainers/add_pokeball', headers = HEADER, json = body_pokeboll)
print(response_pokeboll.json)

response_confirmation = requests.put(url = f'{URL}/pokemons', headers = HEADER, json = body_confirmation)
print(response_confirmation.json)

response_create = requests.post(url = f'{URL}/pokemons', headers = HEADER, json = body_create)
print(response_create.json)

'''message = response_create.json()['message']
print(message)'''


