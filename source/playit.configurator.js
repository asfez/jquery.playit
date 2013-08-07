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
        forward: playit.fx.hide,
        backward: playit.fx.fadeIn,
        flyForward: playit.fx.hide,
        flyBackward: playit.fx.hide
    }
};

playit.defaults.list = playit.defaults.text = playit.defaults.image = playit.defaults.generic = 
{
    focusIn: {
        forward: playit.fx.tween,
        backward: playit.fx.hide,
        flyForward: playit.fx.show,
        flyBackward: playit.fx.hide
    },
    focusOut: {
        forward: playit.fx.none,
        backward: playit.fx.fadeIn,
        flyForward: playit.fx.none,
        flyBackward: playit.fx.show
    }
};

playit.defaults.configurator = function (state) {
    if (state.type == "focusOut") {
        state.on("endForward", function(s) {
            if (s.nextState) {
                s.nextState.forward();
            }
        });
    }

    if (state.type == "focusIn") {
        state.on("init", function (s) {
            s.element.css("display", "none");
        });
    }

    var d = playit.defaults[state.content][state.type] || playit.defaults.generic[state.type];

    for (var p in d) {
        state.transitions[p] = d[p];
    }


};
    