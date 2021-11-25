import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import path from 'path';

const port = 3000;
const io: socketio.Server = new socketio.Server()
const app: express.Application = express();
const server: http.Server = http.createServer(app);

io.attach(server, {cors: { origin: '*' }});

const sockets = new Map<string, socketio.Socket>();

io.on("connection", (socket) => {
    sockets.set(socket.id, socket);

    socket.on("voiceData", (data) => {
        //console.log("received voice data");

        var newData = data.split(";");
        newData[0] = "data:audio/ogg;";
        newData = newData[0] + newData[1];

        Array.from(sockets.values()).map(s => {
            s.emit("voiceData", {id: socket.id, data: newData})
        })

    })

    socket.on("disconnect", () => {
        sockets.delete(socket.id)
    })
})

app.set('view engine', 'ejs')

//app.use(cookieParser());
//app.use(bodyParser.json());

app.use(express.static(__dirname + "/../" + '/public'));

app.get('/', (req, res) => {
    res.render('home', {a: 123});
});

server.listen(3000, () => {
    console.log(`Listening at ${3000}`)
})

