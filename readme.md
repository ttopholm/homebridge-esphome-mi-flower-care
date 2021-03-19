# Homebridge esphome Mi Flower care

## Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-esphome-mi-flower-care using: npm install -g homebridge-esphome-mi-flower-care
3. Update your configuration file. See [Example Config](#example-config) for a sample.

## Configuration

### Parameters
| parameter             | description                                                | default                 | required |
|-----------------------|------------------------------------------------------------|-------------------------|----------|
| name                  | Name of the homekit accessory                              |                         | true     |
| url                   | The url to fetch temperature (and humidity)                |                         | true     |
| temperature_id        | The id refers to the id of the component -                 |                         | false    |
|                       | this ID is created by taking the name of the component,    |                         |          |
|                       | stripping out all non-alphanumeric characters,             |                         |          |
|                       | making everything lowercase and replacing all spaces by    |                         |          |
|                       | underscores.                                               |                         |          |
| temperature_id        | The id refers to the id of the component -                 |                         | false    |
|                       | this ID is created by taking the name of the component,    |                         |          |
|                       | stripping out all non-alphanumeric characters,             |                         |          |
|                       | making everything lowercase and replacing all spaces by    |                         |          |
|                       | underscores.                                               |                         |          |
| moisture_id.          | The id refers to the id of the component -                 |                         | false    |
|                       | this ID is created by taking the name of the component,    |                         |          |
|                       | stripping out all non-alphanumeric characters,             |                         |          |
|                       | making everything lowercase and replacing all spaces by    |                         |          |
|                       | underscores.                                               |                         |          |
| illuminance_id        | The id refers to the id of the component -                 |                         | false    |
|                       | this ID is created by taking the name of the component,    |                         |          |
|                       | stripping out all non-alphanumeric characters,             |                         |          |
|                       | making everything lowercase and replacing all spaces by    |                         |          |
|                       | underscores.                                               |                         |          |
| soil_conductivity_id  | The id refers to the id of the component -                 |                         | false    |
|                       | this ID is created by taking the name of the component,    |                         |          |
|                       | stripping out all non-alphanumeric characters,             |                         |          |
|                       | making everything lowercase and replacing all spaces by    |                         |          |
|                       | underscores.                                               |                         |          |




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
      "accessory": "EsphomeMiFlowerCare"
      "name": "Temperature",
      "url": "http://1.2.3.4",
      "temperature_id": "xiaomi_hhccjcy01_temperature",
      "moisture_id": "xiaomi_hhccjcy01_moisture",
      "illuminance_id": "xiaomi_hhccjcy01_illuminance",
      "soil_conductivity_id": "xiaomi_hhccjcy01_soil_conductivity",
    }
  ]
}
```
