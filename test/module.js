var expect = require("expect.js");

var f = require("../index.js");

describe("module", function() {
    it("should have a wrap() function", function() {
        expect(f.wrap).to.be.a("function");
    });
    describe("#wrap()", function() {
        it("should take a function as it's only parameter.", function() {
            var test1 = function() { f.wrap({}); };
            var test2 = function() { f.wrap(function() {}); };
            expect(test1).to.throwError();
            expect(test2).to.not.throwError();
        });
        it("should return a function", function() {
            var ret = f.wrap(function() {});
            expect(ret).to.be.a("function");
        });
        describe("wrapped function", function() {
            it("should return a future", function() {
                var wrapped = f.wrap(function() {});
                var res = wrapped();
                expect(res).to.be.an("object");
            });
            it("should return a valid future", function() {
                var res = f.wrap(function() {})();
                expect(res.complete).to.not.be.ok();
            });
        });

    });
    it("should have a Future constructor", function() {
        expect(f.Future).to.be.a("function");
    });
    describe("Future objects", function() {
    });
    it("should have a join() function", function() {
    });
});
