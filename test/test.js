const asserttype = require("chai-asserttype");
const axios = require("axios");
const chai = require("chai");

const data = require("../config/data.json");
const utils = require("./util/testUtil");

chai.use(asserttype);
const expect = chai.expect;


const simplify = item => {
    // it's a companion:
    if (item.doctors) {
        return {
            name: item.name,
            seasons: item.seasons,
            alive: item.alive,
            character: item.character
        }
    }
    // it's a doctor
    return {
        name: item.name,
        seasons: item.seasons
    }
};


const areArraysEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
}

describe("/doctors", () => {

    describe("GET", () => {

        it("should return a list of all Doctors", done => {
            axios.get(utils.route("/doctors"))
                .then(response => {
                    expect(response.status).to.equal(200);
                    expect(response.data.length).to.eql(13);
                    
                    // check that all of the doctors returned by the server
                    // are in the test doctors array:
                    response.data.forEach(a => {
                        const matches = data.doctors.filter(b => {
                            return a.name == b.name && areArraysEqual(a.seasons, b.seasons);
                        });
                        expect(matches.length).to.eql(1);
                    });

                    done();
                })
                .catch(err => done(err));
        });
    });

});

describe("/companions", () => {

    describe("GET", () => {

        it("should return a list of all Companions", done => {
            axios.get(utils.route("/companions"))
                .then(response => {
                    expect(response.status).to.equal(200);
                    expect(response.data.length).to.eql(35);

                    // check that all of the companions returned by the server
                    // are in the test companions array:
                    response.data.forEach(a => {
                        const matches = data.companions.filter(b => {
                            return (
                                a.name === b.name && 
                                areArraysEqual(a.seasons, b.seasons) &&
                                a.alive === b.alive && 
                                a.character == b.character);
                        });
                        expect(matches.length).to.eql(1);
                    });
                    done();
                })
                .catch(err => done(err));
        });
    });

});
