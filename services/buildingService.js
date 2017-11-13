'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');

exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;
	
	switch(operation){
		
		case "createBuilding" : 
			createBuilding(message,callback);
			break;

		case "getBuildingClientReport" : 
			getBuildingClientReport(message,callback);
			break;
			
		case "getBuilding" :
			getBuilding(message,callback);
			break;
			
		case "editBuilding" :
			editBuilding(message,callback);
			break;

		case "deleteBuilding" :
			deleteBuilding(message,callback);
			break;
			
		default : 
			callback({status : 400,message : "Bad Request"});
	}
};

// Save Building
function createBuilding(msg,callback){
	var releaseDate = moment(msg.release_date,'DD-MM-YYYY').toDate();
		
	var queryParam = {
			idclient : msg.idclient,
			buildingname: msg.buildingname,
			start_date : moment(msg.start_date,'DD-MM-YYYY').toDate(),
			release_date : moment(msg.release_date,'DD-MM-YYYY').toDate(),
			address : msg.address,
			checkpoint : msg.checkpoint,
			no_of_guards: msg.no_of_guards,
			buildingstatus:"Active"
	}

	mysql.queryDb("INSERT INTO building SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "building has been added Succesfully" });
		}
	});
}

//Get Building Client Report
function getBuildingClientReport(msg,callback){
	mysql.queryDb('SELECT buildingname FROM building WHERE ? and buildingstatus = "Active"',[{idclient:msg.idperson}],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
}

//Get Building
function getBuilding(msg,callback){
	mysql.queryDb('SELECT * FROM building WHERE ? and buildingstatus = "Active"',[{idclient:msg.idperson}],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
}

/// get client
function editBuilding(msg,callback){
	var newParam ={
		buildingname : msg.buildingname,
		start_date : moment(msg.start_date,'YYYY-MM-DD').toDate(),
		release_date : moment(msg.release_date,'YYYY-MM-DD').toDate(),
		address : msg.address,
		checkpoint : msg.checkpoint,
		no_of_guards: msg.no_of_guards,
	};

	mysql.queryDb("UPDATE building SET ? WHERE ?? = ?", 
		[newParam,'idbuilding',msg.idbuilding], 
		function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!" + err);
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "building has been updated Succesfully" });
		}
	});
}

// delete client
function deleteBuilding(msg,callback){
	var buildingid = req.params.buildingid;
	var newParam = {
		buildingstatus : "Disable"
	};

	mysql.queryDb('UPDATE building SET ? WHERE ?? = ?',[newParam,'idbuilding',msg.buildingid],function(err,response){
		if (err) {
			console.log("Error while deleting building details !!!" + err);
			callback({ status : 500, message : "Error while deleting building details !!!" });
		} else {
			callback({ status : 200, message : "building details has been deleted Succesfully" });
		}
	});
}