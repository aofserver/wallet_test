const { json } = require("body-parser");
var Sequelize = require("sequelize");
const { Op } = require("sequelize");
const { col } = require("sequelize");
const Decimal = require('decimal.js');


var sequelize = new Sequelize(
  "wallet_test",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    timezone: "+07:00",
    logging: false,
    operatorsAliases: false,
    define: {
      timestamps: false, //disable timestamps 'createdAt' and 'updatedAt'
      charset: "utf8",
      dialectOptions: {
        collate: "utf8_unicode_ci",
      },
    },
  }
);

var userinfo = sequelize.define(
  "userinfo",
  {
    name: {
      type: Sequelize.STRING,
      field: "name",
    },
    card_id: {
      type: Sequelize.STRING,
      field: "card_id",
    },
    account_id: {
      type: Sequelize.STRING,
      field: "account_id",
    },
  },
  {
    freezeTableName: true,
  }
);

var datainfo = sequelize.define(
  "datainfo",
  {
    id_user: {
      type: Sequelize.INTEGER,
      field: "id_user",
    },
    balance: {
      type: Sequelize.STRING,
      field: "balance",
    },
    typecoin: {
      type: Sequelize.INTEGER,
      field: "typecoin",
    },
  },
  {
    freezeTableName: true,
  }
);

var transaction = sequelize.define(
  "transaction",
  {
    from: {
      type: Sequelize.INTEGER,
      field: "from",
    },
    type_currency_from: {
      type: Sequelize.INTEGER,
      field: "type_currency_from",
    },
    value: {
      type: Sequelize.STRING,
      field: "value",
    },
    to: {
      type: Sequelize.INTEGER,
      field: "to",
    },
    type_currency_to: {
      type: Sequelize.INTEGER,
      field: "type_currency_to",
    },
  },
  {
    freezeTableName: true,
  }
);

var currency = sequelize.define(
  "currency",
  {
    type: {
      type: Sequelize.STRING,
      field: "type",
    },
    price: {
      type: Sequelize.STRING,
      field: "price",
    },
  },
  {
    freezeTableName: true,
  }
);

var blacklist = sequelize.define(
  "blacklist",
  {
    id_user: {
      type: Sequelize.STRING,
      field: "id_user",
    },
  },
  {
    freezeTableName: true,
  }
);


var message = {
  create_succeed: "Account creation succeeds.",
  create_failed: "Account creation failed. The ID card number has been used.",
  transfer_failed: "Insufficient balance.",
  transfer_blacklist: "Blacklisted account." 
}






