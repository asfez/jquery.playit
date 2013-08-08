if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };

; (function ($, window, document, undefined) {
   
    
    function player(element, options) {
        options = options || {};
        this.element = element;
        this.metada = $(element).data("playit") || {};
        this.id = $(element).attr("id");
        this.options = $.extend({}, this.metada, options);
        this.selector = options.selector || "[data-playit]";
        this.configurator = options.configurator || playit.defaults.configurator || function (){};
        this.markers = {};
        this._name = pluginName;
        this.states = [];
        this.statesById = {};
        this.init();

        this.currentState = this.states[0];
    }

  
    player.prototype = {

        init: function() {
            var me = $(this.element);
            var self = this;
            
            this.statesById[this.id] = this;

            me.find(this.selector).each(function() {
                if (!$(this).attr("data-playit")) $(this).attr("data-playit", "{}");

                var state = self.createState($(this));
                self.statesById[state.id] = state;
                self.states.push(state);
            });
            this.initAllStates();
        },

        notifyChange : function() {
            $(this.element).trigger("change", this);
        },

        forward : function() {
            if (this.running) return null;
            var self = this;
            var promise = this.currentState.forward();
          
            if (promise != null) {
                this.running = true;
                promise.done(function() {
                    self.running = false;
                    self.notifyChange();
                });
            } else {
                self.notifyChange();
            }
            return promise;
        },
        

        backward : function() {
            
            var self = this;
            if (self.running ||!self.currentState.prevState) return null;

            self.currentState = self.currentState.prevState;
            var promise = this.currentState.backward();
          
            if (promise != null) {
                this.running = true;
                promise.done(function() {
                    self.running = false;
                    self.notifyChange();
                });
            } else {
                self.notifyChange();
            }
            
            return promise;
        },
        

         flyTo : function(markerId) {
             var self = this;
             var marker = this.markers[markerId];
             
             if (!marker || this.running || this.currentState == marker.state) return null;

             this.running = true;

             var flyChain = [];
             var o1 = this.currentState.order;
             var o2 = marker.state.order;
             for (var i = o1; (o1 < o2) ? (i < o2) : (i > o2); (o1 < o2) ? (i++) : (i--)) {
                 flyChain.push(this.states[i]);
             }

             var direction = o1 < o2 ? "flyForward" : "flyBackward";
             var deferred = $.Deferred();

             var endProcess = function() {
                 flyChain.shift();
                 processFlyChain();
             };

             var processFlyChain = function() {
                 if (flyChain.length == 0) {
                     self.running = false;
                     deferred.resolve();
                     self.notifyChange();
                     return;
                 }
                 //last step, play a simple forward
                 if (flyChain.length == 1) {
                     direction = "forward";
                 }
                 
                 var s = flyChain[0];
                 var promise = s[direction]();
                 if (!promise) {
                     endProcess();
                     return;
                 }
                 promise.done(function() {
                     endProcess();
                 });
             };

             processFlyChain();
             return deferred.promise();
         },


        createState : function(element) {
            var state = new playit.state(this, element, "focusIn"); 
            return state;
        },

        registerMarker : function(marker) {
            this.markers[marker.id] = marker;
        },

        initAllStates: function() {
            var self = this;
            var tmp = this.states.groupBy("el=>el.parent.id");
            var i;
            
            for (i = 0; i < tmp.length; i++) {
                var parent = this.statesById[tmp[i].key];
                for(var j = 0 ; j < tmp[i].items.length ; j++)
                {
                    var el = tmp[i].items[j];
                    if (parent != this) 
                        parent.items.push(el);
                }
            }
            
            tmp = this.states.where("el=>el.parent == value", this);
            self.states = [];

            for (i = 0; i < tmp.length; i++) {
                this.exploreState(tmp[i]);
            }

            for (i = 0; i < this.states.length; i++) {
                var state = self.states[i];
                this.configurator(state);
                state.order = i;

                state.init();
                
                if (i > 0) {
                    state.prevState = self.states[i - 1];
                }
                if (i < self.states.length - 1) {
                    state.nextState = self.states[i + 1];
                }
                console.log(state.id + " " + state.type);

            }
        },
        
        _createOutState : function(state) {
            var s = new playit.state(this, state.element, "focusOut"); 
            s.id = "out" + state.id;
            this.statesById[s.id] = s;
            return s;
        },
        
        exploreState : function(state) {
            this.states.push(state);
            for (var i = 0; i < state.items.length; i++) {
                this.exploreState(state.items[i]);
            }
            this.states.push(this._createOutState(state));
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