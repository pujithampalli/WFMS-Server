'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');
var crypto = require('crypto');


exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;
	
	switch(operation){
		
		case "createGuard" : 
			createGuard(message,callback);
			break;
		
		case "updateGuard" : 
			updateGuard(message,callback);
			break;

			
		case "listAllGuards" :
			listAllGuards(message,callback);
			break;
			
			
		case "deleteGuard" : 
			deleteGuard(message,callback);
			break;	
		
			
		case "getGuard" :
			getGuard(message,callback);
			break;
			
		case "searchGuard" :
			searchGuard(message,callback);
			break;
			
		default : 
			callback({status : 400,message : "Bad Request"});
	}
};

// Create Guard
function createGuard(msg,callback){
	try{
	console.log("create guard inside");
    var pwu = msg.password;
    var un = msg.email;
    var fn = msg.fname;
    var ln = msg.lname;
    var usertype = msg.usertype;
    var address = msg.address;
    var city = msg.city;
    var zipcode = msg.zipcode;
    var phonenumber = msg.phonenumber;
     
    var new_salt = Math.round((new Date().valueOf() * Math.random())) + '';
    var pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex');
    var created = dateutil.now();
    
    var data={
        email:un,
        password_hash:pw,
        status:true,
        type:usertype,
        created_date:created,
        last_login:created,
        password_salt:new_salt
    };

    mysql.queryDb('insert into login set ?',data,function(err,result){
      if(err) {
        console.log(err);
            callback({ status : 500, message : "Please try again later" });
      } else {
            
        var idperson = result.insertId;

        mysql.queryDb('insert into person set ?',{idperson: idperson,fname : fn,
                  lname : ln,
                  email : un,
                  address: address,
                  city:city,
                  zipcode:zipcode,
                  phonenumber:phonenumber
                  },
        function(err,result){
          if(err) {
           callback({ status : 500, message : "Please try again later" });
          } else {
        	  		var queryParam = {
      				idperson :	idperson,
      				start_date : msg.start_date,
      				end_date : msg.end_date,
      				weekly_working_set : msg.weekly_working_set,
      				bgstatus: msg.bgstatus
        	  		}

      		mysql.queryDb("INSERT INTO guard SET ?", queryParam, function(err, response) {
      			if (err) {
      				console.log("Error while perfoming query !!!");
      				callback({ status : 500, message : "Please try again later" });
      			} else {
      				console.log("success so far");
      				callback({ status : 200, message : "Guard has been added Succesfully" });
      			}
      		});
        	  
          }
        });
      }
    });
	}catch(e){console.log(e);
	}
}


//updateGuard


function updateGuard(msg,callback){
	var newParam ={
			
			weekly_working_set : msg.body.weekly_working_set,
			bgstatus: msg.body.bgstatus,
			start_date :moment(msg.body.start_date,'DD-MM-YYYY').toDate(), 
			end_date : moment(msg.body.end_date,'DD-MM-YYYY').toDate()
	};
	
	
	
	mysql.queryDb("UPDATE guard SET ? WHERE ?? = ?", 
		[newParam,'idguard',msg.idguard], 
		function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!" + err);
			callback({ status : 500, message : "Please try again later" });
		} 
		else
			{
			var newParam ={
					
					fname : msg.body.fname,
					lname: msg.body.lname,
					address: msg.body.address,
					city: msg.body.city,
					zipcode: msg.body.zipcode,
					email: msg.body.email,
					phonenumber: msg.body.phonenumber,
				};
		
			
			mysql.queryDb("UPDATE person SET ? WHERE ?? = ?", 
				[newParam,'idperson',msg.body.idperson], 
				function(err, response) {
				if (err) {
					console.log("Error while perfoming query !!!" + err);
					callback({ status : 500, message : "Please try again later" });
				} 
			else {
			
				callback({ status : 200, message : "Guard has been added Succesfully" });
				
		}
		});
			}
	});
}


//listAll Guards
function listAllGuards(msg,callback){
	mysql.queryDb('select * from guard left join person on guard.idperson = person.idperson',function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
			//console.log("Error while listing all the guard details !!!"  + err);
			//res.status(500).json({ status : 500, message : "Error while listing guard details !!!" });
		} else {
			callback({ status : 200, message : "Value is coming",data:rows });

			//res.status(200).json({ status : 200, data : rows});
		}
	});
}


// DeleteGuard
function deleteGuard(msg,callback){
	try{
	console.log(msg.idguard);
	//idguard = msg.idguard;
	
	mysql.queryDb('DELETE FROM guard WHERE ?',[{idguard:msg.idguard}],function(err,response){
		if (err) {
			//console.log("Error while deleting guard details !!!");
			//console.log(err);
			callback({ status : 500, message : "Error while deleting guard details !!!" });
		} else {
			callback({ status : 200, message : "Guard details has been deleted Succesfully" });
		}
	});
	}
	catch(e){console.log(e)}

}



/// get guard
function getGuard(msg,callback){
	
	
	idguard = msg.idguard,
	mysql.queryDb('SELECT * FROM guard WHERE ?',[{idguard:idguard}],function(err,rows){

		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
	
	/*
	mysql.queryDb('SELECT * FROM client WHERE ?',[{idperson:msg.idperson}],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
	*/
}


//searchGuard

function searchGuard(msg,callback){
	
	
	mysql.queryDb('select concat(?? , " " , ??) as name, ?? from person left outer join login on ?? = ?? where login.type= "Guard"',['person.fname','person.lname','person.email','person.idperson','login.idperson','Guard'],function(err,rows){
		if (err) {
			console.log("Error while listing all the guard details !!!"  + err);
			callback({ status : 500, message : "Error while listing guard details !!!" });
		} else {
			callback({ status : 200, data : rows});
		}
	});

}




