exports.definition = {

    config : {
        "adapter" : {
            "type" : "cm",
        },
        API_KEY : "API KEY GOES HERE",
        URL : "https://api.cloudmine.me/v1/app/d79a985bbf874535b8ac91da60234207/binary"
    },

    extendModel : function(Model) {
        _.extend(Model.prototype, {

            getURL : function() {
                model.sync('read', model, {
                    success : function(data) { debugger;
                        Ti.API.info("login " + JSON.stringify(data));
                        _opts.success && _opts.success(new Model(data));
                    },
                    error : function(data) {
                        _opts.error && _opts.error(data);
                    }
                });
            },
            upload : function() {

                var model = this;
                model.sync('upload', model, {
                    success : function(data) { debugger;
                        Ti.API.info("login " + JSON.stringify(data));
                        _opts.success && _opts.success(new Model(data));
                    },
                    error : function(data) {
                        _opts.error && _opts.error(data);
                    }
                });

            }
        });
        // end extend

        return Model;
    },

    extendCollection : function(Collection) {
        _.extend(Collection.prototype, {

        });
        // end extend

        return Collection;
    }
}