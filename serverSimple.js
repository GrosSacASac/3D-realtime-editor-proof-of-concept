const app = require('express')();
app.get('/', (req, res) => {
    res.send('Welcome Luxembourg');
});
app.listen();