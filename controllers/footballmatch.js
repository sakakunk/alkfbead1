var express = require('express');

var router = express.Router();

var statusTexts = {
	'scheduled': 'Következik',
	'live': 'Élő',
	'finished': 'Vége'
};
var eventTexts= {
	'goal': 'Gól',
	'owngoal': 'Öngól',
	'yellowcard': 'Sárgalap',
	'redcard': 'Piroslap',
	'subin': 'Becserélés',
	'subout': 'Lecserélés',
};
function leadingZero(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function formatTime(footballmatch){
	return  (footballmatch.starttime.getYear()+1900)+"-"+leadingZero((footballmatch.starttime.getMonth()+1),2)+"-"+leadingZero(footballmatch.starttime.getDate(),2)+" "+leadingZero(footballmatch.starttime.getHours(), 2)+":"+leadingZero(footballmatch.starttime.getMinutes(), 2);
}
function decorate(footballmatches){
	
	return footballmatches.map(function (e) {
		
			
		var now= new Date((new Date()).getTime()+3600000); // szerver és helyi idő eltolódás miatt
		//var nowAnd2Hours = new Date(now.getTime()+7200000);
		var matchEndAnd2Hours = new Date(e.starttime.getTime()+7200000);
		console.log(now);
		console.log(matchEndAnd2Hours);
		console.log(e.starttime);
		console.log("-");
		console.log(e.starttime<=now);
		console.log(now<matchEndAnd2Hours);
		console.log(e.starttime > now);
		if(e.starttime<=now && now<matchEndAnd2Hours){
			e.status = 'live';
		} else if(e.starttime > now){
			e.status = 'scheduled';
		} else{
			e.status='finished';
		}
		e.status = statusTexts[e.status];
		e.formattedDate = formatTime(e);
		//e.statusClass = statusClasses[e.status];
		return e;
	});
		
}
function decorateEvents(playerevents, footballmatch){
	return playerevents.map(function(e){
		e.eventcategory = eventTexts[e.eventcategory];
		if(e.team==='home'){
			e.team=footballmatch.team1;
		} else{
			e.team=footballmatch.team2;
		}
		return e;
	});
}
router.get('/list', function (req, res) {
	req.app.models.user.findOne({id: req.user.id}).then(function(user){
		if(user.role==='admin'){
			req.app.models.footballmatch.find().then(function(footballmatches) {
			   res.render('footballmatch/list', {
					footballmatches: decorate(footballmatches),
					messages: req.flash('info'),
			   }); 
			});
		}else{
			req.app.models.footballmatch.find({user: req.user.id}).then(function (footballmatches) {
				res.render('footballmatch/list', {
				footballmatches: decorate(footballmatches),
				messages: req.flash('info'), // kiolvassa az infobol az uzenetet, ami egy tomb, es a siker eseten tolti fel
				});
			});
		}
	});

	
});
router.get('/list/:id', function (req, res) {
	var userid= req.user.id;
	var footballmatchid= req.params.id;
	//console.log(footballmatchid);
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function (footballmatch) {
		if(footballmatch===undefined){ // ha nincs ilyen ID
				res.render('404');
		}else{
			req.app.models.user.findOne({id:userid}).then(function(user){
				if(footballmatch.user!==userid && user.role!=='admin'){
					res.render('playerevent/error');
				}else{
					req.app.models.playerevent.find({footballmatch: footballmatchid}).then(function(playerevents){
						//megjelenítés
						res.render('playerevent/list', {
							footballmatchid: footballmatchid,
							footballmatch: footballmatch,
							playerevents: decorateEvents(playerevents, footballmatch),
							messages: req.flash('info'), // kiolvassa az infobol az uzenetet, ami egy tomb, es a siker eseten tolti fel
						});
					});	
				}
			});
		}
	});
});

router.get('/list/:id/new', function (req, res) {
	var id= req.params.id;
	var userid= req.user.id;
	var validationErrors = (req.flash('validationErrors') || [{}]).pop();
	var data = (req.flash('data') || [{}]).pop();
	
	req.app.models.footballmatch.findOne({id:id}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				res.render('playerevent/new', {
					footballmatch: footballmatch,
					id: id,
					messages: req.flash('info'), // kiolvassa az infobol az uzenetet, ami egy tomb, es a siker eseten tolti fel
					validationErrors: validationErrors,
					data: data
				});
			}
		});
	});
});

