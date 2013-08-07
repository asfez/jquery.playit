if (!window.playit)
    window.playit = { player: {}, fx: {}, defaults: {} };


/*------------------------------------------------------
-   None
-------------------------------------------------------*/
playit.fx.none = function (state) {
    this.transition = $.Deferred();
    this.state = state;
};
playit.fx.none.prototype = {
    start: function () {
        this.transition.resolve();
    },

    deferred: function () {
        return this.transition.promise();
    }
};

/*------------------------------------------------------
-   Show
-------------------------------------------------------*/
playit.fx.show = function (state) {
    this.transition = $.Deferred();
    this.state = state;
};
playit.fx.show.prototype = {
    start: function () {
        console.log("show:" + this.state.id);
        var  self = this;
        if (this.state.element) $(this.state.element).css("display", "block");


        this.transition.resolve();
    },

    deferred: function () {
        return this.transition.promise();
    }
};



playit.fx.tween = function (state) {
    this.transition = $.Deferred();
    this.state = state;
};
playit.fx.tween.prototype = {
    start: function () {
        console.log("show:" + this.state.id);
        var self = this;
        $(this.state.element).css("display", "block");
        TweenLite.to($(this.state.element), 1.5, { width: 100 });
        setTimeout(function () {
            self.transition.resolve();
        }, 2000);
        
    },

    deferred: function () {
        return this.transition.promise();
    }
};


/*------------------------------------------------------
-   Hide
-------------------------------------------------------*/
playit.fx.hide = function (state) {
    this.transition = $.Deferred();
    this.state = state;
};
playit.fx.hide.prototype = {
    start: function () {
        console.log("hide:" + this.state.id);
        if (this.state.element) $(this.state.element).css("display", "none");
        this.transition.resolve();
    },

    deferred: function () {
        return this.transition.promise();
    }
};


/*------------------------------------------------------
-   Fadein
-------------------------------------------------------*/
playit.fx.fadeIn = function (state) {
    this.transition = $.Deferred();
    this.state = state;
};



playit.fx.fadeIn.prototype = {
    start: function () {
        console.log("fadein:" + this.state.id);
        var self = this;
        if (!this.state.element) {
            this.transition.resolve();
            return;
        }
        this.state.element.fadeIn(500).promise().done(function () {
            self.transition.resolve();
        });
    },

    deferred: function () {
        return this.transition.promise();
    }
};


