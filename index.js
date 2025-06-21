import http from 'http'
import path from 'path'
import { spawn } from 'child_process'
import express from 'express'
import { Server as SocketIO } from 'socket.io'

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    'rtmp://a.rtmp.youtube.com/live2/',
];

let ffmpegProcess = spawn('ffmpeg', options);

// Log stdout and stderr from ffmpeg for debugging
ffmpegProcess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
});

ffmpegProcess.stderr.on('data', (data) => {
    console.error(`ffmpeg stderr: ${data}`);
});

ffmpegProcess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
});

ffmpegProcess.on('exit', (code, signal) => {
    console.log(`ffmpeg exited with code ${code}, signal: ${signal}`);
});

ffmpegProcess.on('error', (err) => {
    console.error('ffmpeg process error:', err);
});

// Handle EPIPE or stdin errors
ffmpegProcess.stdin.on('error', (err) => {
    if (err.code === 'EPIPE') {
        console.error('ffmpeg stdin: Broken pipe (EPIPE) - likely tried to write after it was closed.');
    } else {
        console.error('ffmpeg stdin error:', err);
    }
});

app.use(express.static(path.resolve('./public')));

io.on('connection', socket => {
    console.log('Socket Connected', socket.id);

    socket.on('binarystream', stream => {
        console.log('Binary Stream Incoming...');
        if (ffmpegProcess.stdin.writable && !ffmpegProcess.stdin.destroyed) {
            ffmpegProcess.stdin.write(stream, (err) => {
                if (err) {
                    console.error('Error writing to ffmpeg stdin:', err);
                }
            });
        } else {
            console.warn('Attempted to write to closed ffmpeg stdin.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => console.log(`HTTP Server is running on PORT 3000`));


