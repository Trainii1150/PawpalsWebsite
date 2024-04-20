const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authUser = require('./routes/Userroutes');
//import { rateLimit } from 'express-rate-limit'

const app = express();
const port = process.env.PORT || 3000;

/*const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // หน่วยเวลาเป็น มิลลิวินาที ในนี้คือ 15 นาที (1000 มิลลิวินาที = 1 วินาที)
    max: 100, // จำนวนการเรียกใช้สูงสุดต่อ IP Address ต่อเวลาใน windowMS
    standardHeaders: true, // คืน rate limit ไปยัง `RateLimit-*` ใน headers 
    legacyHeaders: false, // ปิด `X-RateLimit-*` ใน headers 
})*/

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(limiter);

app.use('/api/user', authUser);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});