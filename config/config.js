import Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  SQLSERVER_CONNECTION_STRING: Joi.string().required().description("SQL Server connection"),
  REDIS_CONNECTION_STRING: Joi.string().required().description("Redis Server connection"),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  sqlServerConnectionString: envVars.SQLSERVER_CONNECTION_STRING,
  redisConnectionString: envVars.REDIS_CONNECTION_STRING,
  port: envVars.PORT,
  env: envVars.NODE_ENV
};

export default config;
