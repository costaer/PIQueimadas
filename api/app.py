from flask import Flask, request, jsonify
import pickle
import os
import numpy as np
import pandas as pd

app = Flask(__name__)

# Caminhos para o modelo e scaler – ajuste conforme sua estrutura
MODELO_PATH = os.path.join(os.path.dirname(__file__), "modelo", "modelo_random_forest.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "modelo", "scaler_random_forest.pkl")

# Carregar o modelo e o scaler
with open(MODELO_PATH, "rb") as f_model:
    modelo = pickle.load(f_model)

with open(SCALER_PATH, "rb") as f_scaler:
    scaler = pickle.load(f_scaler)

# Função de pré‑processamento dos dados recebidos
def preprocess_input(data: dict):
    # Variáveis esperadas (na ordem que o modelo foi treinado)
    vars_order = [
        "precipitacao",
        "pressaoatmosferica",
        "temperatura",
        "temperaturapontodeorvalho",
        "umidaderelativadoar",
        "velocidadedovento",
        "radiacaosolar"
    ]
    # Verificar presença das variáveis
    missing = [v for v in vars_order if v not in data]
    if missing:
        raise ValueError(f"Variáveis faltando: {missing}")
    # Extrair para array
    X_list = [data[v] for v in vars_order]
    X_arr = np.array(X_list, dtype=float).reshape(1, -1)
    # Aplicar scaler
    X_scaled = scaler.transform(X_arr)
    return X_scaled

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "JSON de entrada inválido"}), 400

        # Pré‑processar
        X_input = preprocess_input(data)

        # Prever probabilidade
        proba = modelo.predict_proba(X_input)[0, 1]  # classe “1” queimada
        proba_percent = float(proba * 100)

        return jsonify({"probabilidade_queimada_%": proba_percent})

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Erro interno no servidor", "details": str(e)}), 500

if __name__ == "__main__":
    # Para rodar localmente
    app.run(host="0.0.0.0", port=8000, debug=True)
