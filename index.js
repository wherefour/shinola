var path = require('path');

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var yaml = require('js-yaml');

var shins = require('shins/index.js');
var shinsDir = path.join(__dirname, 'node_modules', 'shins')
var widdershins = require('widdershins');

var fetch = require('./fetch.js');
var wherefour_api = require('./wherefour-api.json');

function parseJSON(obj) {
	try {
		return JSON.parse(obj);
	}
	catch (ex) {
		return null;
	}
}
function parseYAML(obj) {
	try {
		return yaml.safeLoad(obj);
	}
	catch (ex) {
		return null;
	}
}

var app = express();
app.use(compression());
app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.sendCustomMessage = function(message) {
		res.send('<html><h1>' + message);
	};
	next();
});

app.options('*',function(req,res,next){
	res.set('Access-Control-Allow-Origin',req.headers['origin']||'*');
	res.set('Access-Control-Allow-Methods','GET, POST, HEAD, OPTIONS');
	res.set('Access-Control-Allow-Headers',req.headers['access-control-request-headers']||
		'Content-Type, Authorization, Content-Length, X-Requested-With');
	res.sendStatus(204);
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'index.html'))
});
// app.get('/shins', function(req, res) {
// 	if (!req.query.url) {
// 		return res.sendCustomMessage('Please supply a URL parameter');
// 	}
// 	fetch.get(req.query.url, {}, {}, function (err, resp, obj) {
// 		if (err || !obj) {
// 			return res.status(500).sendCustomMessage('Could not fetch the given URL');
// 		}
// 		shins.render(obj, function(err, str){
// 			res.send(str);
// 		});
// 	});
// });
// app.post('/openapi', function(req, res) {
// 	var obj = req.body;
// 	res.set('Access-Control-Allow-Origin','*');
// 	if (typeof obj !== 'object') {
// 		console.log(typeof obj);
// 		return res.status(500).sendCustomMessage('Could not parse the request body');
// 	}
// 	var options = {};
// 	var md = widdershins.convert(obj, options, function(err, md){
// 		if (err) console.log(JSON.stringify(err));
// 		if (typeof req.query.raw !== 'undefined') {
// 			res.set('Content-Type','text/plain');
// 			res.send(md);
// 		}
// 		else {
// 			shins.render(md, function (err, str) {
// 				res.set('Content-Type','text/html');
// 				res.send(str);
// 			});
// 		}
// 	});
// });
app.get('/openapi', function(req, res) {
	var obj = wherefour_api;
	var options = {};
	options.loadedFrom = 'localhost/openapi';
	res.set('Access-Control-Allow-Origin','*');
	widdershins.convert(obj, options, function(err, md) {
		if (typeof req.query.raw !== 'undefined') {
			res.send(md);
		}
		else {
			shins.render(md, function (err, str) {
				res.send(str);
			});
		}
	});

	// fetch.get(req.query.url, {}, {}, function (err, resp, data) {
	// 	if (err) {
	// 		return res.status(404).sendCustomMessage('Could not fetch the given URL');
	// 	}
	// 	var obj = parseJSON(data) || parseYAML(data);
	// 	if (!obj) {
	// 		return res.status(404).sendCustomMessage('Could not parse the data');
	// 	}
	// 	var options = {};
	// 	options.loadedFrom = req.query.url;
	// 	res.set('Access-Control-Allow-Origin','*');
	// 	widdershins.convert(obj, options, function(err, md) {
	// 		if (typeof req.query.raw !== 'undefined') {
	// 			res.send(md);
	// 		}
	// 		else {
	// 			shins.render(md, function (err, str) {
	// 				res.send(str);
	// 			});
	// 		}
	// 	});
	// });
});
app.use('/source/images/logo.png', express.static(path.join(__dirname, 'source', 'images', 'logo.png')));
app.use("/", express.static(shinsDir));

var myport = process.env.PORT || 5678;
if (process.argv.length > 2)
	myport = process.argv[2];

var server = app.listen(myport, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Shinola server listening at http://%s:%s', host, port);
});
