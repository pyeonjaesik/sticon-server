var axios = require('axios');
var paymentcomplete = async function(req,res){
  console.log('paymentcomplete');
  var database = req.app.get('database');  
  var output={};
  var dart_price=110;
  try {
    const { imp_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
          imp_key: "2606978355989762", // REST API키
          imp_secret: "XwULMaU1VzjeHYKsMt1BGvzG7lS0STNPpHBbRwcM6v1NuMggfhSWMrCUNvUFoIvNq7YhDb4KH6xbSNs8" // REST API Secret
      }
    });
    const { access_token } = getToken.data.response; // 인증 토큰
    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    database.MctModel.find({merchant:paymentData.merchant_uid},function(err,results){
      if(err){
        console.log('MctModel.find err');
        output.status=903;
        res.send(output);
        return;  
      }
      if(results.length>0){
        var user_id=results[0]._doc.user_id;
        const amountToBePaid=results[0]._doc.amount;
        const { amount, status } = paymentData;
        if (amount === amountToBePaid) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
          //   await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장
          switch (status) {
            case "ready": // 가상계좌 발급
              // DB에 가상계좌 발급 정보 저장
              output.status=1002;
              res.send(output);   
              return;
              const { vbank_num, vbank_date, vbank_name } = paymentData;
              //  await Users.findByIdAndUpdate("/* 고객 id */", { $set: { vbank_num, vbank_date, vbank_name }});
              // 가상계좌 발급 안내 문자메시지 발송
              SMS.send({ text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`});
              res.send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
              break;
            case "paid": // 결제 완료
              database.UserModel.find({user_id},(err,results)=>{
                if(err){
                  database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 802 }},(err)=>{
                    if(err){
                      console.log('MctModel.update err 905');
                      output.status=905;
                      res.send(output);
                      return;
                    }
                    console.log('paycomplete: err 802');
                    output.status=802;
                    res.send(output);
                  });
                  return;
                }
                if(results.length>0){
                  var _id=results[0]._doc._id;
                  database.CoinModel.find({_id},function(err,results){
                    if(err){
                      database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 804 }},(err)=>{
                        if(err){
                          console.log('MctModel.update err 907');
                          output.status=907;
                          res.send(output);
                          return;
                        }
                        console.log('paycomplete: err 804');
                        output.status=804;
                        res.send(output);
                      });
                      return;  
                    }
                    if(results.length>0){
                      var purchase_d={mct_id:paymentData.merchant_uid,imp_uid:paymentData.imp_uid,coin:parseInt(amount/dart_price),ct:parseInt(Date.now())}  
                      var purchase=results[0]._doc.p.map((x)=>x);
                      purchase.unshift(purchase_d);
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

                      purchase = removeDuplicates(purchase, "mct_id");
                      var ss=results[0]._doc.s.map((x)=>x);
                      var ee=results[0]._doc.e.map((x)=>x);
                      var tt=results[0]._doc.t.map((x)=>x);
                      var gg=results[0]._doc.g.map((x)=>x);
                      var ssl=ss.length;
                      var eel=ee.length;
                      var ttl=tt.length;
                      var ggl=gg.length;
                      var purl=purchase.length;  
                      var coin_price=0;  
                      for(var i=0;i<purl;i++){
                        coin_price+=purchase[i].coin;    
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
                      if(coin_price==(parseInt(results[0]._doc.coin)+parseInt(amount/dart_price))){
                        database.CoinModel.update({_id},{p:purchase,coin:coin_price},function(err){
                          if(err){
                            database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 807 }},(err)=>{
                              if(err){
                                console.log('MctModel.update err 910');
                                output.status=910;
                                res.send(output);
                                return;
                              }
                              console.log('paycomplete: err 807');
                              output.status=807;
                              res.send(output);
                            });
                            return;    
                          }
                          database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 100 },imp:imp_uid },(err)=>{
                            if(err){
                              console.log('MctModel.update err 901');
                              output.status=901;
                              res.send(output);
                              return;
                            }
                            output.coin=coin_price;
                            output.status=100;
                            res.send(output);
                            console.log('pay success! congraturation!');
                          });
                        });  
                      }else{
                        console.log('coin_price!=results[0]._doc.coin:'+coin_price+'/'+(parseInt(results[0]._doc.coin)+parseInt(amount/dart_price)));
                        database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 806 }},(err)=>{
                          if(err){
                            console.log('MctModel.update err 909');
                            output.status=909;
                            res.send(output);
                            return;
                          }
                          console.log('paycomplete: err 806');
                          output.status=806;
                          res.send(output);
                        });
                      }  
                    }else{
                      database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 805 }},(err)=>{
                        if(err){
                          console.log('MctModel.update err 908');
                          output.status=908;
                          res.send(output);
                          return;
                        }
                        console.log('paycomplete: err 805');
                        output.status=805;
                        res.send(output);
                      });  
                    }    
                  });
                }else{
                  database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 803 }},(err)=>{
                    if(err){
                      console.log('MctModel.update err 906');
                      output.status=906;
                      res.send(output);
                      return;
                    }
                    console.log('paycomplete: err 803');
                    output.status=803;
                    res.send(output);
                  });
                }
              });
              //  res.send({ status: "success", message: "일반 결제 성공" });
              break;
          }
        } else { // 결제 금액 불일치. 위/변조 된 결제
          database.MctModel.update({merchant:paymentData.merchant_uid},{ $push: { history: 801 }},(err)=>{
            if(err){
              console.log('MctModel.update err');
              output.status=904;
              res.send(output);
              return;
            }
            output.status=801; //==> 이미 사용된 imp_uid 를 한번 더 보낼 시에 이런 오류가 발생할 수 있음.
            res.send(output);
            console.log('pay fail: 801');
          });
        }
      }else{
        console.log('MctModel.find results.length==0 -->err');
        output.status=902;
        res.send(output);  
      }    
    }).sort({ct:1}).limit(1);       
  } catch (e) {
    output.status=1001;
    res.send(output);   
    // res.status(400).send(e);
  }
};
module.exports.paymentcomplete = paymentcomplete;