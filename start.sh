#!/bin/bash
# Usa la porta fornita come argomento, altrimenti usa 8080 di default
PORT=${1:-8080}

echo "Avvio del server 4AD Companion..."
echo "Disponibile all'indirizzo: http://localhost:$PORT"
echo "Premi Ctrl+C per fermare il server."
echo ""

python3 -m http.server $PORT
