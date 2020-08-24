const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION Shutting down server');
  console.log(`${err.name}:${err.message}`);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log(con.connection);
    console.log('DataBase is connected');
  });

//Server
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('Server is running!!');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION Shutting down server');
  console.log(`${err.name}:${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved shutting down server');
  server.close(() => {
    console.log('Process terminated');
  });
});
