'use strict';

var mysql = require('../util/mysql'), 
moment = require('moment'),
dateutil = require('../util/dateutil');

exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;

	switch(operation){

		case "createReport" : 
		createReport(message,callback);
		break;

		case "reportPerClientPerBuilding" : 
		reportPerClientPerBuilding(message,callback);
		break;

		case "reportPerBuildingBillingInfo" : 
		reportPerBuildingBillingInfo(message,callback);
		break;

		case "reportPerBuilding" :
		reportPerBuilding(message,callback);
		break;

		case "reportPerClient" :
		reportPerClient(message,callback);
		break;

		case "reportPerDay" :
		reportPerDay(message,callback);
		break;

		case "reportPerGuard" :
		reportPerGuard(message,callback);
		break;

		case "alertByidalertInfo":
		alertByidalertInfo(message,callback);
		break;

		default : 
		callback({status : 400,message : "Bad Request"});
	}
};


function alertByidalertInfo(msg,callback){

	mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idalertInfo',msg.idalertInfo], function(err, resultAlert){

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			callback({ status : 200, message : "Report per alertinfo", result:resultAlert});
		}
	});
}



function reportPerClientPerBuilding(msg,callback){

	mysql.queryDb('SELECT * from wfms.report left outer join wfms.building on report.idbuilding = building.idbuilding where ?? = ? AND ?? = ? AND ?? = ?;',['report.date',""+msg.date+"",'building.idclient',msg.idclient,'report.idbuilding',msg.idbuilding], function(err, result) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			if(result.length == 0){

				console.log("printing status 500 when no report found");

				callback({ status : 501, message : "No Report for selected date and building" });

			}

			else{

				mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idreport',result[0].idreport], function(err, resultPatrol) {

					if (err) {

						console.log("Error while perfoming query !!!");

						callback({ status : 500, message : "Please try again later" });

					} else {

						mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idreport',result[0].idreport], function(err, resultAlert) {

							if (err) {

								console.log("Error while perfoming query !!!");

								callback({ status : 500, message : "Please try again later" });

							} else {



								callback({ status : 200, message : "Report for Building", resultAlert:resultAlert, resultPatrol:resultPatrol});

							}

						});
					}

				});

			}

		}

	});

}


// Save or update client
function createReport(msg,callback){


//var date = moment(new Date(),myString());

//var date = moment(new Date(),'YYYY-MM-DD');



var date = moment().format('YYYY-MM-DD');

//console.log(date);



var queryParam = {

	date : date,

	idguard:msg.idguard,

	idbuilding:msg.idbuilding

}



mysql.queryDb("SELECT * FROM wfms.report where ?? = ? AND ?? = ? AND ?? = ?;",['idbuilding',msg.idbuilding,'idguard',msg.idguard,'date',date], function(err, result) {

	if (err) {

		console.log("Error while perfoming query !!!");

		callback({ status : 500, message : "Please try again later" });

	} else if(result[0]){



		callback({ status : 200, message : "Report already exsist, sending report id for reference",idreport:result[0].idreport});

	} else{



		mysql.queryDb("INSERT INTO wfms.report SET ?", queryParam, function(err, result) {

			if (err) {

				console.log("Error while perfoming query !!!");

				callback({ status : 500, message : "Please try again later" });

			} else {

				callback({ status : 200, message : "New report is been created", idreport:result.insertId });

			}

		});



	}



});
}


// Save reportPerBuildingBillingInfo
function reportPerGuard(msg,callback){

	mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idguard',msg.idguard], function(err, resultPatrol) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idguard',msg.idguard], function(err, resultAlert) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {



					callback({ status : 200, message : "Report per gaurd", resultAlert:resultAlert, resultPatrol:resultPatrol});

				}

			});





		}

	});
}


function reportPerBuilding(msg,callback){

	mysql.queryDb("SELECT * FROM wfms.report where ?? = ?",['idbuilding',msg.idbuilding], function(err, result) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {



			mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idreport',result[0].idreport], function(err, resultPatrol) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {

					mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idreport',result[0].idreport], function(err, resultAlert) {

						if (err) {

							console.log("Error while perfoming query !!!");

							callback({ status : 500, message : "Please try again later" });

						} else {



							callback({ status : 200, message : "Report for Building", resultAlert:resultAlert, resultPatrol:resultPatrol});

						}

					});





				}

			});



		}

	});
}

