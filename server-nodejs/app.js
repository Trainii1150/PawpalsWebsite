// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserRoutes = require('./routes/Userroutes');
const adminRoutes = require('./routes/Adminroutes');
const AuthRoutes = require('./routes/AuthRoutes');
const startGraphQLServer = require('./graphqlService'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/admin', adminRoutes);


startGraphQLServer(app, port).catch((error) => {
  console.error('Error starting the server:', error);
});
