const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authUser = require('./routes/Userroutes');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/user', authUser);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});