const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const cors = require('cors');
const taskRouter = require('./routes/EventsRoutes');
const authRouter = require('./routes/UserRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const teamRoute = require('./routes/teamRoutes')
const { initSocket } = require('./socket');
const cookieParser = require('cookie-parser');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

dbConnect();
initSocket(server);

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

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


