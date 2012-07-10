var events = require("events");

function Future(func, args, thisObj) {
    thisObj = (thisObj == undefined) ? null : thisObj;
    var f = Object.create(new events.EventEmitter());
    f.complete = false;
    var done  = function(err, res) {
        f.complete = true;
        if (err) {
            f.err = err;
            f.emit("error", f.err);
            f.emit("complete", f.err, null);
        } else {
            f.result = res;
            f.emit("result", f.result);
            f.emit("complete", null, f.result);
        }
    }
    // if a standard callback is also passed in, also call that on completion.
    if (typeof(args[args.length - 1]) == "function") {
      f.on("complete", args.pop());
    }
    args.push(done);
    func.apply(thisObj, args);
    return f;
};

var pipeline = function(queue, args, thisObj, cb) {
    if (!cb) { cb = thisObj; thisObj = null; }
    var runNext = function(err, res) {
        if (err) { cb(err, null); }
        var runFunc = queue.shift();
        var cbFunc = (queue.length > 0) ? runNext : cb;
        args = [res, cbFunc];
        runFunc.apply(thisObj, args);
    };
    if (queue.lengh < 2) {
        throw new Error("nothing to chain!");
    } else {
        var params = [args, runNext];
        queue.shift().apply(thisObj, params);
    }
};


function join(futureList, cb) {
    var count = futureList.length;
    var errorSent = false;
    futureList.forEach(function(f) {
        f.on("result", function(res) {
            count--;
            if (count == 0) {
                cb(null, futureList.map(function(elem) { return elem.result; }));
            }
        });
        f.on("error", function(err) {
            if (!errorSent) {
                cb(err, null);
                errorSent = true;
            }
        });
    });
};

function wrap(func, thisObj) {
    if (typeof(func) != "function") {
        throw new Error("first argument must be a function.");
    }
    // short-circuit the wrapping function to safely allow a function to be
    // "wrapped" multiple times with no ill effects.
    if (func.wrapped == true) { return func; }
    var f = function() {
        return Future(func, Array.prototype.slice.apply(arguments), thisObj);
    }
    f.wrapped = true;
    return f;
}

exports.Future = Future;
exports.pipeline = pipeline;
exports.join = join;
exports.wrap = wrap;