module.exports = {
  CheckConnectDB: async function () {
    try {
      await sequelize.authenticate();
      console.log("Connection database has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  },

  ListAccount: async function () {
    let datares =  await userinfo.findAll();
    return datares
  },

  ListCurrency: async function () {
    let datares =  await currency.findAll();
    return datares
  },

  Account: async function (data) {
    let datares =  await userinfo.findAll({
      where: {card_id: data.card_id}
    });
    return datares
  },

  User: async function (data) {
    let datares = await userinfo.findAll({
      where: {account_id: data.account_id}
    });
    return datares
  },

  Currency: async function (data) {
    let datares = await currency.findAll({
      where: {type: data.type}
    });
    return datares
  },

  Balance: async function (data,typecoin=null) {
    var condition
    if(typecoin == null){
      condition = {id_user: data.id_user}
    }
    else{
      condition = {id_user: data.id_user,typecoin: typecoin}
    }
     
    let datares =  await datainfo.findAll({
      where: condition
    });

    res = []
    for(var i=0;i<datares.length;i++){
      data1 = await currency.findAll({ where: {id: datares[i].typecoin} });
      res.push({"balance": datares[i].balance,"typecoin": data1[0].type})
    }

    if(res.length == 0 && typecoin != null){
      await datainfo.create({ id_user: data.id_user, balance: "0", typecoin: typecoin });
      
      let datare2 = await currency.findAll({where: {id: typecoin}});
      res = [{"balance":"0","typecoin":datare2[0].type}]
    }
    console.log("balance user id "+data.id_user+" : "+ JSON.stringify(res))
    return res
  },

  CalCurrency: async function (data) {
    let data_from = await currency.findAll({ where: {type: data.typecoin_from} });
    let data_to = await currency.findAll({ where: {type: data.typecoin_to} });

    res = {amount_to : null}
    if(data.typecoin_from === "USDT" && data.typecoin_to !== "USDT"){
      var amount_currency = Decimal(data.amount_from).div(data_to[0].price)
      res.amount_to = amount_currency
    }
    else if(data.typecoin_from !== "USDT" && data.typecoin_to === "USDT"){
      var amount_currency = Decimal(data.amount_from).mul(data_from[0].price)
      res.amount_to = amount_currency
    }
    else if(data.typecoin_from !== "USDT" && data.typecoin_to !== "USDT"){
      var amount_currency_usdt = Decimal(data.amount_from).mul(data_from[0].price)
      var amount_currency = Decimal(amount_currency_usdt).div(data_to[0].price)
      res.amount_to = amount_currency
    }
    else if(data.typecoin_from === "USDT" && data.typecoin_to === "USDT"){
      res.amount_to = data.amount_from
    }
  
    return res
  },

  CreateAccount: async function (data) {
    await userinfo.create({
      name: data.name,
      card_id: data.card_id,
      account_id: data.account_id
    });
    console.log("create user " + data.name + " : " + data.account_id);
  },

  UpdateBalance: async function (data) {
    let datares = await datainfo.update({ balance:data.amount }, {
      where: {
        id_user: data.id_user,
        typecoin: data.typecoin
      }
    });
    console.log("update : "+ !!datares[0] + " | user id : " + data.id_user + "," + data.amount + " "+ data.typecoin)
  },

  Transaction: async function (data) {
    await transaction.create(data);
    console.log("create transaction")
  },

  CreateBalance: async function (data) {
    let datares = await datainfo.create({ balance:data.amount,id_user: data.id_user,typecoin: data.typecoin });
    console.log("create : "+ !!datares[0] + " | user id : " + data.id_user + "," + data.amount + " "+ data.typecoin)
  },


  ListBlacklist: async function () {
    reply = []
    let datares1 = await blacklist.findAll()
    
    for(var i=0;i<datares1.length;i++){
      let datares2 = await userinfo.findAll({ where: {id: datares1[0].id_user} });
      reply.push(datares2[0].account_id)
    }
    return reply
  },

  CheckBlacklist: async function (data) {
    let logi = []
    for(var i=0;i<data.account_id.length;i++){    
      let datares1 = await userinfo.findAll({ where: {account_id: data.account_id[i]} });
      if(!!datares1[0]){
        let datares2 = await blacklist.findAll({where: { id_user: datares1[0].id }});
        logi.push(!datares2[0])
      }
    }
    reply = (logi[0] && logi[1])
    return reply
  },

  Blacklist: async function (data) {
    let datares1 = await userinfo.findAll({ where: {account_id: data.account_id} });
    if(!!datares1[0]){
      let datares2 =  await blacklist.findAll({where: { id_user: datares1[0].id }});
      if(!datares2[0]){
        await blacklist.create({ id_user: datares1[0].id });
        console.log("blacklist user id : " + datares1[0].id);
      }
    }
    reply = []
    let datares3 = await blacklist.findAll()
    for(var i=0;i<datares3.length;i++){
      let datares4 = await userinfo.findAll({ where: {id: datares1[0].id} });
      reply.push(datares4[0].account_id)
    }
    return reply
  },

  CancelBlacklist: async function (data) {
    let datares1 = await userinfo.findAll({ where: {account_id: data.account_id} });
    if(!!datares1[0]){
      await blacklist.destroy({ where: { id_user: datares1[0].id } });
      console.log("cancel blacklist user id : " + datares1[0].id);
    }
    reply = []
    let datares2 = await blacklist.findAll()
    for(var i=0;i<datares2.length;i++){
      let datares3 = await userinfo.findAll({ where: {id: datares2[0].id} });
      reply.push(datares3[0].account_id)
    }
    return reply    
  },

  AddCurrency: async function (data) {
    let datares =  await currency.findAll({where: { type: data.type }});
    if(!datares[0]){
      await currency.create({
        type: data.type,
        price: data.price,
      });
      console.log("add currency " + data.type);
    }
  },

  RemoveCurrency: async function (data) {
    await currency.destroy({
      where:{
        type: data.type,
      }
    });
    console.log("remove currency " + data.type);
  },


  Message: function (key) {
    return message[key];
  },
};
