const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', socket => {
    console.log('Client connected');


    socket.on('code-update', code => {

        socket.broadcast.emit('code-update', code);
    });


    socket.on('cursor-move', cursor => {

        socket.broadcast.emit('cursor-move', cursor);
    });


    socket.on('compile', code => {
        const fs = require('fs');
        const fileName = 'temp.py';
        fs.writeFileSync(fileName, code);


        exec(`python ${fileName}`, (error, stdout, stderr) => {
            fs.unlinkSync(fileName);

            if (error) {
                console.error(`Error: ${error.message}`);
                socket.emit('compile-result', `Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('compile-result', `stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('compile-result', `Output: ${stdout}`);
        });
    });



    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
