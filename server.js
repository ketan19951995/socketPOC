const http = require('http')
const Queue = require('bull');
const express = require('express')
const app = express();
const server = http.createServer(http);
const socketio = require('socket.io')
const io = socketio(server)
const path = require('path')
app.use(express.static(path.join(__dirname, '../public')))


const processDataQueue = new Queue('processLargeData', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    }
});

let count = 0;

io.on('connection', () => {
    console.log('connected')

    // Send Event
    socket.emit('updatecount', count)

    // Listening the event and performing logic here 
    socket.on('increment', () => {
        console.log("called");
        count++;
        io.emit('updatecount', count)
    })

    // when a client disconnect this function is called 
    socket.on('disconnect', () => {
        console.log('server disconnected')
    })
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.post('/test', function (req, res) {
    let job = {
        "title": "test"
    }
    // adding a job to queue
    processDataQueue.add(job);
    res.send({ "message": "ok" })
});

// takes 5 minustes to complete
async function takesTimeToComplete(job) {
    console.log("inside this");
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`${job} done  `);
        }, 300)
    });
}

processDataQueue.process(async job => {
    //console.log("job is", job);
    await takesTimeToComplete(job);
    done();
});

processDataQueue.on('progress', (job, progress) => {
    console.log("inside this too");
    console.log(`Job progress with result ${job} ${progress}`);
    });


processDataQueue.on('completed', (job, result) => {
    console.log(`Job completed with result ${job}`);
  });

const PORT = 3000
app.listen(PORT, () => {
    console.log(`app is listening to PORT ${PORT}`)
})