/// get client
function reportPerClient(msg,callback){


	mysql.queryDb('SELECT * FROM wfms.patrol left outer join wfms.building on ?? = ?? where ?? = ?;',['wfms.patrol.idbuilding','wfms.building.idbuilding','idclient',msg.idclient],function(err,resultPatrol){



		if (err) {

			callback({ status : 500, message : "Error while retrieving data" });

		} else {

			mysql.queryDb('SELECT wfms.alertinfo.severity, wfms.alertinfo.date, wfms.alertinfo.idalertInfo FROM wfms.patrol left outer join wfms.building on  ?? = ?? left outer join wfms.alertinfo on ?? = ?? where ?? = ?;',['wfms.patrol.idbuilding','wfms.building.idbuilding','wfms.alertinfo.idreport','wfms.patrol.idreport','idclient',msg.idclient],function(err,resultAlert){

				if (err) {

					callback({ status : 500, message : "Error while retrieving data" });

				} else {

					callback({ status : 200, resultPatrol : resultPatrol, resultAlert:resultAlert });

				}

			});

		}

	});

}

// Delete client
function reportPerDay(msg,callback){

	var date = String(msg.date);

	var fromDate = date + " 00:00:00";

	console

	var untilDate = String(msg.date);

	untilDate = untilDate + " 23:59:59";



	mysql.queryDb('SELECT * FROM wfms.patrol where ?? BETWEEN ? AND ?',['date', fromDate, untilDate], function(err, resultPatrol) {

		if (err) {

			console.log("Error while perfoming query  !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? LIKE '"+date+"%'",['date'], function(err, resultAlert) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {



					callback({ status : 200, message : "Report for Patrol", resultPatrol : resultPatrol, resultAlert:resultAlert});

				}

			});



		}

	});
}

//list all clients
'use strict';

var mysql = require('../util/mysql'), 
moment = require('moment'),
dateutil = require('../util/dateutil');

exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;

	switch(operation){

		case "createReport" : 
		createReport(message,callback);
		break;

		case "reportPerClientPerBuilding" : 
		reportPerClientPerBuilding(message,callback);
		break;

		case "reportPerBuildingBillingInfo" : 
		reportPerBuildingBillingInfo(message,callback);
		break;

		case "reportPerBuilding" :
		reportPerBuilding(message,callback);
		break;

		case "reportPerClient" :
		reportPerClient(message,callback);
		break;

		case "reportPerDay" :
		reportPerDay(message,callback);
		break;
		case "reportPerGuard" :
		reportPerGuard(message,callback);
		break;

		default : 
		callback({status : 400,message : "Bad Request"});
	}
};

function reportPerClientPerBuilding(msg,callback){

	mysql.queryDb('SELECT * from wfms.report left outer join wfms.building on report.idbuilding = building.idbuilding where ?? = ? AND ?? = ? AND ?? = ?;',['report.date',""+msg.date+"",'building.idclient',msg.idclient,'report.idbuilding',msg.idbuilding], function(err, result) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			if(result.length == 0){

				console.log("printing status 500 when no report found");

				callback({ status : 501, message : "No Report for selected date and building" });

			}

			else{

				mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idreport',result[0].idreport], function(err, resultPatrol) {

					if (err) {

						console.log("Error while perfoming query !!!");

						callback({ status : 500, message : "Please try again later" });

					} else {

						mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idreport',result[0].idreport], function(err, resultAlert) {

							if (err) {

								console.log("Error while perfoming query !!!");

								callback({ status : 500, message : "Please try again later" });

							} else {



								callback({ status : 200, message : "Report for Building", resultAlert:resultAlert, resultPatrol:resultPatrol});

							}

						});





					}

				});

			}



		}

	});

}


