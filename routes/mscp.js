var mscp = function(req,res){
  var book_id = req.body.book_id||0; // 생산자
  var user_id = req.body.user_id||0; //소비자
  // var id2= req.body.id2||0;
  var post_id=req.body.post_id||0;
  // var ms_id=req.body.ms_id||0;
  var database = req.app.get('database');
  var crypto = require('crypto');    
  var output ={};  
  var ct= parseInt(Date.now());
// !!!!!!!!!!!!!!147-153 주석 반드시 풀것!!!!!!!!!!!!!!!!!!!!!!!! ==> 완료
// 154줄 삭제할것. => 완료
console.log(book_id+'/'+user_id)
  if(database){  
    database.UserModel.find({_id:book_id},async function(err,results){
      if(err){
        console.log('verifypw: err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var book_user_id=results[0]._doc.user_id;
        database.PostModel.find({_id:post_id},function(err,results){
          if(err){
            console.log('mscp: PostModel.find err');
            output.status=403;
            res.send(output);
            return;    
          }
          if(results.length>0){
            if(results[0]._doc.idx!==0){
              console.log('mscp: idx:'+results[0]._doc.idx);
              output.status=500;
              res.send(output);
              return;  
            }
            var post_coin=results[0]._doc.coin;
            if(user_id!==results[0]._doc.user_id){
              console.log('user_id!==results[0]._doc.user_id');
              output.status=502;
              res.send(output);
              return;
            }
            if(book_user_id!==results[0]._doc.book_user_id){
              console.log('book_user_id!== results[0]._doc.book_user_id');
              output.status=502;
              res.send(output);
              return;
            }
            database.UserModel.find({user_id},(err,results)=>{
              if(err){
                console.log('UserModel.find err');
                output.status=405;
                res.send(output);
                return;
              }
              if(results.length>0){
                var _id=results[0]._doc._id;
                database.CoinModel.find({_id},function(err,results){
                  if(err){
                    console.log('mscp: CoinModel.find err'); 
                    output.status=405;
                    res.send(output);
                    return;  
                  }
                  if(results.length>0){
                    var charr=results[0]._doc.charr.map((x)=>x);
                    var safetycheck=charr.filter((item, index) => charr.indexOf(item) !== index);
                    if(safetycheck.length>0){
                      console.log('safetycheck failed');
                      output.status=997;
                      res.send(output);
                      return;
                    }
                    database.CoinModel.find({ charr: { $in: charr }},(err,results)=>{
                      if(err){
                        console.log('mscp: CoinModel safety check err');
                        output.status=601;
                        res.send(output);
                        return;
                      }
                      console.dir(results);
                      if(results.length>1){
                        console.log('safetycheckfailed 999');
                        output.status=999;
                        res.send(output);
                        return;
                      }
                      if(results.length===0){
                        console.log('safetycheck err 998');
                        output.status=998;
                        res.send(output);
                        return;
                      }
                      if(_id.toString()!==results[0]._doc._id.toString()){
                        console.log('safetycheck err 996');
                        output.status=996;
                        res.send(output);
                        return;
                      }
                      console.log('results.length=='+results.length);
                      var ee=results[0]._doc.e;
                      function checkee(em){
                        return em.post_id==post_id;
                      }
                      var eei=ee.findIndex(checkee);
                      if(eei==-1||post_coin!=ee[eei].coin){
                        console.log('eei===-1||post_coin!==ee[eei].coin');
                        output.status=503;
                        res.send(output);
                        return;
                      }
                      //
                      //
                      var MS = new database.MsModel({
                        user_id,
                        book_user_id,
                        post_id,
                        text:'',
                        created_time:parseInt(Date.now()),
                        // clip:files,
                      });
                      console.log('aaasdasdsa');
                      MS.save((err)=>{
                        if(err){
                          console.log(err);
                          console.log('Ms.save err');
                          output.status=405;
                          res.send(output);
                          return;
                        }
                        database.CoinModel.find({_id:book_id},function(err,results){
                          if(err){
                            console.log('mscp: CoinModel.find2 err');
                            output.status=409;
                            res.send(output);
                            return;    
                          }
                          if(results.length>0){
                            var charr=results[0]._doc.charr.map((x)=>x);
                            charr.push(post_id.toString());
                            var safetycheck=charr.filter((item, index) => charr.indexOf(item) !== index);
                            if(safetycheck.length>0){
                              console.log('safetycheck failed');
                              output.status=9972;
                              res.send(output);
                              return;
                            }
                            var tt=results[0]._doc.t.map((x)=>x);
                            var pp=results[0]._doc.p.map((x)=>x);    
                            var ss=results[0]._doc.s.map((x)=>x);
                            var ee=results[0]._doc.e.map((x)=>x);
                            var gg=results[0]._doc.g.map((x)=>x);
                            tt.unshift({post_id:post_id.toString(),coin:post_coin,ct:parseInt(Date.now())});    
                            function removeDuplicates(originalArray, prop) {
                              var newArray = [];
                              var lookupObject  = {};
                              for(var i in originalArray) {
                                lookupObject[originalArray[i][prop]] = originalArray[i];
                              }
                              for(i in lookupObject) {
                                newArray.push(lookupObject[i]);
                              }
                              return newArray;
                            }
                            var ppl=pp.length;    
                            var ssl=ss.length;
                            var eel=ee.length;
                            var ttl=tt.length;
                            var ggl=gg.length;
                            tt = removeDuplicates(tt, "post_id");
                            ee = removeDuplicates(ee, "post_id");
                            pp = removeDuplicates(pp, "mct_id");
                            ss = removeDuplicates(ss,'ct');
                            gg = removeDuplicates(gg,'post_id');
                            if(eel!==ee.length){
                              console.log('safety check ee failed');
                              output.status=900;
                              res.send(output);
                              return;
                            }
                            if(ppl!==pp.length){
                              console.log('safety check pp failed');
                              output.status=901;
                              res.send(output);
                              return;
                            }
                            if(ssl!==ss.length){
                              console.log('safety check ss failed');
                              output.status=902;
                              res.send(output);
                              return;
                            }
                            if(ttl!==tt.length){
                              console.log('safety check tt failed');
                              output.status=903;
                              res.send(output);
                              return;
                            }
                            if(ggl!==gg.length){
                              console.log('safety check gg failed');
                              output.status=904;
                              res.send(output);
                              return;
                            }
                            var coin_price=0; 
                            for(var i=0;i<ppl;i++){
                              coin_price+=pp[i].coin; 
                            }
                            for(var i=0;i<ssl;i++){
                              coin_price-=ss[i].coin; 
                            }
                            for(var i=0;i<eel;i++){
                              coin_price-=ee[i].coin;    
                            }
                            for(var i=0;i<ttl;i++){
                              coin_price+=tt[i].coin;    
                            }
                            for(var i=0;i<ggl;i++){
                              coin_price+=gg[i].coin;    
                            }
                            if(parseInt(coin_price)!==parseInt(results[0]._doc.coin+post_coin)){
                              console.log('mscp: CoinModel auth6 failed');
                              console.log(coin_price+'/'+(results[0]._doc.coin+post_coin));
                              output.status=506;
                              res.send(output); 
                              return;
                            }
                            // coin_price=parseInt(results[0]._doc.coin+post_coin); // 나중에 주석처리할 것.
                            database.PostModel.update({_id:post_id},{idx:1,ct:parseInt(Date.now())},function(err){
                              if(err){
                                output.status=412;
                                console.log('mscp PostModel.update err');
                                res.send(output);
                                return;  
                              }
                              database.CoinModel.update({_id:book_id},{t:tt,coin:coin_price,$push: { charr: post_id.toString() }},function(err){
                                if(err){
                                  console.log('mscp: Coin update err');
                                  output.status=413;
                                  res.send(output);
                                  return;  
                                }
                                output.status=100;
                                res.send(output);
                                console.log('mscp success');
                              });                                        
                            });    
                          }else{
                            console.log('mscp: CoinModel.find2 results.length == 0 --> err');
                            output.status=411;
                            res.send(output);    
                          }  
                        });
                      });
                    }).limit(10); 
                  }else{
                    console.log('mscp: CoinModel.find results.length ==0 -->err');
                    output.status=406;
                    res.send(output);  
                  }    
                }); 
              }else{
                console.log('UserModel.find results.length ==0 --> err');
                output.status=406;
                res.send(output);
              }
            });   
          }else{
            console.log('mscp: PostModel.find results.length ==0 --> err');
            output.status=404;
            res.send(output);    
          }  
        });
      }else{
        console.log('verifypw: results.length==0 --> err');
        output.status=402;
        res.send(output);
      }
    });
  }else{
    console.log('mscp: no database');
    output.status =410;
    res.send(output);
  }
};
module.exports.mscp = mscp;