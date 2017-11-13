'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');

exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;
	
	switch(operation){
		
		case "createClient" : 
			createClient(message,callback);
			break;

		case "updateClientBillingInfo" : 
			updateClientBillingInfo(message,callback);
			break;
			
		case "updateClient" :
			updateClient(message,callback);
			break;
			
		case "getClient" :
			getClient(message,callback);
			break;
			
		case "deleteClient" :
			deleteClient(message,callback);
			break;
			
		case "listAllClients" :
			listAllClients(message,callback);
			break;
			
			
		case "getClientInfo" :
			getClientInfo(message,callback);
			break;

		default : 
			callback({status : 400,message : "Bad Request"});
	}
};

// create client
function createClient(msg,callback){
	var formDate = moment(msg.start_date,'DD-MM-YYYY').toDate();
	var toDate = moment(msg.end_date,'DD-MM-YYYY').toDate();

	var queryParam = {
			idperson : msg.idperson,
			start_date : formDate,
			end_date : toDate,
			idclient : msg.idclient
	}

	mysql.queryDb("INSERT INTO client SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Client has been added Succesfully" });
		}
	});
}

// update Client Billing Info
function updateClientBillingInfo(msg,callback){
	mysql.queryDb("select (abs(DATEDIFF(building.release_date,building.start_date)))*building.no_of_guards*10 AS Amount_Due, building.idbuilding, building.no_of_guards, building.start_date, building.buildingname, building.release_date from wfms.building inner join wfms.client on building.idclient = client.idclient where ?? = ? AND ?? = 'Active';",['building.idclient',msg.idclient,'building.buildingstatus'],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, message : "Value is coming",result:rows });
		}
	});
}

//Update Client
function updateClient(msg,callback){
	var newParam ={
		start_date : moment(msg.start_date,'DD-MM-YYYY').toDate(),
		end_date : moment(msg.end_date,'DD-MM-YYYY').toDate()
	};
	mysql.queryDb("UPDATE client SET ? WHERE ?? = ?", 
		[newParam,'idperson',msg.idperson], 
		function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!" + err);
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Client has been updated Succesfully" });
		}
	});
}

/// get client
function getClient(msg,callback){
	mysql.queryDb('SELECT * FROM client WHERE ?',[{idperson:msg.idperson}],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
}

// Delete client
function deleteClient(msg,callback){
	var idperson = msg.idperson,
	idclient = msg.idclient,
	start_date = msg.start_date,
	end_date = msg.end_date;

	mysql.queryDb('DELETE FROM client WHERE ?',[{idperson:idperson}],function(err,response){
		if (err) {
			console.log("Error while deleting client details !!!" + err);
			callback({ status : 500, message : "Error while deleting client details !!!" });
		} else {
			callback({ status : 200, message : "Client details has been deleted Succesfully" });
		}
	});
}

//list all clients
function listAllClients(msg,callback){
	mysql.queryDb('SELECT * FROM client left join person on client.idperson = person.idperson',function(err,rows){
		if (err) {
			console.log("Error while listing all the client details !!!"  + err);
			callback({ status : 500, message : "Error while listing client details !!!" });
		} else {
			callback({ status : 200, data : rows});
		}
	});
}


//getClientInfo
function getClientInfo(msg,callback){
	mysql.queryDb('SELECT * FROM person WHERE ?',[{idperson:msg.idperson}],function(err,rows){
		if (err) {
			console.log("Error while listing all the client details !!!"  + err);
			callback({ status : 500, message : "Error while listing client details !!!" });
		} else {
			callback({ status : 200, data : rows});
		}
	});
}