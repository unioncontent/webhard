const logger = require('../winston/config_f.js');
﻿var express = require('express');
var router = express.Router();

var img = require('../models/img.js');
var monitoring = require('../models/monitoring.js');

router.get('/', function (req, res) {
  res.send('img update page!');
});

router.post('/',async function(req, res) {
  logger.info('이미지처리');
  try{
    var data = '';
    var pType = '';
    if('pType' in req.body){
      pType = 'm_';
      logger.info('모바일 : ',req.body);
    }
    if(req.body.type == 's'){
      data = await img.imgUpdate(pType,['1',req.body.cnt_url,req.body.cnt_chknum]);
      if('changedRows' in data){
        data = await img.detailImgUpdate(pType,req.body.cnt_chknum,[req.body.imgResult,req.body.cnt_url]);
      } else{
        // logger.info('req.body : ',req.body,' data: ',data);
        throw new Error('imgUpdate error');
      }
    }
    else if(req.body.type == 'f'){
      // logger.info('실패 : ',req.body);
      data = await img.imgUpdate(pType,['2',req.body.cnt_url,req.body.cnt_chknum]);
      data = await monitoring.monitoringUpdate(pType,req.body.cnt_chknum,['2',req.body.cnt_url]);
      // data = await monitoring.monitoringImgUpdate(pType,['1','untitled.jpg',req.body.cnt_url,req.body.cnt_chknum]);
    }
    else if(req.body.type == 'c'){
      // logger.info('실패 : ',req.body);
      // data = await img.imgUpdate(pType,['1',req.body.cnt_url,req.body.cnt_chknum]);
      data = await monitoring.monitoringUpdate(pType,req.body.cnt_chknum,['1',req.body.cnt_url]);
      // data = await monitoring.monitoringImgUpdate(pType,['1','untitled.jpg',req.body.cnt_url,req.body.cnt_chknum]);
    }
    else{
      data = await img.imgUpdate(['0',req.body.n_idx,req.body.cnt_chknum]);
    }
    res.status(200).send(data);
    await monitoring.imgChkUpdate();
  } catch(e){
    logger.info('router.post ERROR : ',e);
    data = await img.imgUpdate(['0',req.body.n_idx,req.body.cnt_chknum]);
    res.status(500).send(e);
  }
});

module.exports = router;
