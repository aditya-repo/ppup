const ac = require("@antiadmin/anticaptchaofficial");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const APIKEY = process.env.APIKEY;

async function getCaptchaText(id) {
    const captchaPath = path.join(__dirname, 'images', `${id}.png`);

    const captcha = fs.readFileSync(captchaPath, { encoding: 'base64' });

        const API_KEY = APIKEY;
        ac.setAPIKey(API_KEY);
        ac.setSoftId(0);
        // ac.set_verbose(0)

    return await ac.solveImage(captcha, true);
}

module.exports = getCaptchaText;
