/**
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
 */

// teste_modelo_variaveis.js
const ort = require('onnxruntime-node');
const fs = require('fs');

class QueimadasPredictor {
    constructor() {
        this.session = null;
        this.scalerInfo = null;
        this.isLoaded = false;
    }

    async loadModel(modelPath = './modelo_random_forest.onnx', scalerPath = './scaler_info.json') {
        try {
            this.session = await ort.InferenceSession.create(modelPath);
            const scalerData = fs.readFileSync(scalerPath, 'utf8');
            this.scalerInfo = JSON.parse(scalerData);
            this.isLoaded = true;
        } catch (error) {
            console.error('Erro ao carregar modelo:', error);
            throw error;
        }
    }

    scaleFeatures(features) {
        if (!this.scalerInfo) {
            throw new Error('Scaler não carregado');
        }

        if (features.length !== this.scalerInfo.n_features) {
            throw new Error(`Número de features incorreto. Esperado: ${this.scalerInfo.n_features}, Recebido: ${features.length}`);
        }

        return features.map((feature, index) => {
            return (feature - this.scalerInfo.mean[index]) / this.scalerInfo.scale[index];
        });
    }

    async predict(features) {
        if (!this.isLoaded) {
            await this.loadModel();
        }

        try {
            const scaledFeatures = this.scaleFeatures(features);
            const tensor = new ort.Tensor('float32', Float32Array.from(scaledFeatures), [1, scaledFeatures.length]);

            const inputName = this.session.inputNames[0];
            const feeds = { [inputName]: tensor };
            const results = await this.session.run(feeds);

            const predictionLabel = Number(results['label'].data[0]);
            const predictionProbabilities = Array.from(results['probabilities'].data);
            
            return {
                classe: predictionLabel,
                probabilidades: predictionProbabilities,
                probabilidade_queimada: predictionProbabilities[1],
                rawFeatures: features,
                scaledFeatures: scaledFeatures
            };

        } catch (error) {
            console.error('Erro na predição:', error);
            throw error;
        }
    }
}

// TESTE COM VARIÁVEIS INDIVIDUAIS
async function testarModeloComVariaveis() {
    console.log("TESTE DO MODELO COM VARIÁVEIS INDIVIDUAIS");
    console.log("=" .repeat(50));

    const predictor = new QueimadasPredictor();
    
    try {
        await predictor.loadModel();
        console.log("Modelo carregado com sucesso!\n");
    } catch (e) {
        console.log(`Erro ao carregar modelo: ${e}`);
        return;
    }

    // ==================================================
    // AQUI VOCÊ COLOCA SUAS VARIÁVEIS DE ENTRADA
    // ==================================================
    const precipitacao = 0.0;
    const pressaoatmosferica = 943.2;
    const temperatura = 29.2;
    const temperaturapontodeorvalho = 12.7;
    const umidaderelativadoar = 36.0;
    const velocidadedovento = 0.6;
    const radiacaosolar = 88.6;

    // Juntar todas as variáveis na ordem correta para o modelo
    const dadosEntrada = [
        precipitacao,
        pressaoatmosferica,
        temperatura,
        temperaturapontodeorvalho,
        umidaderelativadoar,
        velocidadedovento,
        radiacaosolar
    ];

    // PROCESSAR NO MODELO
    const resultado = await predictor.predict(dadosEntrada);

    // ==================================================
    // AQUI SAI A VARIÁVEL DE RETORNO COM O RESULTADO
    // ==================================================
    const probabilidadeQueimada = resultado.probabilidade_queimada;
    const classeResultado = resultado.classe === 1 ? 'QUEIMADA' : 'NÃO QUEIMADA';

    // ==================================================
    // AQUI VOCÊ TRATA A VARIÁVEL DE RETORNO COMO QUISER
    // ==================================================
    
    // Exemplo 1: Converter para porcentagem
    const porcentagemQueimada = (probabilidadeQueimada * 100).toFixed(2) + '%';
    
    // Exemplo 2: Classificar o nível de risco
    let nivelRisco;
    if (probabilidadeQueimada > 0.7) {
        nivelRisco = 'ALTO';
    } else if (probabilidadeQueimada > 0.4) {
        nivelRisco = 'MÉDIO';
    } else {
        nivelRisco = 'BAIXO';
    }
    
    // Exemplo 3: Criar mensagem personalizada
    const mensagemAlerta = probabilidadeQueimada > 0.7 ? 
        '⚠️ ALERTA: Risco elevado de queimada!' : 
        '✅ Situação sob controle';

    // EXIBIR VARIÁVEIS DE ENTRADA E SAÍDA
    // Esse ponto foi usado para testes apenas, não tem rezão para colocar em produção
    console.log("VARIÁVEIS DE ENTRADA:");
    console.log(`   Precipitação: ${precipitacao} mm`);
    console.log(`   Pressão Atmosférica: ${pressaoatmosferica} mB`);
    console.log(`   Temperatura: ${temperatura} °C`);
    console.log(`   Temperatura Ponto de Orvalho: ${temperaturapontodeorvalho} °C`);
    console.log(`   Umidade Relativa do Ar: ${umidaderelativadoar} %`);
    console.log(`   Velocidade do Vento: ${velocidadedovento} m/s`);
    console.log(`   Radiação Solar: ${radiacaosolar} Kj/m²`);

    console.log("\n VARIÁVEIS DE SAÍDA:");
    console.log(`   Probabilidade de Queimada: ${probabilidadeQueimada}`);
    console.log(`   Classe: ${resultado.classe} (${classeResultado})`);
    
    console.log("\nTRATAMENTO DO RESULTADO:");
    console.log(`   Porcentagem: ${porcentagemQueimada}`);
    console.log(`   Nível de Risco: ${nivelRisco}`);
    console.log(`   Mensagem: ${mensagemAlerta}`);
    console.log(`   Todas as Probabilidades: [${resultado.probabilidades[0].toFixed(4)}, ${resultado.probabilidades[1].toFixed(4)}]`);

    console.log("\n" + "=" .repeat(50));
    console.log("TESTE CONCLUÍDO");
}

// 🚀 Executar o teste
testarModeloComVariaveis().catch(console.error);