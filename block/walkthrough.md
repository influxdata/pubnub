# Walkthrough

This block contains a function to format data from a streams' JSON object into [InfluxDB line protocol format](https://docs.influxdata.com/influxdb/v1.4/write_protocols/line_protocol_tutorial/) send the data to InfluxDB. 

The `influxdb_eh` function in this block listens to the `influxdb-out` channel.

There are a number of configuration options that need to be set up for the block to function correctly.
The options have been annotated with comments with explanations.

To set up an instance of InfluxDB, follow the [Installation guide](https://docs.influxdata.com/influxdb/latest/introduction/installation/).

Note that measurement names, tag keys, and field keys must [escape special characters](https://docs.influxdata.com/influxdb/v1.4/write_protocols/line_protocol_tutorial/#special-characters-and-keywords), like commas, spaces, and equal signs.
