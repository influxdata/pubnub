// InfluxDB Documentation: https://docs.influxdata.com/influxdb/latest/introduction/getting_started/
export default (request) => {
    const xhr = require('xhr');
    const auth = require('codec/auth');
    const vault = require('vault');

    ////// TODO: The following fields should be configured by the user

    // InfluxDB username for basic auth
    // Password should be set in the PubNub vault
    const username = 'admin';

    // The hostname and port of your InfluxDB or Telegraf instance
    // E.g. an InfluxCloud URL https://biff-b6196eba.influxcloud.net:8086
    const hostname = 'https://telegraf-example.com:8086';

    // A database name is required and must exist in InfluxDB
    const database = 'pubnub'; // e.g. pubnub, telegraf, test, prod

    // The following constants define the point to be sent to InfluxDB in line
    // protocol format
    // The default values below are taken from PubNub's Sensor Network demo
    // stream as an example
    // See documentation: https://docs.influxdata.com/influxdb/v1.4/write_protocols/line_protocol_tutorial/
    
    // A measurement is required and should describe what is being monitored
    // Note: must backslash escape commas and spaces in measurement name
    const measurement = 'sensor-network'; // e.g. cpu, sensor, client_status

    // Tag keys are meta data added to each point to make searching easier
    // Tag keys listed in this array will match any keys in the message
    // Tags are optional and not required
    // Note: must backslash escape commas, equal signs, and spaces in tag keys
    const tagKeys = ['sensor_uuid', 'anothertagkey'];

    // The field set is composed of multiple key-value pairs
    // At least one field key is required
    // Field values can have type string, float, integer, and boolean
    // Note: must backslash escape commas, equal signs, and spaces in field keys
    const fieldKeys = [
        {'name':'ambient_temperature', 'type': 'float'},
        {'name':'radiation_level', 'type':'integer'},
        {'name':'somebooltag', 'type':'boolean'},
        {'name':'astringtag', 'type':'string'}
    ];

    // If a timestamp is included in the JSON, it should be in microseconds

    ////// END TODO

    function escapeTagValue(t) {
        return t.replace(/[,= ]/, '\\$&');
    }

    function formatFieldValue(v, t) {
        switch (t) {
            case 'float':
            case 'boolean':
                return v;
            case 'integer':
                return Math.floor(v) + 'i';
            default:
                // format to string type by default
                return '"' + v.replace('"', '\\"') + '"';
        }
    }

    // The line protocol of the point needs to be constructed
    function buildPoint(msg) {
        const tagSet = tagKeys.filter(k => msg.hasOwnProperty(k)).map(k => k + '=' + escapeTagValue(msg[k]));
        const fieldSet = fieldKeys.filter(k => msg.hasOwnProperty(k.name)).map(k => k.name + '=' + formatFieldValue(msg[k.name], k.type));
        const timestamp = msg.timestamp * 1000000 || new Date() * 1000000;

        // Raise exception if no field key is present
        if (!fieldSet.length) {
            throw new Error('point has no fields');
        }
        return measurement + ((tagSet.length === 0) ? '' : ',') + tagSet.join(',') + ' ' + fieldSet.join(',') + ' ' + timestamp;
    }

    try {
        return vault.get('INFLUXDB_PASSWORD').then((password) => {
            const url = hostname + '/write?db=' + database;
            const params = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: auth.basic(username, password),
                    Accept: 'application/json'
                },
                body: buildPoint(request.message)
            };

            return xhr.fetch(url, params).then(function () {
                return request.ok();
            });
        });
    } catch (e) {
        console.error('Uncaught exception:', e);
    }
};
