var amqp = require('amqp');
var mysql = require('./util/mysql');
var adminService = require('./services/adminService');
var alertService = require('./services/alertService');
var buildingService = require('./services/buildingService');
var clientService = require('./services/clientService');
var guardService = require('./services/guardService');
var reportService = require('./services/reportService');
	
//DB Pool Initilization
mysql.createConnPool();

var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
	console.log("WFMS-Server listening on service queues");
	
	//Admin Service
	cnn.queue('admin_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			adminService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});
	
	//Alert Service
	cnn.queue('alert_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			alertService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//building Service
	cnn.queue('building_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			buildingService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//client Service
	cnn.queue('client_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			clientService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//guard Service
	cnn.queue('guard_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			guardService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//report Service
	cnn.queue('report_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			reportService.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

});

function logQueueReq(message, headers, deliveryInfo, m){
	console.log("Message: "+JSON.stringify(message));
	console.log("Headers: "+JSON.stringify(headers));
	console.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
}

function publishQueue(conn,m,response){
	console.log("----------------------------------");
	console.log("Publishing To \nQueue: "+m.replyTo + "\nResponse:" + JSON.stringify(response));
	console.log("----------------------------------");
	conn.publish(m.replyTo, response, {
		contentType:'application/json',
		contentEncoding:'utf-8',
		correlationId:m.correlationId
	});
}