import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API documentation for your project",
        },
        servers: [
            {
                url: "http://localhost:3000/api", // Update based on your environment
            },
        ],
    },
     apis: ["./src/modules/**/routes/*.route.js"], // Ensure this matches your file structure

};
// userRouter
const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
