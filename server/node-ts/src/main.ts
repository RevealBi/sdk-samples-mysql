import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

import { createRevealMiddleware } from './reveal';
import { setupRevealDomRoutes } from './revealdom';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5111;

// Middleware
app.use(cors()); 
app.use("/images/png", express.static("images/png"));
app.use("/images/svg", express.static("images/svg"));
app.use(express.static(path.join(process.cwd())));

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Reveal BI MySQL API',
            version: '1.0.0',
            description: 'API for interacting with Reveal BI dashboards using MySQL data sources',
            contact: {
                name: 'API Support',
                url: 'https://www.infragistics.com/support',
                email: 'support@infragistics.com'
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server'
            }
        ],
        tags: [
            {
                name: 'Dashboards',
                description: 'Dashboard management endpoints'
            },
            {
                name: 'Data Sources',
                description: 'Data source management endpoints'
            }
        ]
    },
    apis: ['./src/revealdom.ts'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Reveal BI MySQL API Documentation",
    customfavIcon: "/images/png/favicon.png"
}));
app.get('/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

// Use the routes from revealDom
setupRevealDomRoutes(app);

// Use the Reveal SDK middleware
app.use("/", createRevealMiddleware());  

// Start the server
app.listen(port, () => {
    console.log(`Reveal server accepting http requests on port ${port}`);
});