// Save or update client
function createReport(msg,callback){


//var date = moment(new Date(),myString());

//var date = moment(new Date(),'YYYY-MM-DD');



var date = moment().format('YYYY-MM-DD');

//console.log(date);



var queryParam = {

	date : date,

	idguard:msg.idguard,

	idbuilding:msg.idbuilding

}



mysql.queryDb("SELECT * FROM wfms.report where ?? = ? AND ?? = ? AND ?? = ?;",['idbuilding',msg.idbuilding,'idguard',msg.idguard,'date',date], function(err, result) {

	if (err) {

		console.log("Error while perfoming query !!!");

		callback({ status : 500, message : "Please try again later" });

	} else if(result[0]){



		callback({ status : 200, message : "Report already exsist, sending report id for reference",idreport:result[0].idreport});

	} else{



		mysql.queryDb("INSERT INTO wfms.report SET ?", queryParam, function(err, result) {

			if (err) {

				console.log("Error while perfoming query !!!");

				callback({ status : 500, message : "Please try again later" });

			} else {

				callback({ status : 200, message : "New report is been created", idreport:result.insertId });

			}

		});



	}



});
}


// Save reportPerBuildingBillingInfo
function reportPerGuard(msg,callback){

	mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idguard',msg.idguard], function(err, resultPatrol) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idguard',msg.idguard], function(err, resultAlert) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {



					callback({ status : 200, message : "Report per gaurd", resultAlert:resultAlert, resultPatrol:resultPatrol});

				}

			});





		}

	});
}


function reportPerBuilding(msg,callback){

	mysql.queryDb("SELECT * FROM wfms.report where ?? = ?",['idbuilding',msg.idbuilding], function(err, result) {

		if (err) {

			console.log("Error while perfoming query !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {



			mysql.queryDb("SELECT * FROM wfms.patrol where ?? = ?",['idreport',result[0].idreport], function(err, resultPatrol) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {

					mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? = ?",['idreport',result[0].idreport], function(err, resultAlert) {

						if (err) {

							console.log("Error while perfoming query !!!");

							callback({ status : 500, message : "Please try again later" });

						} else {



							callback({ status : 200, message : "Report for Building", resultAlert:resultAlert, resultPatrol:resultPatrol});

						}

					});





				}

			});



		}

	});
}

/// get client
function reportPerClient(msg,callback){


	mysql.queryDb('SELECT * FROM wfms.patrol left outer join wfms.building on ?? = ?? where ?? = ?;',['wfms.patrol.idbuilding','wfms.building.idbuilding','idclient',msg.idclient],function(err,resultPatrol){



		if (err) {

			callback({ status : 500, message : "Error while retrieving data" });

		} else {

			mysql.queryDb('SELECT wfms.alertinfo.severity, wfms.alertinfo.date, wfms.alertinfo.idalertInfo FROM wfms.patrol left outer join wfms.building on  ?? = ?? left outer join wfms.alertinfo on ?? = ?? where ?? = ?;',['wfms.patrol.idbuilding','wfms.building.idbuilding','wfms.alertinfo.idreport','wfms.patrol.idreport','idclient',msg.idclient],function(err,resultAlert){

				if (err) {

					callback({ status : 500, message : "Error while retrieving data" });

				} else {

					callback({ status : 200, resultPatrol : resultPatrol, resultAlert:resultAlert });

				}

			});

		}

	});

}

// Delete client
function reportPerDay(msg,callback){

	var date = String(msg.date);

	var fromDate = date + " 00:00:00";

	console

	var untilDate = String(msg.date);

	untilDate = untilDate + " 23:59:59";



	mysql.queryDb('SELECT * FROM wfms.patrol where ?? BETWEEN ? AND ?',['date', fromDate, untilDate], function(err, resultPatrol) {

		if (err) {

			console.log("Error while perfoming query  !!!");

			callback({ status : 500, message : "Please try again later" });

		} else {

			mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? LIKE '"+date+"%'",['date'], function(err, resultAlert) {

				if (err) {

					console.log("Error while perfoming query !!!");

					callback({ status : 500, message : "Please try again later" });

				} else {



					callback({ status : 200, message : "Report for Patrol", resultPatrol : resultPatrol, resultAlert:resultAlert});

				}

			});



		}

	});
}

//list all clients
