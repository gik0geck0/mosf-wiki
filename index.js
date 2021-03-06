// Load Configs
const loadEnv = require('node-env-file');
const fs = require('fs');
if (fs.existsSync(__dirname + '/.env')) {
	loadEnv(__dirname + '/.env');
}
const config = {
	port: process.env.PORT || 8095,
	db: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		database: process.env.DB_DATABASE
	}
};

const express = require('express');
const app = express();

const { Client } = require('pg');
const db = new Client(config.db);

function wclib() {
    return "<script>" +
        fs.readFileSync(__dirname + '/lib/js/wclib.js') +
        "</script>";
}

function a(label, url) 	{ return "<a href=\"" + url + "\">" + label + "</a>"; }
function div(b) 	{ return tag("div", b); }
function h1(b)		{ return tag("h1", b); }
function html(b) 	{ return "<html><head>" + wclib() + "<title>Buland Wiki</title></head><body>" + b+ "</body></html>"; }
function td(b)		{ return tag("td", b); }
function th(b)		{ return tag("th", b); }
function tr(b)		{ return tag("tr", b); }
function table(b)	{ return tag("table", b); }
function tag(tagName, content) { return "<" + tagName + ">" + content + "</" + tagName + ">"; }
function wcimport(cmpname)  { return "<link rel='import' href='/components/" + cmpname + ".html'>"; }

db.connect((dbErr) => {
	if (dbErr) {
		console.error('connection error', dbErr.stack);
		return;
	}
	console.log("Connected to db!");

	app.get('/', (req, res) => {
		res.send(html(
			div(
				a("List", "/list")
			)
		));
	});

	app.get('/list', (req, res) => {
		db.query("SELECT id, title FROM Page").then((data) => {
			console.log("Have data!");
			const view = 
				table(
					tr(
						th("URL") +
						th("Title")
					) +
					data.rows.map((row) => {
						return tr(
							td(a(row.id, "/page/" + row.id)) +
							td(row.title)
						);
					}).join("")
				);
			res.send(html(view));
		});
	});

	app.post('/page/:pageName', (req, res) => {
		db.query({
			name: "insert-page",
			text: "INSERT INTO Page ( title ) VALUES ( $1::text )",
			values: [ req.params.pageName ],
			rowMode: 'array'
		}).then((result) => {
			console.log("Result from save: " + JSON.stringify(result));
			res.send("SUCCESS");
		});
	});

	app.get('/page/:pageId', (req, res) => {
		db.query("SELECT id, title FROM Page where Page.id = $1 LIMIT 1",
			[ req.params.pageId ]
		).then((data) => {
			res.send(html(h1(data.rows[0].title)));
		});
	});

    app.get('/wc', (req, res) => {
        res.send(html(
            wcimport("test-cmp") +
            tag("test-cmp")
        ));
    });

    app.get('/wc/list', (req, res) => {
        res.send(html(
            wcimport("page-list") +
            tag("page-list")
        ));
    });

    app.get('/components/:cmpname.html', (req, res) => {
        const cmpName = req.params.cmpname;
        const cmpDir = __dirname + '/components/' + cmpName;
        if (fs.existsSync(cmpDir)) {
            fs.readFile(cmpDir + '/' + cmpName + '.html', (err, data) => {
                if (err) {
                    throw err;
                }
                res.type("html");
                res.send(data);
            });
        } else {
            console.log("Component " + cmpName + " doesn't exist");
            res.status(404);
        }
    });

	app.listen(config.port, () => console.log("Listening on port " + config.port));
});
