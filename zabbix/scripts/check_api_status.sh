#!/bin/bash
# Verifica estado de FastAPI

curl -s -o /dev/null -w "%{http_code}" http://backend:8000/api/system/health