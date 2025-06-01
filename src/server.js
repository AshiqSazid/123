import app from "./index.js";
import chalk from "chalk";

// Set port and start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(chalk.green.bold(`Example app listening on port http://localhost:${PORT}!`));
});



