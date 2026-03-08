@echo off
echo Starting Energy Platform Backend...
cd energy-backend
poetry run fastapi dev app/main.py --port 8000
