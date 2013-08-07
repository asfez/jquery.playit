if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };

; (function ($, window, document, undefined) {
   
    
    function player(element, options) {
        options = options || {};
        this.element = element;
        this.metada = $(element).data("playit");
        this.id = $(element).attr("id");
        this.options = $.extend({}, this.metada, options);
        
        this.configurator = options.configurator || playit.defaults.configurator || function (){};
        this.markers = {};
        this._name = pluginName;
        this.items = [];
        this.itemsById = {};
        this.init();

        this.currentState = this.items[0];
    }

  
    player.prototype = {
        init: function() {
            var me = $(this.element);
            var self = this;
            
            this.itemsById[this.id] = this;

            me.find("[data-playit]").each(function() {
                var state = self.createState($(this));
                self.itemsById[state.id] = state;
                self.items.push(state);
            });
            this.initAllStates();
        },

        forward : function() {
            if (this.running) return;
            var self = this;
            var promise = this.currentState.forward();
          
            if (promise != null) {
                this.running = true;
                promise.done(function() {
                    self.running = false;
                });
            }
        },

        createState : function(element) {
            var state = new playit.state(this, element, "focusIn"); 
            return state;
        },

        registerMarker : function(marker) {
            this.markers[market.id] = marker;
        },

        initAllStates: function() {
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
                state.order = i;
                

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
            var s = new playit.state(this, state.element, "focusOut"); 
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