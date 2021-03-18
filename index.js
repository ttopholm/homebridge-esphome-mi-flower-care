var Service, Characteristic;
var request = require('request');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-esphome-mi-flower-care", "EsphomeMiFlowerCare", EsphomeMiFlowerCare);
}

function EsphomeMiFlowerCare(log, config) {
    this.log = log;
    this.humidityService = false;

    // Config
    this.url = config["url"];
    this.http_method = config["http_method"] || "GET";
    this.sendimmediately = config["sendimmediately"] || false;
    this.username = config["username"] || "";
    this.password = config["password"] || "";

    this.name = config["name"];
    this.type = config["type"];

    this.manufacturer = config["manufacturer"] || "EsphomeMiFlowerCare";
    this.model = config["model"] || "Default";
    this.serial = config["serial"] || "18981898";

}

AdvancedHttpTemperatureHumidity.prototype = {

    httpRequest: function (url, body, method, username, password, sendimmediately, callback) {
        request({
                url: url,
                body: body,
                method: method,
                rejectUnauthorized: false,
                auth: {
                    user: username,
                    pass: password,
                    sendImmediately: sendimmediately
                }
            },
            function (error, response, body) {
                callback(error, response, body)
            })
    },

    getStateHumidity: function (callback) {
        callback(null, this.humidity);
    },

    request: function (callback) {
        this.httpRequest(this.url, "", this.http_method, this.username, this.password, this.sendimmediately, function (error, response, responseBody) {

            if (error) {
                this.log('Get Temperature failed: %s', error.message);
                callback(error);
            } else {
                this.log('Get Temperature succeeded!');
                var info = JSON.parse(responseBody);

                var temperature = parseFloat(info.value);

                callback(null, temperature);
            }
        }.bind(this));
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var services = [],
            informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);
        services.push(informationService);

        switch(this.type) {

            case 'temperature':
                temperatureService = new Service.TemperatureSensor(this.name);
                temperatureService
                    .getCharacteristic(Characteristic.CurrentTemperature)
                    .on('get', this.request.bind(this));
                services.push(temperatureService);
                break;
            case 'humidity':
                this.humidityService = new Service.HumiditySensor(this.name);
                this.humidityService
                    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                    .setProps({minValue: 0, maxValue: 100})
                    .on('get', this.request.bind(this));
                services.push(this.humidityService);
                break;
            case 'lux':
                this.lightSensor = new Service.LightSensor(this.name);
                this.lightSensor
                    .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                    .setProps({minValue: 0, maxValue: 100000000})
                    .on('get', this.request.bind(this));
                services.push(this.lightSensor);
                break;
                
        }
        return services;
    }
};