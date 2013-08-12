if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };

; (function ($, window, document, undefined) {
   
    
    function player(element, options) {
        options = options || {};
        this.element = element;
        this.metada = $(element).data("playit") || {};
        this.id = $(element).attr("id");
        this.options = $.extend({}, this.metada, options);
        this.selectors = this.readSelectors(options.selectors || "[data-playit]");
        this.configurator = options.configurator || playit.defaults.configurator || function (){};
        this.markers = {};
        this._name = pluginName;
        this.states = [];
        this.direction = "forward";
        this.statesById = {};
        this.init();

        this.currentState = this.states[0];
    }

  
    player.prototype = {

        init: function() {
            var me = $(this.element);
            var self = this;

            this.statesById[this.id] = this;

            var elems = [];
            var i;
            for (i = 0; i < self.selectors.length; i++) {
               var s = self.selectors[i].selector;
               me.find(s).each(function() {
                   if (!$(this).attr("data-playit")) $(this).attr("data-playit", "{}");
                   $(this).data("selector", self.selectors[i]);
                   elems.push($(this));
               });
           }

            for (i = 0; i < elems.length; i++) {
                var el = elems[i];
                var state = self.createState(el);
                self.statesById[state.id] = state;
                self.states.push(state);
               
            }
            
            this.initAllStates();
            if(this.configurator.initPlayer)
                this.configurator.initPlayer(this);

        },

        
        readSelectors : function(data) {
            if (!Array.isArray(data)) {
                data = [data];
            }  
            
            for (var i = 0; i < data.length; i++) {
                var s = data[i];
                if (typeof s === "string") {
                    s = {
                        selector: s,
                        type: "generic"
                    };
                    data[i] = s;
                }
            }

            return data;
        },

        notifyChange : function() {
            
            $(this.element).trigger("change", this);
        },

        on : function(eventName, cb) {
            $(this.element).on(eventName, cb);
        },

        forward : function(force) {
            var self = this;
            
            if (this.running && !force || !self.currentState.nextState) return null;
            
            if(self.currentState.type == "focus")
                self.currentState = self.currentState.nextState;
            
            self.direction = "forward";

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
        

        backward : function(force) {
            
            var self = this;
            if (self.running && !force || !self.currentState.prevState) return null;
            
            if(self.currentState.type == "focus")
                self.currentState = self.currentState.prevState;
            self.direction = "backward";
            
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
        
         flyForward : function(markerType) {

             var marker;
             
             for (var i = this.currentState.order + 1; i < this.states.length; i++) {
                 marker = this.states[i].markers.first("el=>el.type && el.type==value", markerType);
                 if(marker) break;
              }
             
             if(marker)
                this.flyTo(marker.id);
         },
        
         flyBackward : function(markerType) {
              var marker;
             var attempt = 0;
             for (var i = this.currentState.order - 1; i >= 0; i--) {
                 marker = this.states[i].markers.first("el=>el.type && el.type==value", markerType);
                 if(marker) break;
                
             }
             
             if(marker)
                this.flyTo(marker.id);
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

             var fct = o1 < o2 ? "flyForward" : "flyBackward";
             self.direction = o1 < o2 ? "forward" : "backward";
             var deferred = $.Deferred();

             var endProcess = function() {
                 self.currentState = flyChain[0];
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
                     fct = self.direction;
                 }
                 
                 var s = flyChain[0];
                 var promise = s[fct](true);
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

        setState : function(state) {
            this.currentState = state;
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
            
            var firstState = self.createState($(this.element));
            firstState.type = "focus";
            firstState.content = "player";
            firstState.id = self.id;
            this.states.splice(0,0,firstState);


            for (i = 0; i < this.states.length; i++) {
                var state = self.states[i];
                if(this.configurator.initState)
                    this.configurator.initState(state);
                state.order = i;

                state.init();
                
                if (i > 0) {
                    state.prevState = self.states[i - 1];
                }
                if (i < self.states.length - 1) {
                    state.nextState = self.states[i + 1];
                }
                


                //console.log(state);
            }
        },
        
        _createState : function(state, type) {
            var s = new playit.state(this, state.element, type); 
            s.id = type + state.id;
            this.statesById[s.id] = s;
            return s;
        },
        
        exploreState : function(state) {
            this.states.push(state);
            this.states.push(this._createState(state, "focus"));
            for (var i = 0; i < state.items.length; i++) {
                this.exploreState(state.items[i]);
            }
            this.states.push(this._createState(state, "focusOut"));
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