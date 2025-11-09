/**
 *  COMO USAR O MODELO NO SEU PROGRAMA:
 * 
 * 1. COPIE ESTES ARQUIVOS para sua pasta do projeto:
 *    - modelo_random_forest.onnx
 *    - scaler_info.json
 * 
 * 2. INSTALE AS DEPENDÊNCIAS na pasta do seu projeto:
 *    npm init -y
 *    npm install onnxruntime-node
 * 
 * 3. IMPORTE E USE assim:
 *    const predictor = new QueimadasPredictor();
 *    await predictor.loadModel();
 *    const resultado = await predictor.predict(dados);
 */
// teste_modelo.js
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
            console.error('❌ Erro ao carregar modelo:', error);
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

// 🧪 TESTE NO MESMO FORMATO DO PYTHON
async function testarModelo() {
    console.log("🧪 INICIANDO TESTE DO MODELO DE QUEIMADAS - NODE.JS");
    console.log("=" .repeat(50));

    const predictor = new QueimadasPredictor();
    
    try {
        await predictor.loadModel();
        console.log("✅ Modelo e scaler carregados com sucesso!");
    } catch (e) {
        console.log(`❌ Erro ao carregar modelo: ${e}`);
        return;
    }

    // Dados de teste - EXATAMENTE OS MESMOS DO PYTHON
    const exemplos_teste = [
        {
            nome: "Caso 1 - Com queimada",
            dados: [0.0, 943.2, 29.2, 12.7, 36.0, 0.6, 88.6]
        },
        {
            nome: "Caso 2 - Com queimada", 
            dados: [0.0, 943.2, 29.2, 12.7, 36.0, 0.6, 88.6]
        },
        {
            nome: "Caso 3 - Com queimada",
            dados: [0.0, 943.6, 24.6, 19.7, 74.0, 3.0, -3.6]
        },
        {
            nome: "Caso 4 - Sem queimada",
            dados: [0.0, 940.3, 31.1, 16.6, 42.0, 2.8, 871.5]
        },
        {
            nome: "Caso 5 - Sem queimada",
            dados: [0.0, 941.4, 30.4, 17.0, 45.0, 1.8, 158.4]
        },
        {
            nome: "Caso 6 - Sem queimada",
            dados: [0.0, 942.7, 26.1, 16.6, 56.0, 2.4, 6.5]
        }
    ];

    for (const exemplo of exemplos_teste) {
        console.log(`\n📊 ${exemplo.nome}:`);
        console.log(`   Dados brutos: [${exemplo.dados.map(d => d.toFixed(1)).join(', ')}]`);
        
        try {
            // Fazer previsão (equivalente ao predict_proba do Python)
            const resultado = await predictor.predict(exemplo.dados);
            const porcentagem = resultado.probabilidade_queimada * 100;
            
            // FORMATO IDÊNTICO AO PYTHON:
            console.log(`   🔥 Resultado: ${resultado.probabilidade_queimada.toFixed(4)}`);
            console.log(`   📈 Probabilidade: ${porcentagem.toFixed(2)}%`);
            
        } catch (error) {
            console.log(`   ❌ ERRO: ${error}`);
        }
    }

    console.log("\n" + "=" .repeat(50));
    console.log("✅ TESTE CONCLUÍDO - NODE.JS");
}

// 🚀 Executar o teste
testarModelo().catch(console.error);