var buttonListener = {
    disabled : false,
    listeners:{},
    keyDowned:[],
    addListener:function COMMON(key, listener) {
        if (this.listeners[key] == undefined)
            this.listeners[key] = [];
        if (this.listeners[key].indexOf(listener) == -1) {
            this.listeners[key].unshift(listener);
            this.listeners[key].sort(function COMMONJS(a, b) {
                var a_p = a.callbacks? (a.callbacks[key].priority?a.callbacks[key].priority:0) : (a.priority?a.priority:0);
                var b_p = b.callbacks? (b.callbacks[key].priority?b.callbacks[key].priority:0) : (b.priority?b.priority:0);
                return b_p - a_p;
            });
        }
    },
    removeListener:function COMMONJS(listener) {
        for (var key in this.listeners) {
            this.removeListenerByKey(key, listener);
        }
    },
    removeListenerByKey:function COMMON(key, listener) {
        var ret = false;
        if (this.listeners[key]) {
            this.listeners[key] = this.listeners[key].filter(function(value) {
                ret = ret?ret:(value == listener);
                return value != listener
            })
        }
        return ret;
    },
    keyDown:function(e) {
        this.keyDowned.indexOf(e.keyCode) == -1 && this.keyDowned.push(e.keyCode);
    },
    keyUp:function(e) {
        var index = this.keyDowned.indexOf(e.keyCode);
        index != -1 && this.keyDowned.splice(index, 1);
    },
    update:function() {
        var self = this;
        this.keyDowned.forEach(function(key) {
            var listeners = self.listeners[key];
            listeners && listeners.forEach(function(listener) {
                listener.callbacks[key] && listener.callbacks[key].callback();
            })
        })
    }
}