# PhishGuard — Backend ML

## Pasos en orden (solo la primera vez)

```bash
pip install -r requirements.txt
python dataset_builder.py
python train_model.py
uvicorn api:app --reload --port 8000
```

## Cada vez que quieras usar la app

Terminal 1 (carpeta backend/):
  uvicorn api:app --reload --port 8000

Terminal 2 (carpeta phishing-detector/):
  npm run dev
