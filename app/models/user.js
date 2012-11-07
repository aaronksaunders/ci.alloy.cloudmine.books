exports.definition = {

    config : {
        "adapter" : {
            "type" : "cm",
        },
        API_KEY : "API KEY GOES HERE",
        URL : "https://api.cloudmine.me/v1/app/d79a985bbf874535b8ac91da60234207/binary"
    },

    extendModel : function(Model) {

        function logout(_opts) {

        }

        function showMe(_opts) {

        }

        function login(_login, _password, _opts) {

        }


        _.extend(Model.prototype, {
            login : login,
            showMe : showMe,
            logout : logout,
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