const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Simulate some CPU-intensive task
function processData(formData) {
    // Simulate some CPU-intensive task
    return formData.map(form => form * 2);
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

async function launchWorkers(forms) {
    const workers = [];

    for (let i = 0; i < 2; i++) {
        const chunk = forms.slice(i * 5, (i + 1) * 5);
        workers.push(launchWorker(i + 1, chunk));
    }

    await Promise.all(workers);
}

if (isMainThread) {
    const forms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    launchWorkers(forms);
} else {
    const { workerId, forms } = workerData;
    const processedData = processData(forms);
    parentPort.postMessage({ workerId, processedData });
}
