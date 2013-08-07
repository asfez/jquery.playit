if(!window.playit)
    window.playit = { player: {}, fx: {}, defaults : {} };

playit.state = function (options) {
 
    this.config = options || {};
    this.element = options.element;

    this.content = options.content || "generic";
    this.type = options.type || "focusIn";
   
    this.player = options.player;
    this.nextState = null;
    this.prevState = null;

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
        endbackward: new $.Callbacks(),
        flyBackward: new $.Callbacks(),
        endFlyBackward: new $.Callbacks(),
    };


};

playit.state.prototype.forward = function () {
    var self = this;
    if (!self.transitions.forward) {
        self.events.endForward.fire(self);
        return null;
    };

    var t = new self.transitions.forward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endForward.fire(self);
    });
    t.start();
    return t.deferred();
};


playit.state.prototype.backward = function () {
    var self = this;

    if (!self.transitions.backward) {
        self.events.endBackward.fire(self);
        return null;
    };

    var t = new self.transitions.backward(self);
    self.currentFx = t;
    t.deferred().done(function () {
        self.currentFx = null;
        self.events.endBackward.fire(self);
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