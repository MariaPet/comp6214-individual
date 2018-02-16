const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use("/", express.static(__dirname + '/public'));

app.get('/api/test', (req, res) => res.send('Data visualisation with D3'));

app.listen(app.get('port'), () => console.log('App is listening to 5000'));