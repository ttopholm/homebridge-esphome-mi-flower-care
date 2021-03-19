var Service, Characteristic;
var got = require('got');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-esphome-mi-flower-care", "EsphomeMiFlowerCare", EsphomeMiFlowerCare);
}



function EsphomeMiFlowerCare(log, config) {
    this.log = log;

    // Config
    this.url = config["url"];

    this.name = config["name"];
    this.temperature_id = config["temperature_id"] || false;
    this.moisture_id = config["moisture_id"] || false;
    this.illuminance_id = config["illuminance_id"] || false;
    this.soil_conductivity_id = config["soil_conductivity_id"] || false;
    this.plant_name = config["plant_name"] || false;

    this.manufacturer = config["manufacturer"] || "EsphomeMiFlowerCare";
    this.model = config["model"] || "Default";
    this.serial = config["serial"] || "18981898";
    this.internal_values = {};
    
    //default min max values
    this.temperature_max = config["temperature_max"] || 200;
    this.temperature_min = config["temperature_min"] || 0;
    this.moisture_max = config["moisture_max"] || 100;
    this.moisture_min = config["moisture_min"] || 0;
    this.illuminance_max = config["illuminance_max"] || 1000000;
    this.illuminance_min = config["illuminance_min"] || 0;
    this.soil_conductivity_max = config["soil_conductivity_max"] || 1000000;
    this.soil_conductivity_min = config["soil_conductivity_min"] || 0;

}

EsphomeMiFlowerCare.prototype = {
    get_plant_info: function(callback) {
        let url = "https://eu-api.huahuacaocao.net/api/v2";
        json_body = {
            "path":"/plant/detail",
            "data": {
                "lang":"en",
                "pid": this.plant_name.toLowerCase()
            },
            "method":"GET",
            "service":"pkb"
        }


        try {
            body = got.post(url, {
                json: json_body,
                responseType: "json",
                headers: {"X-Hhcc-Region": "EU"}
            }).then(response => {
                body = response.body;
                this.log(body);

                if (body.data.basic.origin == "") {
                    this.log('Plant not found: %s', plant_name);                    
                } else {
                    this.log(parseFloat(body.data.parameter.max_temp))
                    this.temperature_max = parseFloat(body.data.parameter.max_temp);
                    this.temperature_min = parseFloat(body.data.parameter.min_temp);
                    this.moisture_max = parseFloat(body.data.parameter.max_soil_moist);
                    this.moisture_min = parseFloat(body.data.parameter.min_soil_moist);
                    this.illuminance_max = parseFloat(body.data.parameter.max_light_lux);
                    this.illuminance_min = parseFloat(body.data.parameter.min_light_lux);
                    this.soil_conductivity_max = parseFloat(body.data.parameter.max_soil_ec);
                    this.soil_conductivity_min = parseFloat(body.data.parameter.min_soil_ec);
                }
            })
            .catch(err => {
                this.log('Error: ', err.message);
            });

            

        } catch (error) {
            this.log('Get plant_info failed: %s', error.message);
        }     
        callback(this);   
    },
    http_get_request: function (url, callback) {
        (async () => {
            try {
                const response = await got(url);
                callback(null, response, response.body)
            } catch (error) {
                callback(error, error.response, error.response.body)    
            }
        })();
    },
    request: function (sensor_id, callback) {
        let url = this.url + "/sensor/" + sensor_id
        this.http_get_request(url, function (error, response, responseBody) {

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


        if (this.plant_name) {
            this.get_plant_info(function(_this) {
                if (_this.temperature_id) {
                    temperatureService = new Service.TemperatureSensor(_this.name + "_temperature");
                    temperatureService
                        .getCharacteristic(Characteristic.CurrentTemperature)
                        .setProps({minValue: _this.temperature_min, maxValue: _this.temperature_max})
                        .on('get', _this.request.bind(_this, _this.temperature_id));
                    services.push(temperatureService);
                }

                if (_this.moisture_id) {
                    _this.humidityService = new Service.HumiditySensor(_this.name + "_humidity");
                    _this.humidityService
                        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                        .setProps({minValue: _this.moisture_min, maxValue: _this.moisture_max})
                        .on('get', _this.request.bind(_this, _this.moisture_id));
                    services.push(_this.humidityService);
                }

                if (_this.illuminance_id) {
                    _this.lightSensor = new Service.LightSensor(_this.name + "_illuminance", _this.name + "_illuminance");
                    _this.lightSensor
                        .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                        .setProps({minValue: _this.illuminance_min, maxValue: _this.illuminance_max})
                        .on('get', _this.request.bind(_this, _this.illuminance_id));
                    services.push(_this.lightSensor);
                }

                if (_this.soil_conductivity_id) {
                    _this.lightSensor = new Service.LightSensor(_this.name + "_soil_conductivity",_this.name + "_soil_conductivity");
                    _this.lightSensor
                        .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                        .setProps({minValue: _this.soil_conductivity_min, maxValue: _this.soil_conductivity_max})
                        .on('get', _this.request.bind(_this, _this.soil_conductivity_id));
                    services.push(_this.lightSensor);
                }
            });
        } else {
            if (this.temperature_id) {
                    temperatureService = new Service.TemperatureSensor(this.name + "_temperature");
                    temperatureService
                        .getCharacteristic(Characteristic.CurrentTemperature)
                        .setProps({minValue: this.temperature_min, maxValue: this.temperature_max})
                        .on('get', this.request.bind(this, this.temperature_id));
                    services.push(temperatureService);
            }

            if (this.moisture_id) {
                this.humidityService = new Service.HumiditySensor(this.name + "_humidity");
                this.humidityService
                    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                    .setProps({minValue: this.moisture_min, maxValue: this.moisture_max})
                    .on('get', this.request.bind(this, this.moisture_id));
                services.push(this.humidityService);
            }

            if (this.illuminance_id) {
                this.lightSensor = new Service.LightSensor(this.name + "_illuminance");
                this.lightSensor
                    .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                    .setProps({minValue: this.illuminance_min, maxValue: this.illuminance_max})
                    .on('get', this.request.bind(this, this.illuminance_id));
                services.push(this.lightSensor);
            }

            if (this.soil_conductivity_id) {
                this.lightSensor = new Service.LightSensor(this.name + "_soil_conductivity",this.name + "_soil_conductivity");
                this.lightSensor
                    .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
                    .setProps({minValue: this.soil_conductivity_min, maxValue: this.soil_conductivity_max})
                    .on('get', this.request.bind(this, this.soil_conductivity_id));
                services.push(this.lightSensor);
            }
        }

        return services;
    }
};