router.post('/list/:id/new', function (req, res) {
	var id = req.params.id;
	console.log(id);
	req.app.models.footballmatch.findOne({id:id}).then(function(footballmatch){
		
		
	// adatok ellenőrzése
	req.checkBody('name', 'Hibás hazai csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	//req.sanitizeBody('leiras').escape(); // ne lehessen html, JS kodot feltolteni
	req.checkBody('eventTime', 'Hibás vendég csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	
	var validationErrors = req.validationErrors(true);
	
	if (validationErrors) {
		req.flash('validationErrors', validationErrors); //flashben tarolom a hibakat
		req.flash('data', req.body); // - || -
		res.redirect('/footballmatch/list/' + id+'/new');   // - || -
	}
	else{
		//console.log(req.body);
		 req.app.models.playerevent.create({
			eventcategory: req.body.eventcategory,
			name: req.body.name,
			eventTime: req.body.eventTime,
			team: req.body.team,
			footballmatch: footballmatch // az adatbazisbol kikeresett meccset rendeljuk hozza
			
		})
		.then(function (footballmatch) {
			//siker
			req.flash('info', 'Esemény sikeresen felvéve!');//a flash egy keresig/ egy alkalommal megy csak
			 // postolas utan nem renderelunk, hanem atiranyitunk:
			res.redirect('/footballmatch/list/' + id);
		})
		.catch(function (err) {
			console.log(err);
		});
	}
	});
	
}); 

router.get('/new', function (req, res) { //oldal elso betoltese
   
  
   var validationErrors = (req.flash('validationErrors') || [{}]).pop();
   var data = (req.flash('data') || [{}]).pop();
   var invalidDateFormat = (req.flash('invalidDateFormat') || [{}]).pop();
   var invalidDate = (req.flash('invalidDate') || [{}]).pop();
   
   res.render('footballmatch/new', {
	   validationErrors: validationErrors,
	   data: data,
	   invalidDateFormat: invalidDateFormat,
	   invalidDate: invalidDate
   }); 
});

router.get('/list/:id/eventdelete/:id2', function(req, res){
	
	var eventid= req.params.id2;
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				req.app.models.playerevent.findOne({id:eventid}).then(function(playerevent){
					playerevent.eventcategory= eventTexts[playerevent.eventcategory];
					res.render('playerevent/confirmdelete', {
						playerevent: playerevent,
						footballmatch: footballmatch
					});
				});
			}
		});
	});
	
});

router.get('/list/:id/edit/:id2', function(req, res){
	
	var eventid= req.params.id2;
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	var validationErrors = (req.flash('validationErrors') || [{}]).pop();	
	var data = (req.flash('data') || [{}]).pop();
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		if(footballmatch===undefined){
			res.render('404');
		}else{
			req.app.models.user.findOne({id:userid}).then(function(user){
				if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
						res.render('playerevent/error');
				}else{
					req.app.models.playerevent.findOne({id:eventid}).then(function(playerevent){
						if(playerevent===undefined || playerevent.footballmatch!==footballmatch.id){ // a masodik feltetel nezi meg h a megfelelo IDjo meccshez a megfelelo eventet kérjük-e le
							res.render('404');
						}else{
							var eventtype={}; //h menjen a rádiógomb
							eventtype[playerevent.eventcategory]=true; //ez is
							var team={}; // ez is
							team[playerevent.team]=true; //ez is
							res.render('playerevent/edit', {
								playerevent: playerevent,
								footballmatch: footballmatch,
								data: data,
								validationErrors: validationErrors,
								eventtype: eventtype,
								team: team
							});
						}
					});
				}
			});
		}
	});
	
});

router.post('/list/:id/edit/:id2', function(req, res){
	
	var eventid= req.params.id2;
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				req.checkBody('name', 'Hibás hazai csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
				req.checkBody('eventTime', 'Hibás vendég csapat').notEmpty().withMessage('Kötelező megadni!');
				var validationErrors = req.validationErrors(true);
				if(validationErrors){
					req.flash('validationErrors', validationErrors); //flashben tarolom a hibakat
					req.flash('data', req.body); // - || -
					res.redirect('/footballmatch/list/' + footballmatchid +'/edit/' + eventid); 
				}else{
					req.app.models.playerevent.update({id:eventid}, {
						eventcategory: req.body.eventcategory,
						name: req.body.name,
						eventTime: req.body.eventTime,
						team: req.body.team
					}).then(function(updated){
						res.redirect('/footballmatch/list/' + footballmatchid);
					});
				}
			}
		});
	});
	
});


