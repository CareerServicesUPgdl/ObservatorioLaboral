const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function getQS(spreadsheetId, range) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    
    return response.data.values;
}

module.exports = { getQS };