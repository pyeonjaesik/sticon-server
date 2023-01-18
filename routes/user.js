var login = function(req, res) {
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    var er=0; 
    var output = {};
    for (var i=0; i<paramId.length; i++)  {
      var chk = paramId.substring(i,i+1); 
      if(!chk.match(/[a-z]|[A-Z]|[0-9]/)) { 
        er = er + 1; 
      } 
    } 
    if (er > 0) {
      console.log('not valid info');
      output.status=2;
      res.send(output);
      return;
    }
    if(paramId.length<1||paramId.length>13){
      console.log('not valid info11');
      output.status=2;
      res.send(output)    
      return;  
    }
    if(paramPassword.length<1||paramPassword.length>20){
      console.log('not valid info11');
      output.status=2;
      res.send(output)    
      return;        
    }
    var xss = require("xss");
    paramId=xss(paramId);
    paramPassword=xss(paramPassword);
    var k_r= new RegExp('script','i');
    var sc_i=paramId.search(k_r);
    if(sc_i!=-1){
      console.log('script detected');
      output.status=700;    
      res.send(output);
      return;    
    }
    var sc_i2=paramPassword.search(k_r);
    if(sc_i2!=-1){
      console.log('script detected');
      output.status=700;    
      res.send(output);
      return;    
    }
	var database = req.app.get('database');
	if (database.db) {
		authUser(database, paramId, paramPassword, function(err, docs) {
			if (err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);
                output.status = 4;
                res.send(output);
                return;
            }
			if (docs) {
                output._id = docs[0]._doc._id;
                output.id = docs[0]._doc.id;
                output.status=1;    
                res.send(output);
			} else {
                output.status =2;
                res.send(output);
            }
		});
	} else {
        output.status = 10;
        res.send(output);
	}
	
};

var listuser = function(req, res) { 
	var database = req.app.get('database');

	if (database.db) {
		database.UserModel.findAll(function(err, results) {
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			  
			if (results) {
				console.dir(results);
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					res.write('    <li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
				}	
			
				res.write('</ul></div>');
				res.end();
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};
var authUser = function(database, id, password, callback) {
	database.UserModel.findById(id, function(err, results) {
		if (err) {
			callback(err, null);
			return;
		}		
		if (results.length > 0) {
			var user = new database.UserModel({id:id});
			var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
			if (authenticated) {
				callback(null, results);
			} else {
				callback(null, null);
			}
			
		} else {
	    	callback(null, null);
	    }
		
	});
	
}
module.exports.login = login;
module.exports.listuser = listuser;