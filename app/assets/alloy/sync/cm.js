var API_KEY = null;
var URL = null;

function S4() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

/**
 * @param {Object} config
 */
function InitAdapter(config) {

    API_KEY = config.API_KEY;
    URL = config.URL;

    return {};
}

/**
 *
 * @param {Object} _options
 * @param {Object} _callback
 */
function apiCall(_options, _callback) {

    var xhr = Ti.Network.createHTTPClient({
        timeout : 5000
    });

    //Prepare the request
    xhr.open(_options.type, _options.url);

    xhr.onload = function() {
        _callback({
            success: true,
            responseText: xhr.responseText || null,
            responseData: xhr.responseData || null
        });
    };

    //Handle error
    xhr.onerror = function() {
        _callback({
            'success' : false,
            'responseText' : xhr.responseText
        });
        Ti.API.error('SYNC ERROR: ' + xhr.responseText)
    }
    for (var header in _options.headers) {
        xhr.setRequestHeader(header, _options.headers[header]);
    };

    if (_options.beforeSend)
        _options.beforeSend(xhr);

    //Make the request
    xhr.send(_options.data || null);
}

/**
 *
 * @param {Object} model
 * @param {Object} method
 * @param {Object} opts
 */
function Sync(model, method, opts) {
    var methodMap = {
        'create' : 'POST',
        'read' : 'GET',
        'update' : 'PUT',
        'delete' : 'DELETE',
        'upload' : 'UPLOAD'
    };

    var type = methodMap[method], params = _.extend({}, opts);
    params.type = type;

    //set default headers
    params.headers = params.headers || {};

    // Ensure that we have a URL
    if (!params.url) {
        params.url = (URL || model.url());
        if (!params.url) {
            urlError();
            return;
        }
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Alloy.Backbone.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.processData = true;
        params.data = params.data ? {
            model : params.data
        } : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Alloy.Backbone.emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
            if (Alloy.Backbone.emulateJSON)
                params.data._method = type;
            params.type = 'POST';
            params.beforeSend = function(xhr) {
                params.headers['X-HTTP-Method-Override'] = type
            };
        }
    }

    //Add CLOUDMINE request headers etc.
    params.headers['X-CloudMine-ApiKey'] = API_KEY;
    params.headers['Content-Type'] = 'application/json';

    switch(method) {

        case 'delete' :
            debugger;

            var model_attr = JSON.parse(params.data)[id];

            // set url for delete
            params.url = params.url + '?keys=' + model.id;
            params.data = null;

            // change url from text to data when delete
            params.url = params.url.replace('text', 'data');

            apiCall(params, function(_response) { debugger;
                if (_response.success) {
                    var data = JSON.parse(_response.responseText).success;

                    // set the model id of the object
                    model_attr.id = null
                    params.success(model_attr, _response.responseText);

                    // fire event
                    model.trigger("fetch");
                } else {
                    params.error(JSON.parse(_response.responseText), _response.responseText);
                    Ti.API.error('SYNC ERROR: ' + _response.responseText)
                }
            });
            break;
        case 'create' :
            debugger;
            // add an id
            var id = model.id || guid(), data = {};

            // we create the model id, need to save it
            data[id] = model.toJSON();

            // set the id on the object
            data[id].id = id;

            // convert to string for API call
            params.data = JSON.stringify(data);

            apiCall(params, function(_response) {
                if (_response.success) {
                    var data = JSON.parse(_response.responseText).success;
                    var model_attr = JSON.parse(params.data)[id];

                    // set the model id of the object
                    //model_attr.id = id
                    params.success(model_attr, JSON.stringify(model_attr));

                    // fire event
                    model.trigger("fetch");
                } else {
                    params.error(JSON.parse(_response.responseText), _response.responseText);
                    Ti.API.error('SYNC ERROR: ' + _response.responseText)
                }
            });
            break;
        case 'update' :
            if (!model.id) {
                params.error(null, "MISSING ID");
                Ti.API.error("SYNC ERROR: " + "MISSING ID");
                return;
            }

            // setup the data
            var id = model.id, data = {};
            data[id] = model.toJSON();
            params.data = JSON.stringify(data);
            apiCall(params, function(_response) {
                if (_response.success) {
                    var data = JSON.parse(_response.responseText).success, model_attr = JSON.parse(params.data)[id];
                    model_attr.id = id;
                    params.success(model_attr, JSON.stringify(model_attr));
                    model.trigger("fetch");
                } else {
                    params.error(JSON.parse(_response.responseText), _response.responseText);
                    Ti.API.error("SYNC ERROR: " + _response.responseText);
                }
            });
            break;

        case 'read' :
            debugger;

            // doing a get on a model add the id to 
            // the url
            if (model.id) {
                if (model.upload) {
                    params.url = params.url + '/' + model.id;
                } else {
                    params.url = params.url + '?key=' + model.id;
                }
            }
            
            
            apiCall(params, function(_response) {
                if (_response.success) {
                    var data = JSON.parse(_response.responseText).success;
                    var values = [];
                    model.length = 0;
                    for (var i in data) {
                        var item = {};
                        item = data[i];
                        item.id = i;
                        values.push(item);
                        model.length++;
                    }

                    params.success((model.length === 1) ? values[0] : values, _response.responseText);
                    model.trigger("fetch");
                } else {
                    params.error(JSON.parse(_response.responseText), _response.responseText);
                    Ti.API.error('SYNC ERROR: ' + _response.responseText)
                }
            })
            break;

        case 'upload' :
            var data = model.get("data");

            //set model id
            model.id = guid();
            model.set({
                id : model.id
            });

            // change type to put
            params.type = 'PUT';

            // change url from text to data when delete
            params.url = params.url.replace('text', 'binary');

            // set url for upload
            params.url = params.url + '/' + model.id + '&filename=' + model.filename || null;
            params.data = null;

            if (!data.mimeType) {
                data = Ti.Filesystem.getFile(model.get("data")).read();
            }
            // set the data
            params.data = data;

            // set content type
            params.headers['Content-Type'] = data.mimeType;

            apiCall(params, function(_response) {
                if (_response.success) {
                    var data = JSON.parse(_response.responseText).success;
                    var model_attr = model;

                    // set the model id of the object
                    //model_attr.id = id
                    params.success(model_attr.toJSON());

                    // fire event
                    model.trigger("fetch");
                } else {
                    params.error(JSON.parse(_response.responseText), _response.responseText);
                    Ti.API.error('SYNC ERROR: ' + _response.responseText)
                }
            });

            break;
    }

};

var _ = require("alloy/underscore")._, db;

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config) {
    config = config || {};
    InitAdapter(config);
    return config;
};

module.exports.afterModelCreate = function(Model) {
    Model = Model || {};
    Model.prototype.config.Model = Model;
    return Model;
};
