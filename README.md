# PIQueimadas
Projeto Integrador IV UNIVESP 2025 - Projeto de prevenção de queimadas

## Resumo do Notebook

O notebook documenta as etapas iniciais de um projeto para desenvolver uma API de previsão de risco de queimadas. O trabalho realizado incluiu:

1.  **Coleta e Unificação de Dados:** Dados meteorológicos (INMET e CIIAGRO) e de focos de queimada (INPE) foram coletados e unificados em um único conjunto de dados temporal e espacialmente alinhado.
2.  **Tratamento e Análise Exploratória:** Os dados foram limpos, valores ausentes tratados, e realizada análise exploratória (EDA) com visualizações para entender as relações entre variáveis meteorológicas e a ocorrência de queimadas. Foi identificado um forte desequilíbrio de classes.
3.  **Divisão Estratificada:** O dataset foi dividido em conjuntos de treino e teste de forma estratificada por cidade e ocorrência de queimada para garantir representatividade.
4.  **Modelagem e Avaliação:** Dois modelos de classificação (Random Forest e XGBoost) foram treinados e avaliados para prever o risco de queimada, utilizando técnicas de balanceamento de classes (SMOTE).
5.  **Seleção do Modelo:** Com base nas métricas de avaliação, especialmente o Recall (capacidade de detectar queimadas reais), o modelo Random Forest foi selecionado como o mais promissor para a aplicação.
6.  **Serialização:** O modelo Random Forest treinado e o scaler de pré-processamento foram salvos para uso futuro na API.

As análises confirmaram que variáveis como umidade relativa, temperatura e ponto de orvalho são preditores importantes para o risco de queimadas.

Este notebook serve como a fundação para o desenvolvimento da API de previsão.
