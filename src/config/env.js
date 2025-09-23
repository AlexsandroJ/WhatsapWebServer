// src/config/env.js
require('dotenv').config();

const env = {
    API_URL: process.env.API_URL || 'http://localhost:3000',
    TOKEN: process.env.TOKEN || '',
    USERID: process.env.USERID || '',
};

module.exports = env;