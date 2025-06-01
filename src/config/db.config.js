import chalk from "chalk";
import * as env from "dotenv";
// import { Sequelize } from "sequelize";

import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';


env.config();


export const sequelize = new Sequelize({
    dialect: MySqlDialect,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 3306,
  });