router.post('/list/:id/eventdelete/:id2', function(req, res){
	
	var eventid= req.params.id2;
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				req.app.models.playerevent.destroy({id:eventid}).then(function(deleted){
					res.redirect('/footballmatch/list/' + footballmatchid);
				});
			}
		});
	});
	
});
//itt
router.get('/list/:id/edit', function(req, res) {
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	var validationErrors = (req.flash('validationErrors') || [{}]).pop();	
	var data = (req.flash('data') || [{}]).pop();
	var invalidDateFormat = (req.flash('invalidDateFormat') || [{}]).pop();
	var invalidDate = (req.flash('invalidDate') || [{}]).pop();
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				footballmatch.starttime = formatTime(footballmatch);
				res.render('footballmatch/edit', {
					footballmatch: footballmatch,
					data: data,
					validationErrors: validationErrors,
					invalidDateFormat : invalidDateFormat,
					invalidDate : invalidDate
				});
			}
		});
	});
});
router.post('/list/:id/edit', function(req, res) {
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	/*var validationErrors = (req.flash('validationErrors') || [{}]).pop();	
	var data = (req.flash('data') || [{}]).pop();*/
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				req.checkBody('csapat1', 'Hibás hazai csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
				req.checkBody('csapat2', 'Hibás vendég csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
				req.checkBody('eredmeny', 'Hibás eredmény').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
				req.checkBody('starttime', 'Hibás kezdési időpont').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
				//itt
				var validationErrors = req.validationErrors(true);
				var invalidDateFormat=undefined;
				var invalidDate=undefined;
				if(!validationErrors.starttime){
					if(!/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/.test(req.body.starttime)){
						invalidDateFormat=true;
					}else {
						var timestamp=Date.parse(req.body.starttime); //teszteljuk, h tudun.e datumot csinalni belole
						if(isNaN(timestamp)){
							console.log('itt');
							invalidDate=true;
						}
					}
				}
				
				if(validationErrors || invalidDateFormat || invalidDate){
					req.flash('validationErrors', validationErrors); //flashben tarolom a hibakat
					req.flash('data', req.body); // - || -
					req.flash('invalidDateFormat', invalidDateFormat);
					req.flash('invalidDate', invalidDate);
					res.redirect('/footballmatch/list/' + footballmatchid +'/edit'); 
				}else{
					req.app.models.footballmatch.update({id:footballmatchid}, {
						team1: req.body.csapat1,
						team2: req.body.csapat2,
						result: req.body.eredmeny,
						starttime : req.body.starttime
					}).then(function(updated){
						res.redirect('/footballmatch/list/' + footballmatchid);
					});
				}
			}
		});
	});
});

router.get('/list/:id/confirmdelete', function(req, res) {
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				res.render('footballmatch/confirmdelete', {
					footballmatch: footballmatch
				});
			}
		});
	});
});


router.post('/list/:id/confirmdelete', function(req, res) {
	var userid = req.user.id;
	var footballmatchid = req.params.id;
	req.app.models.footballmatch.findOne({id:footballmatchid}).then(function ( footballmatch) {
		req.app.models.user.findOne({id:userid}).then(function(user){
			if(footballmatch.user!==userid && user.role	!=='admin'){ // ha nincs jogosultsága megtekinteni
					res.render('playerevent/error');
			}else{
				req.app.models.footballmatch.destroy({id:footballmatchid}).then(function(deleted){
					res.redirect('/footballmatch/list');
				});
			}
		});
	});
});

router.post('/new', function (req, res) { //ez fogadja az adatokat
	// adatok ellenőrzése
	req.checkBody('csapat1', 'Hibás hazai csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	req.checkBody('csapat2', 'Hibás vendég csapat').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	req.checkBody('eredmeny', 'Hibás eredmény').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	req.checkBody('starttime', 'Hibás kezdési időpont').notEmpty().withMessage('Kötelező megadni!'); //ellenorizzuk, h ures-e
	
	var validationErrors = req.validationErrors(true);
	var invalidDateFormat=undefined;
	var invalidDate=undefined;
	if(!validationErrors.starttime){
		if(!/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/.test(req.body.starttime)){
			invalidDateFormat=true;
		}else {
			var timestamp=Date.parse(req.body.starttime); //teszteljuk, h tudun.e datumot csinalni belole
			if(isNaN(timestamp)){
				invalidDate=true;
			}
		}
	}
	
	if (validationErrors || invalidDateFormat || invalidDate) {
		req.flash('validationErrors', validationErrors); //flashben tarolom a hibakat
		req.flash('data', req.body); // - || -
		req.flash('invalidDateFormat', invalidDateFormat); // - || -
		req.flash('invalidDate', invalidDate); // - || -
		res.redirect('/footballmatch/new');   // - || -
	}
	else {
		 req.app.models.footballmatch.create({
			status: 'scheduled',
			team1: req.body.csapat1,
			team2: req.body.csapat2,
			result: req.body.eredmeny,
			starttime : req.body.starttime,
			user: req.user.id
		})
		.then(function (footballmatch) {
			//siker
			req.flash('info', 'Meccs sikeresen felvéve!');//a flash egy keresig/ egy alkalommal megy csak
			 // postolas utan nem renderelunk, hanem atiranyitunk:
			res.redirect('/footballmatch/list');
		})
		.catch(function (err) {
			console.log(err);
		});
		 
		
	}
});

module.exports = router;