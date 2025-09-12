import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

// Ação: Forçámos a região para 'us-east-2' para corresponder onde os seus recursos estão.
const REGION = "us-east-2";
const client = new SSMClient({ region: REGION });

// Nomes dos parâmetros que criamos no Parameter Store
const PARAMETER_NAMES = [
    '/ecomanager/DYNAMODB_TABLE_NAME',
    '/ecomanager/AWS_REGION',
    '/ecomanager/FIREBASE_SERVICE_ACCOUNT'
];

let config = null;

/**
 * Carrega a configuração da aplicação a partir do AWS Systems Manager Parameter Store.
 * Faz cache da configuração após o primeiro carregamento para evitar chamadas repetidas.
 */
async function loadConfig() {
    if (config) {
        return config;
    }

    try {
        console.log(`A carregar configuração do AWS Parameter Store na região: ${REGION}...`);
        const command = new GetParametersCommand({
            Names: PARAMETER_NAMES,
            WithDecryption: true // Essencial para desencriptar o segredo do Firebase
        });

        const { Parameters, InvalidParameters } = await client.send(command);

        if (InvalidParameters && InvalidParameters.length > 0) {
            throw new Error(`Parâmetros inválidos ou não encontrados: ${InvalidParameters.join(', ')}`);
        }

        const loadedConfig = {};
        Parameters.forEach(p => {
            const key = p.Name.split('/').pop();
            loadedConfig[key] = p.Value;
        });

        if (loadedConfig.FIREBASE_SERVICE_ACCOUNT) {
            loadedConfig.FIREBASE_SERVICE_ACCOUNT = JSON.parse(loadedConfig.FIREBASE_SERVICE_ACCOUNT);
        }

        console.log("Configuração carregada com sucesso do Parameter Store.");
        config = loadedConfig;
        return config;

    } catch (error) {
        console.error("ERRO CRÍTICO: Não foi possível carregar a configuração do AWS Parameter Store.", error);
        process.exit(1);
    }
}

export { loadConfig }; 

