if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };


playit.defaults.slide =
{
    focusIn: {
        forward: playit.fx.fadeIn,
        backward: playit.fx.hide,
        flyForward: playit.fx.hide,
        flyBackward: playit.fx.hide
    },
    focusOut: {
        forward: playit.fx.fadeOut,
        backward: playit.fx.show,
        flyForward: playit.fx.hide,
        flyBackward: playit.fx.hide
    }
};

playit.defaults.list = playit.defaults.text = playit.defaults.image = playit.defaults.generic = 
{
    focusIn: {
        forward: playit.fx.fadeIn,
        backward: playit.fx.hide,
        flyForward: playit.fx.hide,
        flyBackward: playit.fx.hide
    },
    focusOut: {
        forward: playit.fx.none,
        backward: playit.fx.show,
        flyForward: playit.fx.hide,
        flyBackward: playit.fx.hide
    }
};

playit.defaults.configurator = function (state) {
    if (state.type != "focus") {
        state.on("endForward", function (s) {
            if (s.nextState) {
                s.nextState.forward();
            }
        });
        state.on("endBackward", function (s) {
            if (s.prevState) {
                s.prevState.backward();
            }
        });
    }

    if (state.type == "focusIn") {
        state.on("endBackward", function (s) {
            if (s.prevState && s.prevState.type == "focusOut") {
                s.prevState.backward();
            }
        });
        state.on("init", function (s) {
            s.element.css("display", "none");
        });
    }
    var d;
    
    if ($(state.element).hasClass("slide")) {
        d = playit.defaults.slide[state.type];
    } else {
        d = playit.defaults[state.content][state.type] || playit.defaults.generic[state.type];
    }



    for (var p in d) {
        state.transitions[p] = d[p];
    }


};
    