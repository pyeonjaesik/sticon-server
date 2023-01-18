var checkpush = async function(req, res) {
  console.log('checkpush');
  var output={};
  var info = req.body.info||{};
  console.log(JSON.stringify(info))
  res.send(output);
	
};
module.exports.checkpush = checkpush;