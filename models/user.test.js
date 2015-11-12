var expect = require("chai").expect;
var bcrypt = require("bcryptjs");

var Waterline = require('waterline');
var waterlineConfig = require('../config/waterline');
var userCollection = require('./user');
var footballmatchCollection = require('./footballmatch');
var playereventCollection = require('./playerevent');

var User;

//teszt elott fut le:

before(function (done) {
    // ORM indítása
    var orm = new Waterline();

    orm.loadCollection(Waterline.Collection.extend(userCollection));
    orm.loadCollection(Waterline.Collection.extend(footballmatchCollection));
    orm.loadCollection(Waterline.Collection.extend(playereventCollection));
    waterlineConfig.connections.default.adapter = 'memory'; //mivel tesztek, nem kell adatbazisba menteni, eleg a memoriaban tesztelni

    orm.initialize(waterlineConfig, function(err, models) {
        if(err) throw err;
        User = models.collections.user;
        done();
    });
});
//usermodell testek, npm test
describe('UserModel', function () {

    function getUserData() {
    return {
            neptun: 'abcdef',
            password: 'jelszo',
            surname: 'Gipsz',
            forename: 'Jakab',
            avatar: '',
        };
    }

    beforeEach(function (done) {
        User.destroy({}, function (err) { // toroljuk az oszes usert a test elott, tehat mindig szuz allapottal indul a teszteles
            if(err){}
            done();
        });
    });
    
    it('should work', function () { //tesztelo tesztelese, torolheto
        expect(true).to.be.true;
    });
    
    it('should be able to create a user', function () {
        return User.create({
                neptun: 'abcdef',
                password: 'jelszo',
                surname: 'Gipsz',
                forename: 'Jakab',
                avatar: '',
        })
        .then(function (user) { //teszteljuk, h tudunk-e felhasznalot letrehozni
            expect(user.neptun).to.equal('abcdef');
            expect(bcrypt.compareSync('jelszo', user.password)).to.be.true;
            expect(user.surname).to.equal('Gipsz');
            expect(user.forename).to.equal('Jakab');
            expect(user.avatar).to.equal('');
        });
    });

    it('should be able to find a user', function() {
        return User.create(getUserData())
        .then(function(user) {
            return User.findOneByNeptun(user.neptun);
        })
        .then(function (user) {
            expect(user.neptun).to.equal('abcdef');
            expect(bcrypt.compareSync('jelszo', user.password)).to.be.true;
            expect(user.surname).to.equal('Gipsz');
            expect(user.forename).to.equal('Jakab');
            expect(user.avatar).to.equal('');
        });
    });
    //megnezzuk jo es rossz jelszoval, h mukodik-e, ez a sajat kod, igazabol ezt fontos tesztelni
    describe('#validPassword', function() {
        it('should return true with right password', function() {
             return User.create(getUserData()).then(function(user) {
                 expect(user.validPassword('jelszo')).to.be.true;
             });
        });
        it('should return false with wrong password', function() {
             return User.create(getUserData()).then(function(user) {
                 expect(user.validPassword('titkos')).to.be.false;
             });
        });
    });
});