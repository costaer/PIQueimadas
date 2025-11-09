# PIQueimadas
Projeto Integrador IV UNIVESP 2025 - Projeto de prevenção de queimadas

## Resumo do Notebook

O notebook documenta as etapas iniciais de um projeto para desenvolver uma API de previsão de risco de queimadas. O trabalho realizado incluiu:

1.  **Coleta e Unificação de Dados:** Dados meteorológicos (INMET e CIIAGRO) e de focos de queimada (INPE) foram coletados e unificados em um único conjunto de dados temporal e espacialmente alinhado.
2.  **Tratamento e Análise Exploratória:** Os dados foram limpos, valores ausentes tratados, e realizada análise exploratória (EDA) com visualizações para entender as relações entre variáveis meteorológicas e a ocorrência de queimadas. Foi identificado um forte desequilíbrio de classes.
3.  **Divisão Estratificada:** O dataset foi dividido em conjuntos de treino e teste de forma estratificada por cidade e ocorrência de queimada para garantir representatividade.
4.  **Modelagem e Avaliação:** Dois modelos de classificação (Random Forest e XGBoost) foram treinados e avaliados para prever o risco de queimada, utilizando técnicas de balanceamento de classes (SMOTE).
5.  **Seleção do Modelo:** Com base nas métricas de avaliação, especialmente o Recall (capacidade de detectar queimadas reais), o modelo Random Forest foi selecionado como o mais promissor para a aplicação.
6.  **Serialização:** O modelo Random Forest treinado e o scaler de pré-processamento foram salvos para uso em produção.
7.  **Conversão do modelo:** O modelo foi convertido para ONNX a fim de ser usado em outras aplicação que não usam python.

As análises confirmaram que variáveis como umidade relativa, temperatura e ponto de orvalho são preditores importantes para o risco de queimadas.

Este notebook serve como a fundação para o desenvolvimento da API de previsão.

## Utilização do modelo em produção

Arquivos necessários:

seu-projeto/

├── modelo_random_forest.onnx      # Modelo convertido para ONNX

└── scaler_info.json               # Configurações do pré-processamento

## Configuração do ambiente
 *  COMO USAR O MODELO NO SEU PROGRAMA:
 * 
 * 1. COPIE ESTES ARQUIVOS para a pasta do seu projeto:
 *    - modelo_random_forest.onnx
 *    - scaler_info.json
 * 
 * 2. INSTALE OS PACOTES NECESSÁRIOS na pasta do seu projeto:
 *    npm init -y
 *    npm install onnxruntime-node
 * 
 * 3. NO SEU CÓDIGO, SIGA ESTES PASSOS:
 *    
 *    // PEGAR A FERRAMENTA: Importa a classe que faz as previsões
 *    const QueimadasPredictor = require('./modelo_predictor.js');
 *    
 *    // CRIAR UMA NOVA FERRAMENTA: Faz uma instância para usar
 *    const predictor = new QueimadasPredictor();
 *    
 *    // CARREGAR O MODELO: Pega o modelo do arquivo e prepara para uso
 *    // (Isso é feito uma vez no início do programa)
 *    await predictor.loadModel();
 *    
 *    // COLOCAR OS DADOS: Prepare os dados da estação meteorológica
 *    // Na ordem correta: [chuva, pressão, temperatura, orvalho, umidade, vento, sol]
 *    const dados = [0.0, 943.2, 29.2, 12.7, 36.0, 0.6, 88.6];
 *    
 *    // FAZER A PREVISÃO: Envia os dados para o modelo e recebe a resposta
 *    const resultado = await predictor.predict(dados);
 *    
 *    // USAR O RESULTADO: Veja o que o modelo calculou
 *    console.log('Chance de ter queimada:', resultado.probabilidade_queimada);
 *    console.log('Em porcentagem:', (resultado.probabilidade_queimada * 100).toFixed(2) + '%');
 *    console.log('Situação:', resultado.classe === 1 ? 'TEM QUEIMADA' : 'NÃO TEM QUEIMADA');

# Envio de dados para o modelo

**Formato do envio dos dados**
dados: [0.0, 943.2, 29.2, 12.7, 36.0, 0.6, 88.6]

  "precipitacao": 0.0,
  "pressaoatmosferica": 943.2,
  "temperatura": 29.2,
  "temperaturapontodeorvalho": 12.7,
  "umidaderelativadoar": 36.0,
  "velocidadedovento": 0.6,
  "radiacaosolar": 88.6

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
|---------------------------|--------|---------------------------------------------|

## Tratando os dados de retorno

**Resultado bruto do modelo**
const resultado = await predictor.predict(dados);

**Converter probabilidade para porcentagem**
const porcentagem = (resultado.probabilidade_queimada * 100).toFixed(2) + '%';

**Ezemplo para classificar o nível de risco**
function classificarRisco(probabilidade) {
    if (probabilidade > 0.7) return 'ALTO';
    if (probabilidade > 0.4) return 'MÉDIO';
    return 'BAIXO';
}
const nivel_risco = classificarRisco(resultado.probabilidade_queimada);

# Arquivos Codigo_implementacao.js e teste_modelo.js
Esses arquivos são exemplos de como utilizar os arquivos de modeloagem gerados na conversão do modelo Python.

# Releases / arquivos compactados

## Arquivos compactados dos modelos
Os arquivos compactados Modelo, Modelo JS e Modelo Python são pastas com o modelo já treinado.
Modelo.tar.gz = os dois modelos, tanto python quanto o JS
Modelo_Python.tar.gz tem apenas o modelo em Python
Modelo_JS.tar.gz tem apenas o modelo convertido para ONNX

O arquvo Teste_js_no_node_modules.tar.gz tem arquivos de teste, porém sem o node_modules
- Para instalar é encessário 'npm install'

Como extrair
-----------
No diretório onde você quer testar:

```bash
# Extrair o exemplo Node.js
tar -xzf releases/Teste_js_no_node_modules.tar.gz -C ./teste_local

# Extrair o pacote do modelo
tar -xzf releases/Modelo.tar.gz -C ./modelo_local
```
