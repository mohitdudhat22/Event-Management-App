const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const cors = require('cors');
const taskRouter = require('./router/EventsRoutes');
const authRouter = require('./router/UserRoutes');
const notificationRoutes = require('./router/notificationRoutes');
const teamRoute = require('./router/teamRoutes')
const { initSocket } = require('./socket');
const http = require('http');
const cronJobs = require('./cronJobs');
dotenv.config();

const app = express();
const server = http.createServer(app);

dbConnect();
cronJobs();
initSocket(server);

app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use('/api/events', require('./routes/events'));
app.use('/api/users', authMiddleware, require('./routes/users'));

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


