var Service, Characteristic;
const _http_base = require("homebridge-http-base");
const http = _http_base.http;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-esphome-mi-flower-care", "EsphomeMiFlowerCare", EsphomeMiFlowerCare);
}

function EsphomeMiFlowerCare(log, config) {
    this.log = log;

    // Config
    this.url = config["url"];
    this.http_method = config["http_method"] || "GET";

    this.name = config["name"];
    this.temperature_id = config["temperature_id"] || false;
    this.moisture_id = config["moisture_id"] || false;
    this.illuminance_id = config["illuminance_id"] || false;
    this.soil_conductivity_id = config["soil_conductivity_id"] || false;

    this.manufacturer = config["manufacturer"] || "EsphomeMiFlowerCare";
    this.model = config["model"] || "Default";
    this.serial = config["serial"] || "18981898";
    this.internal_values = {};

}

EsphomeMiFlowerCare.prototype = {

    httpRequest: function (url, body, callback) {
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
            http.httpRequest(this.status, (error, response, body) => {
                if (error) {
                    this.log("getStatus() failed: %s", error.message);
                    callback(error, response, body)
                }
                else if (!(http.isHttpSuccessCode(response.statusCode) || http.isHttpRedirectCode(response.statusCode))) {
                    this.log("getStatus() http request returned http error code: %s", response.statusCode);
                    callback(new Error("Got html error code " + response.statusCode), response, body);
                }
                else {
                    if (this.debug)
                        this.log(`getStatus() request returned successfully (${response.statusCode}). Body: '${body}'`);

                    if (http.isHttpRedirectCode(response.statusCode)) {
                        this.log("getStatus() http request return with redirect status code (3xx). Accepting it anyways");
                    }
                    callback(error, response, body)
                }
            });



    },

    request: function (sensor_id, callback) {
        let url = this.url + "/sensor/" + sensor_id
        this.log(url)
        this.httpRequest(url, "", this.http_method, this.username, this.password, this.sendimmediately, function (error, response, responseBody) {

            if (error) {
                this.log('Get Temperature failed: %s', error.message);
                callback(error);
            } else {
                this.log('Get Temperature succeeded!');
                this.log(responseBody)
                var info = JSON.parse(responseBody);
                if (isNaN(info.value)) {
                    var temperature = this.internal_values[sensor_id]
                    if (isNaN(temperature)) {
                        temperature = 0;
                        this.internal_values[sensor_id] = 0;
                    }
                } else {
                    var temperature = parseFloat(info.value);
                    this.internal_values[sensor_id] = temperature;
                }
                

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

 
        if (this.temperature_id) {
            temperatureService = new Service.TemperatureSensor(this.name + "_temperature");
            temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .on('get', this.request.bind(this, this.temperature_id));
            services.push(temperatureService);
        }

        if (this.moisture_id) {
            this.humidityService = new Service.HumiditySensor(this.name + "_humidity");
            this.humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .setProps({minValue: 0, maxValue: 100})
                .on('get', this.request.bind(this, this.moisture_id));
            services.push(this.humidityService);
        }

        if (this.illuminance_id) {
            this.lightSensor = new Service.LightSensor(this.name + "_illuminance");
            this.lightSensor
                .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                .setProps({minValue: 0, maxValue: 140000})
                .on('get', this.request.bind(this, this.illuminance_id));
            services.push(this.lightSensor);
        }

        if (this.soil_conductivity_id) {
            this.lightSensor = new Service.LightSensor(this.name + "_soil_conductivity",this.name + "_soil_conductivity");
            this.lightSensor
                .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                .setProps({minValue: 0, maxValue: 6000})
                .on('get', this.request.bind(this, this.soil_conductivity_id));
            services.push(this.lightSensor);
        }




                
        
        return services;
    }
};