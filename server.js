const express = require('express')
const app = express();
const http = require('http').Server(app);
const Queue = require('bull');
let io = require('socket.io')(http);
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')))


const processDataQueue = new Queue('processLargeData', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    }
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


io.on('connection', () => {
    console.log('connected')

    io.on('content', () => {
        // adding a job to queue
        processDataQueue.add(job);
     })

    // when a client disconnect this function is called 
    io.on('disconnect', () => {
        console.log('server disconnected')
    })
})



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/test', function (req, res) {
    let job = {
        "title": "test"
    }

    processDataQueue.add(job);
    res.send({ "message": "ok" })
});

console.log("process" , processDataQueue)
// takes 5 minustes to complete
async function takesTimeToComplete(job) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`${job} done  `);
        }, 30000)
    });
}

processDataQueue.process(async job => {
    //console.log("job is", job);
    let result =  await takesTimeToComplete(job);
    io.emit('content' , "success event");
    done();
    
});

http.listen(3000, function () {
    console.log('listening on localhost:3000');
});