var keyListener = {
    disabled : false,
    listeners:{},
    addListener:function COMMON(key, listener) {
        var key_converted = this.key_conversion(key);
        if (this.listeners[key_converted] == undefined)
            this.listeners[key_converted] = [];
        if (this.listeners[key_converted].indexOf(listener) == -1) {
            this.listeners[key_converted].unshift(listener);
            this.listeners[key_converted].sort(function COMMONJS(a, b) {
                var a_p = a.callbacks? (a.callbacks[key_converted].priority?a.callbacks[key_converted].priority:0) : (a.priority?a.priority:0);
                var b_p = b.callbacks? (b.callbacks[key_converted].priority?b.callbacks[key_converted].priority:0) : (b.priority?b.priority:0);
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
        var key_converted = this.key_conversion(key);
        var ret = false;
        if (this.listeners[key_converted]) {
            this.listeners[key_converted] = $.grep(this.listeners[key_converted], function COMMONJS(value) {
                ret = ret?ret:(value == listener);
                return value != listener;
            });
        }
        return ret;
    },
    post:function COMMON(key, e) {
        var self = this;
        if (!self.disabled) {
            $(document).trigger('click.contextEvent');

            if (!self.keylistenertimer) {
                self.keylistenertimer = setTimeout(function() { self.keylistenertimer=undefined; }, 100);

                var key_converted = self.key_conversion(key);
                if (self.listeners[key_converted]) {
                    var array = self.listeners[key_converted];
                    for (var index in array) {
                        if (array[index].callbacks && array[index].callbacks[key_converted]) {
                            if (!array[index].callbacks[key_converted].callback(e))
                                break;
                        } else if (array[index].callback) {
                            if (!array[index].callback(e))
                                break;
                        }
                    }
                }
            }
        }
    },
    key_conversion:function COMMONJS(key) {
        // if (typeof key == 'string') {
        //    return key.charCodeAt(0);
        // }
        return key;
    }
}