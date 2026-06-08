from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Configuración de CORS para que tu navegador no bloquee la conexión
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "datos.json"

def leer_json():
    if not os.path.exists(DB_FILE):
        return {"status": "off"}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def guardar_json(datos):
    with open(DB_FILE, "w") as f:
        json.dump(datos, f, indent=4)

# Endpoint para saber el estado actual
@app.get("/api/led/status")
def get_status():
    return leer_json()

# Endpoint para cambiar el estado con el botón
@app.post("/api/led/toggle")
def toggle_status():
    datos = leer_json()
    
    # Cambiamos el estado de manera inversa
    if datos.get("status") == "on":
        datos["status"] = "off"
    else:
        datos["status"] = "on"
        
    guardar_json(datos)
    return {"success": True, "newStatus": datos["status"]}
