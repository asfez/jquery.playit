if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };


; (function ($, window, document, undefined) {
    var ids = 100;
    
    // The actual plugin constructor
    function player(element, options) {
        options = options || {};
        this.element = element;
        this.metada = $(element).data("playit");
        this.id = $(element).attr("id");
        this.options = $.extend({}, this.metada, options);
        
        this.configurator = options.configurator || playit.defaults.configurator || function (){};

        this._name = pluginName;
        this.items = [];
        this.itemsById = {};
        this.init();
        
        this.items[0].forward();
    }

    player.prototype = {
        init: function() {
            var me = $(this.element);
            var self = this;
            
            this.itemsById[this.id] = this;

            me.find("[data-playit]").each(function() {
                self.initState($(this));
            });
            this.initStates();

            //this.items[0].next();

        },

        initState : function(element) {
            var self = this;
            var el = $(element);
            if (!el.attr("id")) el.attr("id", "el" + (ids++));
            var meta = el.data("playit");
            var p = el.parents("[data-playit]");
            var state = new playit.state({
                element: el,
                player: self,
                content: meta.type,
                stateType: "in"
            });
            state.parent = p.length == 0 ? state.player : state.player.itemsById[p.attr('id')];
            state.id = el.attr("id");
            state.items = [];
            //self.initState(state);
            self.itemsById[el.attr("id")] = state;
            self.items.push(state);

        },

        initStates: function() {
            var self = this;
            
            var tmp = this.items.groupBy("el=>el.parent.id");
            var i;
            
            for (i = 0; i < tmp.length; i++) {
                var parent = this.itemsById[tmp[i].key];
                for(var j = 0 ; j < tmp[i].items.length ; j++)
                {
                    var el = tmp[i].items[j];
                    if (parent != this) 
                        parent.items.push(el);
                }
            }
            
            tmp = this.items.where("el=>el.parent == value", this);
            self.items = [];

            for (i = 0; i < tmp.length; i++) {
                this.exploreState(tmp[i]);
            }

            for (i = 0; i < this.items.length; i++) {
                var state = self.items[i];
                this.configurator(state);
                state.init();
                if (i > 0) {
                    state.prevState = self.items[i - 1];
                }
                if (i < self.items.length - 1) {
                    state.nextState = self.items[i + 1];
                }
                console.log(state.id + " " + state.type);

            }
        },

        _createOutState : function(state) {
              var s =  new playit.state({
                    type : "focusOut",
                    element:state.element,
                    player: self,
                    parent : state.parent,
                    content: state.content
                });
            s.id = "out" + state.id;
            this.itemsById[s.id] = s;
            return s;
        },
        
        exploreState : function(state) {
            this.items.push(state);
            for (var i = 0; i < state.items.length; i++) {
                this.exploreState(state.items[i]);
            }
            this.items.push(this._createOutState(state));
        }


};

    var pluginName = "playit";
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new player(this, options));
            }
        });
    };

})(jQuery, window, document);