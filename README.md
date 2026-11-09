#  Backend - Sistema de Reconocimiento y Detección de Emociones

Este repositorio contiene la arquitectura de backend y visión artificial desarrollada en **Python** utilizando **OpenCV** y **FastAPI**. El módulo gestiona la recolección de muestras faciales, el entrenamiento de modelos de clasificación y la inferencia de emociones en tiempo real mediante transmisión de video y WebSockets.

---

##  Estructura del Repositorio

- **`Data/`**: Conjunto de datos con imágenes faciales clasificadas en subcarpetas por emoción (*Enojo*, *Felicidad*, *Sorpresa*, *Tristeza*).
- **`Emojis/`**: Recursos gráficos complementarios.
- **`capturar_rostro.py`**: Script para la detección y extracción automática de muestras de rostros mediante cámara web (Haar Cascades).
- **`entrenando.py`**: Script encargado del procesamiento del dataset y el entrenamiento de los modelos reconocedores.
- **`reconocimientoEmociones.py`**: Script de clasificación individual para pruebas en ventana nativa de OpenCV.
- **`main.py`**: Servidor principal en **FastAPI** que gestiona la transmisión de video (`/video_feed`) y la comunicación en tiempo real vía WebSockets (`/ws/emotions`).
- **`modeloEigenFaces.xml`**: Modelo clasificador entrenado mediante el algoritmo EigenFaces.
- **`modeloFisherFaces.xml`**: Modelo clasificador entrenado mediante el algoritmo FisherFaces.
- **`modeloLBPH.xml`**: Modelo clasificador entrenado mediante el algoritmo LBPH (Local Binary Patterns Histograms).

---

##  Integración con Frontend

El servidor expone dos puntos de contacto principales para la interfaz web (Single Page Application - SPA):
- **Streaming de Video HTTP (`/video_feed`):** Transmite los fotogramas procesados con los recuadros de detección de rostro.
- **Canal WebSocket (`/ws/emotions`):** Envía datos JSON en tiempo real con la emoción detectada para actualizar los elementos gráficos (emojis y colores) en el cliente.

---

##  Requisitos e Instalación

### Requisitos previos
- Python 3.8 o superior instalado.
- Cámara web operativa.

### Instalación de dependencias
Ejecuta el siguiente comando en la terminal para instalar las librerías necesarias:

```bash
pip install opencv-python opencv-contrib-python fastapi uvicorn numpy jinja2 websockets
