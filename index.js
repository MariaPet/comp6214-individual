const { Client } = require('pg');
const  DB_CONF  = require('./db-config')
const client = new Client(DB_CONF);
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use("/", express.static(__dirname + '/public'));

app.get('/api/aggregated', (req, res) => {
    client.connect();
    client.query('Select * from aggregated_data', (err, result) => {
        client.end();
        if (err) {
            res.send('Error retrieving data');
        }
        else {
            res.send(result.rows);
        }
    });
});

app.listen(app.get('port'), () => console.log('App is listening to 5000'));