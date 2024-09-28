const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const cors = require('cors');
const { initSocket } = require('./socket');
const cookieParser = require('cookie-parser');
const http = require('http');
const bodyParser = require('body-parser');
const notificationRoutes = require('./routes/notificationRoutes.js');
dotenv.config();

const app = express();
const server = http.createServer(app);

dbConnect();
initSocket(server);

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ];
  const corsOptions = {
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'Set-Cookie'],
  };
  app.use(cors(corsOptions));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/notifications', notificationRoutes);  
app.use('/api/events', require('./routes/EventsRoutes'));
app.use('/api/', require('./routes/UserRoutes'));

app.get('/health-check', (req, res) => {
    return res.send("Server is On");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


