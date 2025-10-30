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

## API de Previsão de Queimadas

- **Endpoint**
> POST /predict

### Descrição

A API recebe um conjunto de variáveis meteorológicas e retorna a probabilidade, em %, de ocorrência de queimadas com base nas condições informadas. Qualquer linguagem de programação que suporte requisições HTTP (POST + JSON) pode integrar este serviço.

**Formato da Requisição (JSON)**
{
  "precipitacao": 0.0,
  "pressaoatmosferica": 1013.25,
  "temperatura": 32.5,
  "temperaturapontodeorvalho": 18.3,
  "umidaderelativadoar": 25.0,
  "velocidadedovento": 5.2,
  "radiacaosolar": 1200.0
}
### Parâmetros
#### Variáveis de Entrada do Modelo

O modelo treinado espera receber os seguintes dados meteorológicos como entrada para prever o risco de queimada. É fundamental que os dados de entrada estejam nas mesmas unidades e formato das variáveis usadas durante o treinamento:
| Campo                     | Tipo   | Descrição                                   |
|---------------------------|--------|---------------------------------------------|
| precipitacao              | float  | Quantidade de precipitação recente (mm)     |
| pressaoatmosferica        | float  | Pressão atmosférica (mB)                    |
| temperatura               | float  | Temperatura do ar (°C)                      |
| temperaturapontodeorvalho | float  | Temperatura do ponto de orvalho (°C)        |
| umidaderelativadoar       | float  | Umidade relativa do ar (%)                  |
| velocidadedovento         | float  | Velocidade do vento (m/s)                   |
| radiacaosolar             | float  | Radiação solar incidente (Kj/m²)            |

**Nota** *Radiação Global (Kj/m²) - Nota: Dados do CIIAGRO foram convertidos de W/m² para Kj/m² (multiplicado por 3.6) para unificação.*
**Importante:** *Todas as variáveis acima devem estar presentes na requisição. Se alguma faltar, a API retorna 400 Bad Request.*

**Formato da Resposta (JSON)**
{
  "probabilidade_queimada_%": 47.3
}


probabilidade_queimada_% (float) – Chance estimada de ocorrência de queimada, em porcentagem.

### Respostas de Erro
Código	Situação	Exemplo de resposta
400	JSON inválido ou variável ausente	{ "error": "Variável 'umidaderelativadoar' faltando" }
500	Erro interno no servidor	{ "error": "Erro interno no servidor", "details": "..."}

### Como Utilizar
- Clone o repositório e instale as dependências (por exemplo via requirements.txt).
- Coloque o modelo treinado e o scaler no diretório conforme o código da API.
- Execute o servidor da API (exemplo: python app.py).
- Realize chamadas POST para http://<servidor>:<porta>/predict enviando JSON conforme o formato acima.
- Receba o valor de percentagem e use-o em seu aplicativo ou sistema de monitoramento.