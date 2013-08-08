if(!window.playit)
    window.playit = { player: {}, fx: {}, defaults : {} };

playit.ids = 100;
playit.state = function (player, element , type) {
    this.player = player;
    var el = $(element);

    //auto attribute an id to the html element and state if needed.
    if (!el.attr("id")) el.attr("id", "el" + (playit.ids++));
    
    var meta = el.data("playit") || {};
    
    var p = el.parents("[data-playit]");    
    
    this.id = el.attr("id");
    
    this.element = el;
    this.parent =  p.length == 0 ? player : player.statesById[p.attr('id')];
    
    this.content = meta.type || "generic";
    this.type = type || "focusIn";
    
    this.items = [];
    
    this.nextState = null;
    this.prevState = null;
    this.markers = {};
    this.order = 0;

    this.transitions = {
        forward : playit.fx.show,
        backward : playit.fx.hide,
    };

    this.events = {
        init: new $.Callbacks(),
        activate: new $.Callbacks(),
        leave: new $.Callbacks(),
        forward: new $.Callbacks(),
        endForward: new $.Callbacks(),
        flyForward: new $.Callbacks(),
        endFlyForward: new $.Callbacks(),
        backward: new $.Callbacks(),
        endBackward: new $.Callbacks(),
        flyBackward: new $.Callbacks(),
        endFlyBackward: new $.Callbacks()
    };

    if (meta.marker) this.addMarker(meta.marker, {});
};

playit.state.prototype.addMarker = function(id, options) {
    var r = new playit.marker(this, id, options);
    this.markers[id] = r;
    this.player.registerMarker(r, this);
};

playit.state.prototype.forward = function () {
    var self = this;
    if (!self.transitions.forward) {
        self.events.endForward.fire(self);
        if(self.nextState)
            self.player.currentState = self.nextState;
        return null;
    };

    var t = new self.transitions.forward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endForward.fire(self);
        if(self.nextState)
            self.player.currentState = self.nextState;
    });
    t.start();
    return t.deferred();
};

playit.state.prototype.flyForward = function () {
    var self = this;
    if (!self.transitions.flyForward) {
        self.events.endFlyForward.fire(self);
        if(self.nextState)
            self.player.currentState = self.nextState;
        return null;
    };

    var t = new self.transitions.flyForward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endFlyForward.fire(self);
        if(self.nextState)
            self.player.currentState = self.nextState;
    });
    t.start();
    return t.deferred();
};


playit.state.prototype.backward = function () {
   var self = this;
    if (!self.transitions.backward) {
        self.events.endBackward.fire(self);
        if(self.prevState)
            self.player.currentState = self.prevState;
        return null;
    };

    var t = new self.transitions.backward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endBackward.fire(self);
        if(self.prevState)
            self.player.currentState = self.prevState;
    });
    t.start();
    return t.deferred();
};


playit.state.prototype.flyBackward = function () {
    var self = this;
    if (!self.transitions.flyBackward) {
        self.events.endFlyBackward.fire(self);
        if(self.prevState)
            self.player.currentState = self.prevState;
        return null;
    };

    var t = new self.transitions.flyBackward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endFlyBackward.fire(self);
        if(self.prevState)
            self.player.currentState = self.prevState;
    }); 
    t.start();
    return t.deferred();
};

playit.state.prototype.open = function () {
    this.events.open.fire(this);
};

playit.state.prototype.close = function () {
    this.events.close.fire(this);
};

playit.state.prototype.init = function () {
    this.events.init.fire(this);
};

playit.state.prototype.on = function (eventName, callback) {
    if (!this.events[eventName])
        this.events[eventName] = new $.Callbacks();
    this.events[eventName].add(callback);
};

playit.state.prototype.getCallbacks = function (eventName) {
    return this.events[eventName];
};

playit.marker = function(state, id, options) {
    options = options || {};
    this.player = state.player;
    this.state = state;
    this.id = id;
    this.name = options.name || id;
}