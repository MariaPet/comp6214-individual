const { Client } = require('pg');
const  DB_CONF  = require('./db-config')

const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use("/", express.static(__dirname + '/public'));

app.get('/api/aggregated', (req, res) => {
    var client = new Client(DB_CONF);
    client.connect(err => {
        if (err) {
            console.log(err.stack);
            return; 
        }
        client.query('Select * from aggregated_data where "Agency Name" like $1', ["%Department%"], (err, result) => {
            client.end();
            var fs = require('fs');
            if (err) {
                var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
                if (obj) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(obj);
                }
                else {
                    res.send('Error retrieving data');
                }
            }
            else {
                var dictstring = JSON.stringify(result.rows);
                fs.writeFile("data.json", dictstring);
                res.setHeader('Content-Type', 'application/json');
                res.send(result.rows);
            }
        });
    });  
});

app.listen(app.get('port'), () => console.log('App is listening to ' + app.get('port')));