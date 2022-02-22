const mysql = require('../database/db.js');
const Decimal = require('decimal.js');
const express = require('express');
var request = require('request')
var crypto = require("crypto");
var path = require('path');

var cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

mysql.CheckConnectDB();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(require('request-param')())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.set('port', (process.env.PORT || 8000)); //running port 8000

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'));
});

var router = express.Router()
app.use('/', router)


router.get('/version', function (req, res) {
  mysql.Transaction({
    from: 1,
    type_currency_from: 1,
    value: '10',
    to: 3,
    type_currency_to: 1
  }).then(()=>{
    console.log("response")
  })
  var reply = {"version":"0.001"}
  res.jsonp(reply);
});

router.post('/create', function (req, res) {
  payload = req.body
  mysql.Account({card_id:payload.card_id}).then((response)=>{
    payload["status"] = (response.length === 0)
    if(payload["status"]){
      payload["account_id"] = (Math.floor(100000000 + Math.random() * 900000000)).toString()
      mysql.CreateAccount(payload).then((response)=>{
        payload["message"] = mysql.Message("create_succeed")
        var reply = payload
        res.jsonp(reply);
      });
    }
    else{
      payload["message"] = mysql.Message("create_failed")
      var reply = payload
      res.jsonp(reply);
    }
  })
});

router.post('/faucet', function (req, res) {
  payload = req.body
  mysql.User(payload).then((response1)=>{
    mysql.Balance({"id_user":response1[0].id},1).then((response2)=>{
      if(response2.length > 0){ 
        payload["balance"] = Decimal(response2[0].balance).plus(10).toString()
        mysql.UpdateBalance({"typecoin":1,"id_user":response1[0].id,amount:payload["balance"]}).then((response3)=>{
          res.jsonp(payload);
        });
      }
      else{
        payload["balance"] = 10
        mysql.CreateBalance({"typecoin":1,"id_user":response1[0].id,amount:payload["balance"]}).then((response3)=>{
          res.jsonp(payload);
        });
      }
    })
  })
});

router.post('/balance', function (req, res) {
  payload = req.body
  mysql.User(payload).then((response1)=>{
     mysql.Balance({"id_user":response1[0].id}).then((response2)=>{
      reply = response2
      res.jsonp(reply);
    })
  })
});


router.post('/list_account', function (req, res) {
  mysql.ListAccount().then((response)=>{
      reply = response
      res.jsonp(reply);
  })
});


router.post('/list_currency', function (req, res) {
  mysql.ListCurrency().then((response)=>{
      reply = response
      res.jsonp(reply);
  })
});

router.post('/transfer', function (req, res) {
  payload = req.body
  mysql.CheckBlacklist({account_id:[payload.account_id_from,payload.account_id_to]}).then((logi)=>{
    if(logi){
      //update balance "from"
      mysql.User({account_id: payload.account_id_from}).then((response1)=>{
        mysql.Currency({type: payload.typecoin_from}).then((response2)=>{
          mysql.Balance({"id_user":response1[0].id} , response2[0].id).then((response3)=>{
            reply = response3
            if(parseFloat(response3[0].balance) >= payload.amount){
              var balance_from = Decimal(response3[0].balance).minus(payload.amount).toString()
              mysql.UpdateBalance({"typecoin":response2[0].id,"id_user":response1[0].id,amount:balance_from}).then((response)=>{
                //update balance "to"
                mysql.CalCurrency({typecoin_from:payload.typecoin_from,typecoin_to:payload.typecoin_to, amount_from: payload.amount}).then((response)=>{
                  mysql.User({account_id: payload.account_id_to}).then((response4)=>{
                    mysql.Currency({type: payload.typecoin_to}).then((response5)=>{
                      mysql.Balance({"id_user":response4[0].id} , response5[0].id).then((response6)=>{
                        var balance_to =  Decimal(response6[0].balance).plus(response.amount_to).toString()     
                        mysql.User({account_id: payload.account_id_to}).then((response7)=>{
                          mysql.Currency({type: payload.typecoin_to}).then((response8)=>{
                            mysql.UpdateBalance({"typecoin":response8[0].id,"id_user":response7[0].id,amount:balance_to}).then((response)=>{
                              mysql.Transaction({ from: response1[0].id, type_currency_from: response2[0].id, value: payload.amount, to: response4[0].id, type_currency_to: response5[0].id }).then(()=>{
                                reply = { account_id_from: {balance:balance_from,typecoin:payload.typecoin_from},account_id_to:{balance:balance_to,typecoin:payload.typecoin_to} }
                                res.jsonp(reply);
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              });
            }
            else{
              //insufficient balance
              reply = { message: mysql.Message("transfer_failed") }
              res.jsonp(reply);
            }
          })
        })
      })
    }
    else{
      //blacklist
      reply = { message: mysql.Message("transfer_blacklist") }
      res.jsonp(reply);
    }
  })
});

router.post('/add_currency', function (req, res) {
  payload = req.body
  mysql.AddCurrency(payload).then((response)=>{
    mysql.ListCurrency().then((response)=>{
      reply = response
      res.jsonp(reply);
    })
  })
});

router.post('/remove_currency', function (req, res) {
  payload = req.body
  mysql.RemoveCurrency(payload).then((response)=>{
    mysql.ListCurrency().then((response)=>{
      reply = response
      res.jsonp(reply);
    })
  })
});


router.post('/list_blacklist', function (req, res) {
  payload = req.body
  mysql.ListBlacklist().then((response)=>{
    res.jsonp(response);
  })
});

router.post('/blacklist', function (req, res) {
  payload = req.body
  mysql.Blacklist(payload).then((response)=>{
    res.jsonp(response);
  })
});

router.post('/cancel_blacklist', function (req, res) {
  payload = req.body
  mysql.CancelBlacklist(payload).then((response)=>{
    res.jsonp(response);
  })
});


router.post('/set_money_user', function (req, res) {
  payload = req.body
  res.jsonp(payload);
});



