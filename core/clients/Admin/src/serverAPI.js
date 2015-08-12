"use strict";

var sendReq = require('../../_common/js/sendReq.js');

module.exports = {
    getLiveAffluence: function(){
        return sendReq('GET', '/live-affluence');
    },
    getPlaceMeasurements: function(id){
        return sendReq('GET', '/places/' + id);
    },
    getAllPlacesInfos: function(){
        return sendReq('GET', '/allPlacesInfos');
    },
    getAllSensors: function(){
        return sendReq('GET', '/allSensors');
    },
    updatePlace: function(data){
        return sendReq('POST', '/updatePlace', data);
    },
    updateSensor: function(data){
        return sendReq('POST', '/updateSensor', data);
    },
    createPlace: function(data){
        return sendReq('POST', '/createPlace', data);
    },
    deletePlace: function(data){
        return sendReq('POST', '/deletePlace', data);
    }
};