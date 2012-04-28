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
        } else {
            f.result = res;
            f.emit("result", f.result);
        }
    }
    args.push(done);
    func.apply(thisObj, args);
    return f;
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
            }
        });
    });
};

function wrap(func, thisObj) {
    if (typeof(func) != "function") {
        throw new Error("first argument must be a function.");
    }
    return function() {
        return Future(func, Array.prototype.slice.call(arguments), thisObj);
    }
}

exports.Future = Future;
exports.join = join;
exports.wrap = wrap;
