const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const puppeteer = require('puppeteer')
const mysqlData = require('./mysql')
const submitForm = require('./form')
require('dotenv').config()

const THREAD_COUNT = process.env.THREAD

// Import the data from database to memory
const jsonDataPromise = mysqlData();

jsonDataPromise.then(data => {
    // Launch workers
    const forms = data;
    if (isMainThread) {
        const threadCount = THREAD_COUNT;
        launchWorkers(forms, threadCount);
    } else {
        const { workerId, forms } = workerData;
        // Initialize puppeteer inside the worker
        puppeteer.launch({ headless: false }).then(browser => {
            processData(forms, browser)
                .then(() => {
                    parentPort.postMessage({ workerId, message: 'Processed data successfully' });
                    browser.close(); // Close the browser after processing
                })
                .catch(error => {
                    console.error(`Error processing data in Worker ${workerId}:`, error);
                    parentPort.postMessage({ workerId, error });
                    browser.close(); // Close the browser on error
                });
        });
    }
}).catch(error => {
    console.error(error);
});

// Form process

// Simulate some CPU-intensive task
async function processData(forms, browser) {
    // Loop through each form and submit it
    for (const form of forms) {
        await submitForm(browser, form);
    }
}

async function launchWorker(workerId, forms) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: { workerId, forms } });

        worker.on('message', message => {
            console.log(`Worker ${workerId} processed data:`, message);
            resolve();
        });

        worker.on('error', error => {
            console.error(`Worker ${workerId} encountered an error:`, error);
            reject(error);
        });
    });
}

async function launchWorkers(forms, threadCount) {
    const workers = [];
    
    const dataCount = process.env.DATA_COUNT || forms.length

    const chunkSize = Math.ceil(dataCount / threadCount);

    for (let i = 0; i < threadCount; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, forms.length);
        const chunk = forms.slice(start, end);
        workers.push(launchWorker(i + 1, chunk));
    }

    await Promise.all(workers);
}
