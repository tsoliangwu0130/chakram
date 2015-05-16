var chakram = require('./../../lib/chakram.js'),
    expect = chakram.expect;

describe("Chakram Assertions", function() {    
    describe("JSON", function() {
        
        var postRequest;
        
        before(function() {
            postRequest = chakram.post("http://httpbin.org/post", {
                stringArray: ["test1", "test2", "test3"],
                number: 20,
                str: "test str",
                obj: {
                    test: "str"   
                }
            });
        });
        
        it("should throw an error if path does not exist", function () {
            return postRequest.then(function (obj) {
                expect(function() {
                    expect(obj).to.have.json('headers.non.existant', {});
                }).to.throw(Error);
            });            
        });
        
        it("should support checking that a path does not exist", function () {
            return expect(postRequest).not.to.have.json('headers.non.existant');
        });
        
        describe("Equals", function () {
            it("should ensure matches json exactly", function () {
                return chakram.waitFor([
                    expect(postRequest).to.have.json('json.stringArray', ["test1", "test2", "test3"]),
                    expect(postRequest).to.have.json('json.number', 20),
                    expect(postRequest).not.to.have.json('json.number', 22),
                    expect(postRequest).to.have.json('json.obj', {
                        test: "str"   
                    })
                ]);
            });
        });
        
        describe("Includes", function () {
            it("should ensure body includes given json", function() {
                return chakram.waitFor([
                    expect(postRequest).to.include.json({
                        json: {
                            number: 20,
                            str: "test str",
                            stringArray: {
                                1:"test2"
                            }
                        }
                    }),
                    expect(postRequest).to.not.include.json({
                        json: { number: 22 }  
                    }),
                    expect(postRequest).to.include.json({
                        json: { 
                            obj: {
                                test: "str"
                            }
                        }
                    })
                ]);
            });
            
            it("should support negated include JSON assertions", function () {
                return postRequest.then(function (resp) {
                    expect(function() {
                        expect(resp).to.not.include.json({
                            json: { number: 20 }  
                        });
                    }).to.throw(Error);
                });
            });
            
            it("should be able to specify json path", function () {
                return chakram.waitFor([
                    expect(postRequest).to.include.json('json', {
                        number: 20,
                        str: "test str",
                        stringArray: {1:"test2"}
                    }),
                    expect(postRequest).to.include.json('json.obj', {
                        test: "str"
                    }),
                    expect(postRequest).not.to.include.json('json.obj', {
                        doesnt: "exist"   
                    })
                ]);
            });
        });
        
        describe("Callbacks", function () {            
            it("should allow custom callbacks to be used to run assertions", function () {
                return expect(postRequest).to.have.json('json.stringArray', function (data) {
                    expect(data).to.deep.equal(["test1", "test2", "test3"]);
                });
            });
            
            it("should allow the whole JSON body to be checked", function () {
                return expect(postRequest).to.have.json(function (data) {
                    expect(data.json.number).to.be.above(19).and.below(21);
                    expect(data.json.number).not.to.equal(211);
                });
            });
        });
    });    
});