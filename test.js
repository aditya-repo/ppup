const puppeteer = require('puppeteer');
const path = require('path');
const convertToJson = require('./mysql');
const submitForm = require('./form');

// Import the data from database to memory
const jsonDataPromise = convertToJson();

jsonDataPromise.then(data => {
    // Launch workers
    launchWorkers(data)
        .then(() => console.log('All form submissions completed successfully'))
        .catch(error => console.error('Error submitting forms:', error));
}).catch(error => {
    console.error(error);
});

// Form process
submitForm(browser, form)



// Function to process a batch of forms
async function processForms(browser, forms) {
    for (const form of forms) {
        await submitForm(browser, form);
    }
}


// Function to launch worker instance
async function launchWorker(workerId, forms) {
    const browser = await puppeteer.launch({ headless: false });
    console.log(`Worker ${workerId} started`);

    await processForms(browser, forms);

    // Close the browser
    await browser.close();
    console.log(`Worker ${workerId} finished`);
}


// Launch 5 worker instances
async function launchWorkers(forms) {
    const workers = [];
    for (let i = 0; i < 2; i++) {
        workers.push(launchWorker(i + 1, forms.slice(i * 5, (i + 1) * 5)));
    }
    await Promise.all(workers);
}
