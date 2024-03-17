require('dotenv').config()

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASS,
    database: process.env.DBHOST
});

// Function to connect to MySQL and fetch form data
const fetchFormData = () => {
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query('SELECT * FROM semesterdata where college = 401 limit 1', (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
            connection.end();
        });
    });
}

// Convert fetched data to JSON object
const convertToJson = async () => {
    try {
        const results = await fetchFormData();
        const jsonData = results.map((row, index) => {
            return {
                id : index+1,
                admissionID: row.admissionID,
                dob: dateFormat(row.dob),
                passwordstring: toTitleCase(row.passwordstring),
                session: row.session,
                mobile: row.mobile,
                email: row.email,
                // Add more properties as needed
            };
        });
        console.log(jsonData);
        return jsonData; // Return the JSON data
    } catch (error) {
        console.error(error);
        return null; // Return null in case of error
    }
};

function toTitleCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function dateFormat(dateString) {
    // Split the date string into day, month, and year parts
    const parts = dateString.split('/');

    // Rearrange the parts to form the desired format
    const formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;

    return formattedDate;
}
// convertToJson()
module.exports = convertToJson;
