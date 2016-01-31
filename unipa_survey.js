#!/usr/bin/env node

var fs = require("fs"),
	exec = require("child_process").exec;

var path = process.argv[2] || process.argv[1];

exec("pdftotext " + path, function(err, stdout, stderr) {

	var content = fs.readFileSync(path.replace(".pdf", ".txt"), {
			encoding: "utf-8"
		})
		.toString()
		.replace(/\(.*\)/g, "")
		.replace(/\r\n/g, "\n"),

		contentSuggerimenti = content.split("SUGGERIMENTI")[1];

	// REGEX DEFINITIONS
	var regexInfo = /.*Insegnamento (.*)\n*(?:Modulo\n*.*\n*)*Docente\n*(.*)\n*CFU (.*)\n*[^\d]*(\d+)\n*[^\d]*(\d+)/g,
		regexDecisamenteSi = /DECISAMENTE SI ([\d,]+)/g,
		regexDecisamenteNo = /DECISAMENTE NO ([\d,]+)/g,
		regexPiuSiCheNo = /PIU' SI CHE NO ([\d,]+)/g,
		regexPiuNoCheSi = /PIU' NO CHE SI ([\d,]+)/g,
		regexNo = /NO ([\d,]+)/g,
		regexSi = /SI ([\d,]+)/g;

	/* QUESTIONS
	  0 - 5    docenza
	  6 - 9    insegnamento
	  10       interesse
	  11 - 19  suggerimenti
    */
	var questions = [
        "GLI ORARI DI SVOLGIMENTO DI LEZIONI, ESERCITAZIONI E ALTRE EVENTUALI ATTIVITÀ DIDATTICHE SONO RISPETTATI",
        "IL DOCENTE STIMOLA/MOTIVA L'INTERESSE VERSO LA DISCIPLINA",
        "IL DOCENTE ESPONE GLI ARGOMENTI IN MODO CHIARO",
        "LE ATTIVITÀ DIDATTICHE INTEGRATIVE SONO UTILI ALL’APPRENDIMENTO DELLA MATERIA",
        "L'INSEGNAMENTO E' STATO SVOLTO IN MANIERA COERENTE CON QUANTO DICHIARATO SUL SITO WEB DEL CORSO DI STUDIO",
        "IL DOCENTE E' REPERIBILE PER CHIARIMENTI E SPIEGAZIONI",

        "LE CONOSCENZE PRELIMINARI POSSEDUTE SONO RISULTATE SUFFICIENTI PER LA COMPRENSIONE DEGLI ARGOMENTI PREVISTI NEL PROGRAMMA D'ESAME",
        "IL CARICO DI STUDIO DELL'INSEGNAMENTO È PROPORZIONATO AI CREDITI ASSEGNATI",
        "IL MATERIALE DIDATTICO E' ADEGUATO PER LO STUDIO DELLA MATERIA",
        "LE MODALITA' DI ESAME SONO STATE DEFINITE IN MODO CHIARO",

        "E' INTERESSATO/A AGLI ARGOMENTI TRATTATI NELL'INSEGNAMENTO",

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
		i = 0;

	// INFO
	parsed = {
		materia: info[1],
		docente: info[2],
		cfu: parseFloat(info[3]),
		questionari: parseInt(info[4]),
		domande: {
			docenza: {},
			insegnamento: {},
			interesse: {},
			suggerimenti: {}
		}
	};

	// REGEX EXEC
	var decisamente_si = matches(regexDecisamenteSi, content),
		decisamente_no = matches(regexDecisamenteNo, content),
		piu_si_che_no = matches(regexPiuSiCheNo, content),
		piu_no_che_si = matches(regexPiuNoCheSi, content),
		si = matches(regexSi, contentSuggerimenti),
		no = matches(regexNo, contentSuggerimenti);

	// ARRAYS MERGING

	for (i = 0; i < decisamente_si.length; i++) {

		var key = i < 6 ? "docenza" : i < 10 ? "insegnamento" : "interesse";
		var question = questions[i];

		parsed.domande[key][question] = {
			decisamente_si: decisamente_si[i],
			decisamente_no: decisamente_no[i],
			piu_si_che_no: piu_si_che_no[i],
			piu_no_che_si: piu_no_che_si[i]
		};

	}

	for (i = 0; i < si.length; i++)
		parsed.domande.suggerimenti[questions[i + 11]] = {
			si: si[i],
			no: no[i]
		};

	// CLEAR AND EXPORT FILE
	fs.unlinkSync(path.replace(".pdf", ".txt"));

	var filename = path.split("scheda_")[1].split(".pdf")[0] + ".json";

	fs.writeFile(filename, JSON.stringify(parsed, null, 4), function() {
		console.log("\n > " + filename + " generated!");
	});

});

function matches(regex, content) {
	var match, matches = [];
	while ((match = regex.exec(content))) {
		matches.push(parseFloat(match[1].replace(",", ".")));
		regex.lastIndex++;
	}
	return matches;
}
