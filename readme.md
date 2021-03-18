# Homebridge esphome Mi Flower care

## Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-esphome-mi-flower-care using: npm install -g homebridge-esphome-mi-flower-care
3. Update your configuration file. See [Example Config](#example-config) for a sample.

## Configuration

### Parameters
| parameter       | description                                                | default                 | required |
|-----------------|------------------------------------------------------------|-------------------------|----------|
| url             | The url to fetch temperature (and humidity)                | /                       | true     |
| type            | Serial of the accessory                                    |                         | true     |
| http_method     | The http method                                            | GET                     | false    |
| sendimmediately | see https://github.com/request/request#http-authentication | false                   | false    |
| username        | Username for http-authentication                           | /                       | false    |
| password        | Password for http-authentication                           | /                       | false    |
| name            | Name of the homekit accessory                              | /                       | true     |
| manufacturer    | Name of the manufacturer of the accessory                  | HttpTemperatureHumidity | false    |
| model           | Name of the model of the accessory                         | Default                 | false    |
| serial          | Serial of the accessory                                    | 18981898                | false    |



### Example Config

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CD:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-156"
  },

  "description": "Example",

  "platforms": [],

  "accessories": [
    {
      "accessory": "EsphomeMiFlowerCare",
      "name": "Temperature",
      "url": "http://192.168.178.210/sesnor/xiomi_sensor_temperature"
      "type": "temperature"
    }
  ]
}
```