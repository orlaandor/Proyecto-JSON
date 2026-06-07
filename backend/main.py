#Backend waos
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI()

# Permite las conexiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "datos.json"

# 1. Define los datos que queremos recibir
class ConfiguracionSemaforo(BaseModel):
    tiempo_verde: int
    tiempo_amarillo: int
    tiempo_rojo: int

# Funciones para manejar el archivo JSON
def leer_json():
    with open(DB_FILE, "r") as f:
        return json.load(f)

def guardar_json(datos):
    with open(DB_FILE, "w") as f:
        json.dump(datos, f, indent=4)


# 2. ENDPOINT PARA LA PÁGINA WEB: Guardar nuevos tiempos
@app.post("/api/configurar")
def cambiar_tiempos(nueva_config: ConfiguracionSemaforo):
    # Leemos lo que tiene el JSON actualmente
    datos_actuales = leer_json()
    
    # Reemplazamos los tiempos viejos con los que el usuario puso en el frontend
    datos_actuales["tiempo_verde"] = nueva_config.tiempo_verde
    datos_actuales["tiempo_amarillo"] = nueva_config.tiempo_amarillo
    datos_actuales["tiempo_rojo"] = nueva_config.tiempo_rojo
    
    # Guardamos los cambios en el archivo datos.json
    guardar_json(datos_actuales)
    
    return {"message": "Configuración actualizada con éxito", "datos": datos_actuales}


# 3. ENDPOINT PARA EL ESP32: Leer la configuración actual
@app.get("/api/sistema-completo")
def obtener_sistema():
    # Devuelve todo el JSON para que el ESP32 o la Web sepan los tiempos y el estado actual
    return leer_json()
