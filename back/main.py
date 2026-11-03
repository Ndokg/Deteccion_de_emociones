import cv2
import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Cargar el modelo de reconocimento (FisherFaces y LBPH)
METHOD = 'FisherFaces'
model_path = f'modelo{METHOD}.xml'

if METHOD == 'FisherFaces':
    emotion_recognizer = cv2.face.FisherFaceRecognizer_create()
else:
    emotion_recognizer = cv2.face.LBPHFaceRecognizer_create()

if os.path.exists(model_path):
    emotion_recognizer.read(model_path)

# Nombres de las clases según las carpetas
dataPath = 'Data'
if os.path.exists(dataPath):
    imagePaths = os.listdir(dataPath)
else:
    imagePaths = ['Enojo', 'Felicidad', 'Sorpresa', 'Tristeza']

faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

current_emotion_info = {"emotion": "Sin rostro"}

def generate_video_stream():
    global current_emotion_info
    # La cámara solo se abre cuando la web la solicita
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = faceClassif.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)

            detected_emotion = "Sin rostro"

            for (x, y, w, h) in faces:
                rostro = gray[y:y+h, x:x+w]
                rostro = cv2.resize(rostro, (150, 150), interpolation=cv2.INTER_CUBIC)
                
                result = emotion_recognizer.predict(rostro)

                # Regla de decisión directa según el método
                if METHOD == 'FisherFaces' and result[1] < 500:
                    detected_emotion = imagePaths[result[0]]
                    color = (0, 255, 0)
                elif METHOD == 'LBPH' and result[1] < 85:
                    detected_emotion = imagePaths[result[0]]
                    color = (0, 255, 0)
                else:
                    detected_emotion = "No identificado"
                    color = (0, 0, 255)

                cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                cv2.putText(frame, f'{detected_emotion}', (x, y - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            current_emotion_info = {"emotion": detected_emotion}

            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    finally:
        cap.release()

@app.get("/", response_class=HTMLResponse)
def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(generate_video_stream(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws/emotions")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(current_emotion_info))
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass
    
    #uvicorn main:app --reload