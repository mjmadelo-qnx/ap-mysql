const express = require('express');
const router = express.Router();
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


router.post('/', (req, res) => {
    db.execute('INSERT INTO ap SET ?', {
        ...req.body,
        gross_datetime: moment(req.body.gross_datetime).format("YYYY-MM-DD hh:mm:ss"),
        net_datetime: moment(req.body.net_datetime).format("YYYY-MM-DD hh:mm:ss"),
        created_date: moment(req.body.created_date).format("YYYY-MM-DD hh:mm:ss")
    })
        .then(() => {
            return res.status(201).json({ message: "Successfully created.", data: req.body });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Error encountered"});
        });
});

router.get('/', (req, res) => {
    db.execute('SELECT * from ap')
        .then((data) => {
            if (data.length >0) {
                // delete data[0].id;
                return res.status(201).json(data);
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

router.get('/all', (req, res) => {
    let limit = parseInt(req.query.limit);
    db.execute(`SELECT * FROM ap ${(limit ? 'LIMIT ?': '')} `, limit)
        .then((data) => {
            if (data.length > 0) {
                return res.status(201).json({ 
                    data 
                });
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

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.execute('SELECT * from ap WHERE meterassignment_id = ?', id)
        .then((data) => {
            if (data.length > 0) {
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
app.use(router);
