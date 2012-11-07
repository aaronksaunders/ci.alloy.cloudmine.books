exports.definition = {

    config : {
        "adapter" : {
            "type" : "cm",
        },
        API_KEY : "API KEY GOES HERE",
        URL : "https://api.cloudmine.me/v1/app/d79a985bbf874535b8ac91da60234207/text"
    },

    extendModel : function(Model) {
        _.extend(Model.prototype, {

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