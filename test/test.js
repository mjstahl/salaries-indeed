var cheerio = require("cheerio");
var request = require("request");
require("chai").should();

describe("interface", function() {
	var salary = require("../index");
	describe("and", function() {
		it("should have 1 job after calling 'and' before 'of'", function() {
			salary.and("developer", 31419);
			salary.should.have.property("__jobs");
			salary.__jobs.should.be.length(1);
		});
		it("'and' should add job object with title and zip props", function() {
			var jobs = salary.__jobs;
			jobs[0].should.have.property("title").equal("developer");
			jobs[0].should.have.property("zip").equal(31419);
		});
	});
	
	describe("for", function() {
		it("should have 1 job after calling 'for'", function() {
			salary.for("develop", 31419);
			salary.should.have.property("__jobs");
			salary.__jobs.should.be.length(2);
		});
		
		it("should have 3 jobs after calling for with an array of length 3", function() {
			salary.for(["developer", "programmer"], 31406);
			salary.should.have.property("__jobs");
			salary.__jobs.should.be.length(4);
		});
	});

	describe("of", function() {
		it("should have 5 job after calling 'for', 'of' after 'and'", function() {
			salary.of("developer", 31419);
			salary.should.have.property("__jobs");
			salary.__jobs.should.be.length(5);
		});
		it("'of' should add job object with title and zip props", function() {
			var jobs = salary.__jobs;
			jobs[0].should.have.property("title").equal("developer");
			jobs[0].should.have.property("zip").equal(31419);
		});
	});

	describe("then", function() {
		this.timeout(5000);
		var salary = require("../index")();
		salary.of("developer", 31419).and("programmer", 31406);

		var r = null;
		before(function(done) {
			salary.then(function(err, result) {
				if (err) done(err);
				r = result;
				done();
			});
		});

		it("the result should be an object", function() {
			r.should.be.a("object");
		});

		it("should have a 'currency' property", function() {
			r.should.have.property("currency");
		});

		it("should have a 'updated_last' property", function() {
			r.should.have.property("updated_last");
		});

		it("should have a salaries prop with a length of 2", function() {
			r.should.have.property("salaries");
			r.salaries.should.be.length(2);
		});
	});
});

describe("utility functions", function() {
	this.timeout(5000);
	var salary = require("../index")();
	var util = require("../utils");

	var body = null;
	salary.of("developer", 31419).and("programmer", 31406);
	before(function(done) {
		var DOMAIN = "http://www.indeed.com/salary",
			promise = util.request(DOMAIN, util.params(salary));
		promise.then(function(result) {
			body = result;
			done();
		}, function(err) {
			done(err);
		});
	});

	it("query should handle multiple job objects", function() {
		util.params(salary)
			.should.equal("?q1=developer&l1=31419&q2=programmer&l2=31406");
	});

	it("should have a 'salary_display_table'", function() {
		util.table(body).should.be.a("string");
	});

	it("should have a currency of 'USD'", function() {
		util.currency(util.table(body)).should.equal("USD");
	});

	it("updated should be a number greater than 0", function() {
		util.updated(util.table(body)).should.be.above(1444363200000);
	});

	it("should have rows equal to 2", function() {
		util.rows(util.table(body)).should.be.length(2);
	});
});
