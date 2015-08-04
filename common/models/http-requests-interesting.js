module.exports = function(HttpRequestsInteresting) {
  /**
  * Returns all the reports that have been collected
  * @param {string[]} country_code country codes to filter by
  * @param {number} limit maximum number of results to return
  * @callback {Function} callback Callback function
  * @param {Error|string} err Error object
  * @param {Object} result Result object
  */
  HttpRequestsInteresting.findInteresting = function(country_code, input, fields, callback) {
    var filter = {
      fields: {},
      where: {}
    };
    if (country_code && country_code.length) {
      filter.where["probe_cc"] = {inq: country_code};
    }
    if (input && input.length) {
      filter.where["input"] = {like: input};
    }
    if (fields && fields.length) {
      fields.forEach(function(field){
        filter.fields[field] = true;
      });
    };
    function done(err, data) {
      var interesting = {};
      data.forEach(function(report){
        interesting[report.report_id] = interesting[report.report_id] || [];
        interesting[report.report_id].push(report);
      });
      callback(err, interesting);
    }
    HttpRequestsInteresting.find(filter, done)
  }
  
  HttpRequestsInteresting.listInteresting = function(key, callback) {
    var allowed_keys = ["report_id", "test_name", "probe_cc", "probe_asn", "start_time"];
    if (allowed_keys.indexOf(key) === -1) {
      callback(new Error("Key must be in " + allowed_keys));
    }
    var filter = {
      fields: {}
    }
    allowed_keys.forEach(function(k){
      filter.fields[k] = true;
    });
    function done(err, data) {
      var reports = {};
      data.forEach(function(item) {
        var key_value = item[key];
        reports[key_value] = reports[key_value] || {count: 0};
        reports[key_value]["count"] += 1;
      });
      callback(err, reports);
    }
    HttpRequestsInteresting.find(filter, done);
  }

  HttpRequestsInteresting.remoteMethod('findInteresting',
    { isStatic: true,
    produces: [ 'application/json', 'application/xml', 'text/xml', 'text/html' ],
    accepts: 
    [ { arg: 'country_code',
        type: [ 'string' ],
        description: 'country codes to filter by',
        required: false,
        http: { source: 'query' } },
      { arg: 'input',
        type: [ 'string' ],
        description: 'the input to look for',
        required: false,
        http: { source: 'query' } },
       
        { arg: 'fields',
        type: [ 'string' ],
        description: 'list of fields to include in response',
        required: false,
        http: { source: 'query' } },
      { arg: 'limit',
        type: 'number',
        description: 'maximum number of results to return',
        required: false,
        http: { source: 'query' } }],
    returns: 
    [ { description: 'unexpected error',
        type: 'Object',
        arg: 'data',
        root: true } ,
      {
        description: 'list of reports',
        type: 'array',
        arg: 'reports'
      }
    ],
    http: { verb: 'get', path: '/find' },
    description: 'Returns all the report headers that have been collected' }
  );

  HttpRequestsInteresting.remoteMethod('listInteresting',
    { isStatic: true,
    produces: [ 'application/json', 'application/xml', 'text/xml', 'text/html' ],
    accepts: 
    [ { arg: 'by',
        type: 'string',
        description: 'what should be the key to list report files by',
        required: true,
        http: { source: 'query' } }],
    returns: 
    [ { description: 'unexpected error',
        type: 'Object',
        arg: 'data',
        root: true } ],
    http: { verb: 'get', path: '/list' },
    description: 'Returns all the report files submitted' }
  );
};
