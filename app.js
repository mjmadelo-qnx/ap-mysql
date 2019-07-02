const express = require('express');
const moment = require('moment');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || '4000';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require('dotenv').config()

db.connect()
  .then(data => data)
  .catch(error => error);

app.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
});


app.post('/', (req, res) => {
    res.json({ res: moment(req.body.gross_datetime)});
    // db.execute('INSERT INTO power SET ?', {
    //     ...req.body,
    //     gross_datetime: moment(req.body.gross_datetime, moment.ISO_8601),
    //     net_datetime: moment(req.body.net_datetime, moment.ISO_8601),
    //     created_date: moment(req.body.created_date, moment.ISO_8601)
    // })
    //     .then((data) => {
    //         return res.status(201).json({ message: "Successfully created."});
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         return res.status(500).json({ message: "Error encountered"});
    //     });
});

app.get('/', (req, res) => {
    db.execute('SELECT * from power')
        .then((data) => {
            if (data.length >0) {
                return res.status(201).json(data[0]);
            } else {
                return res.status(200).json({
                    message: "Empty data",
                    data: []
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Error encountered"});
        });
});
