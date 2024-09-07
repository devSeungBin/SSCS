const swaggerAutogen = require("swagger-autogen");
const path = require("path");

// API 문서 자동화
const doc = {
    info: {
        titile: 'Plans Wizard\'s API docs',
        description: 'API 명세서',
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
const endpointFiles = [path.join(__dirname, '../routers/*.js')];

swaggerAutogen(outputFile, endpointFiles, doc);
