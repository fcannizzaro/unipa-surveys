#!/usr/bin/env node

var fs = require("fs"),
	exec = require("child_process").exec;

var path = process.argv[2] || process.argv[1];

exec("pdftotext " + path, function(err, stdout, stderr) {

	var content = fs.readFileSync(path.replace(".pdf", ".txt"), {
			encoding: "utf-8"
		}).toString().replace(/\(.*\)/g, "").replace(/\r\n/g, "\n"),

		contentSplitted = content.split("DOCENZA")[2],
		contentSuggerimenti = content.split("SUGGERIMENTI")[1];

	// REGEX DEFINITIONS
	var regexDecisamenteSi = /DECISAMENTE SI ([\d,]+)/g,
		regexDecisamenteNo = /DECISAMENTE NO ([\d,]+)/g,
		regexPiuSiCheNo = /PIU' SI CHE NO ([\d,]+)/g,
		regexPiuNoCheSi = /PIU' NO CHE SI ([\d,]+)/g,
		regexNo = /NO ([\d,]+)/g,
		regexSi = /SI ([\d,]+)/g,
		regexFirstQuestions = /(.*)\n*DECISAMENTE NO ([\d+,]+)\n*PIU' NO CHE SI ([\d+,]+)\n*PIU' SI CHE NO ([\d+,]+)\n*DECISAMENTE SI ([\d+,]+)/g,
		regexInfo = /.*Insegnamento (.*)\n*Docente\n*(.*)\n*CFU (.*)\n*[^\d]*(\d+)\n*[^\d]*(\d+)/g;

	// QUESTIONS
	//
	var questionsBasic = [
        "GLI ORARI DI SVOLGIMENTO DI LEZIONI, ESERCITAZIONI E ALTRE EVENTUALI ATTIVITÀ DIDATTICHE SONO RISPETTATI",
        "IL DOCENTE STIMOLA/MOTIVA L'INTERESSE VERSO LA DISCIPLINA",
        "IL DOCENTE ESPONE GLI ARGOMENTI IN MODO CHIARO",
        "LE ATTIVITÀ DIDATTICHE INTEGRATIVE SONO UTILI ALL’APPRENDIMENTO DELLA MATERIA"
    ];

	var questionSecondPage = [
        "L'INSEGNAMENTO E' STATO SVOLTO IN MANIERA COERENTE CON QUANTO DICHIARATO SUL SITO WEB DEL CORSO DI STUDIO",
        "IL DOCENTE E' REPERIBILE PER CHIARIMENTI E SPIEGAZIONI",
        "LE CONOSCENZE PRELIMINARI POSSEDUTE SONO RISULTATE SUFFICIENTI PER LA COMPRENSIONE DEGLI ARGOMENTI PREVISTI NEL PROGRAMMA D'ESAME",
        "IL CARICO DI STUDIO DELL'INSEGNAMENTO È PROPORZIONATO AI CREDITI ASSEGNATI",
        "IL MATERIALE DIDATTICO E' ADEGUATO PER LO STUDIO DELLA MATERIA",
        "LE MODALITA' DI ESAME SONO STATE DEFINITE IN MODO CHIARO",
        "E' INTERESSATO/A AGLI ARGOMENTI TRATTATI NELL'INSEGNAMENTO"
    ];

	var questionsSiNo = [
        "ALLEGGERIRE IL CARICO DIDATTICO COMPLESSIVO",
        "AUMENTARE L'ATTIVITA' DI SUPPORTO DIDATTICO",
        "FORNIRE PIU' CONOSCENZE DI BASE",
        "ELIMINARE DAL PROGRAMMA ARGOMENTI GIA' TRATTATI IN ALTRI INSEGNAMENTI",
        "MIGLIORARE IL COORDINAMENTO CON ALTRI INSEGNAMENTI",
        "MIGLIORARE LA QUALITA' DEL MATERIALE DIDATTICO",
        "FORNIRE IN ANTICIPO IL MATERIALE DIDATTICO",
        "INSERIRE PROVE D’ESAME INTERMEDIE",
        "ATTIVARE INSEGNAMENTI SERALI O NEL FINE SETTIMANA"
    ];

	var info = regexInfo.exec(content),
		match,
		i = 0;

	// PARSING

	// INFO
	parsed = {
		materia: info[1],
		docente: info[2],
		cfu: info[3],
		questionari: info[4]
	};

	// FIRST QUESTIONS
	while ((match = regexFirstQuestions.exec(content))) {
		var question = questionsBasic[i++];
		parsed[question] = {
			decisamente_si: match[5],
			decisamente_no: match[2],
			piu_si_che_no: match[4],
			piu_no_che_si: match[3]
		};
		regexFirstQuestions.lastIndex++;
	}

	// SECOND PAGE QUESTIONS
	var decisamente_si = regexMono(regexDecisamenteSi, contentSplitted),
		decisamente_no = regexMono(regexDecisamenteNo, contentSplitted),
		piu_si_che_no = regexMono(regexPiuSiCheNo, contentSplitted),
		piu_no_che_si = regexMono(regexPiuNoCheSi, contentSplitted);

	for (i = 0; i < decisamente_si.length; i++) {
		parsed[questionSecondPage[i]] = {
			decisamente_si: decisamente_si[i],
			decisamente_no: decisamente_no[i],
			piu_si_che_no: piu_si_che_no[i],
			piu_no_che_si: piu_no_che_si[i]
		};
	}

	regexCounter(regexNo, "no", contentSuggerimenti, questionsSiNo);
	regexCounter(regexSi, "si", contentSuggerimenti, questionsSiNo);

	var filename = parsed.materia.toLowerCase().replace(/[ -']+/g, "-") + ".json";

	fs.writeFile(filename, JSON.stringify(parsed, null, 4), function() {
		console.log("\n > " + filename + " generated!");
	});

});

function regexMono(regex, content) {
	var match, matches = [];
	while ((match = regex.exec(content))) {
		matches.push(match[1]);
		regex.lastIndex++;
	}
	return matches;
}

function regexCounter(regex, key, content, questions) {
	var match, i = 0;
	while ((match = regex.exec(content))) {
		var question = questions[i++];
		if (!parsed[question]) parsed[question] = {};
		parsed[question][key] = match[1];
		regex.lastIndex++;
	}
}
