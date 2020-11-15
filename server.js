const cheerio = require('cheerio');
const request = require('request');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get('/scrape/:username', function(req, res) {
        const username = req.params.username;
        const url = "https://github.com/" + username;

        request(url, function(error, response, html) {
            const data = {};
            const $ = cheerio.load(html);

            $('g g').each(function(i, element) {
                data[i] = [];
                for (let j = 0; j < $(element).children().length; j++) {
                    data[i].push($(element).children().eq(j).attr('data-count'));
                }
            });
            return res.json(data);
        })
    }) //end app.get('/scrape')

app.listen(PORT, function() {
    console.log('App listening on PORT ' + PORT);
})