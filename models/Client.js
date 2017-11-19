var config =  require('../config/config');
var DBconnect  = config.DBconnect(config.mysqlDB());


exports.Validate = function(param) {
	
			param.seq_num = 1;
			param.action_remarks = "Initiate";
			console.log(JSON.stringify(param));
			var check_sql = "SELECT * FROM page_conversation WHERE psid = '" + param.psid +"'";		
				DBconnect.query(check_sql, function(error, rows) {
						if(rows.length == 0) {
							DBconnect.query('INSERT INTO page_conversation SET ?', param, function(error, _rows) { 
								if(error)
									 console.log(error); 
								else
									console.log("New Conversation Added");  
							});
						}
						else { 
							console.log("Return Client");
						}
						return true;
				});
}


exports.Conversation = function(psid, callback) {
		var check_sql = "SELECT * FROM page_conversation WHERE psid = " + psid + " ORDER BY id DESC LIMIT 1";
		DBconnect.query(check_sql, function(error, rows) {
						
						return callback(rows[0]);
				});
}

exports.UpdateConversation = function(seq_num, psid) {
		var _seqNum = parseInt(seq_num) + 1;
		var sql = "UPDATE page_conversation SET seq_num='"+_seqNum+"' WHERE  psid="+psid;

		DBconnect.query(sql, function(error, rows) {
			if(error) throw error;
		});
}


exports.Message_template = function(fbpage_id, seq_num, callback) {
		var check_sql = "SELECT * FROM pages p LEFT JOIN message_templates mt ON p.id=mt.page_id WHERE p.fbpage_id=" + fbpage_id + " AND mt.seq_num="+seq_num;
		DBconnect.query(check_sql, function(error, rows) {
						return callback(rows[0]);
				});
}



