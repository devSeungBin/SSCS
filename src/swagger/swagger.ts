import swaggerAutogen from "swagger-autogen";
import path from "path";

const doc = {
    info: {
        titile: 'API 문서',
        description: 'API 문서 자동화 테스트',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        }
    ],
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT'
        }
    },
}

const outputFile = path.join(__dirname, '../swagger.json');
const endpointFiles = [path.join(__dirname, '../routers/*.ts')];

swaggerAutogen(outputFile, endpointFiles, doc);