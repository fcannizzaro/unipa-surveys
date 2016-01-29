# UnipaSurveys
![node](https://img.shields.io/node/v/gh-badges.svg) ![unipa](https://img.shields.io/badge/Unipa-JSON-orange.svg)

Convert prof PDF sheet to JSON

### Install
```sh
$ npm install -g
```

### Requirements
- xpdf (**pdftotext**)

### Usage
```sh
$ unipa-export path/to/pdf/sheet
```

### Sample
```json
{
    "materia": "--- sample ---",
    "docente": "--- sample ---",
    "cfu": "6",
    "questionari": "74",
    "GLI ORARI DI SVOLGIMENTO DI LEZIONI, ESERCITAZIONI E ALTRE EVENTUALI ATTIVITÀ DIDATTICHE SONO RISPETTATI": {
        "decisamente_si": "75,68",
        "decisamente_no": "0",
        "piu_si_che_no": "16,22",
        "piu_no_che_si": "4,05"
    },
    "IL DOCENTE STIMOLA/MOTIVA L'INTERESSE VERSO LA DISCIPLINA": {
        "decisamente_si": "59,46",
        "decisamente_no": "1,35",
        "piu_si_che_no": "31,08",
        "piu_no_che_si": "5,41"
    },
    "IL DOCENTE ESPONE GLI ARGOMENTI IN MODO CHIARO": {
        "decisamente_si": "63,51",
        "decisamente_no": "1,35",
        "piu_si_che_no": "25,68",
        "piu_no_che_si": "6,76"
    },
    "LE ATTIVITÀ DIDATTICHE INTEGRATIVE SONO UTILI ALL’APPRENDIMENTO DELLA MATERIA": {
        "decisamente_si": "36,49",
        "decisamente_no": "1,35",
        "piu_si_che_no": "25,68",
        "piu_no_che_si": "1,35"
    },

    ...,

    "FORNIRE PIU' CONOSCENZE DI BASE": {
        "no": "40,54",
        "si": "44,59"
    },
    "ELIMINARE DAL PROGRAMMA ARGOMENTI GIA' TRATTATI IN ALTRI INSEGNAMENTI": {
        "no": "68,92",
        "si": "22,97"
    },
    "MIGLIORARE IL COORDINAMENTO CON ALTRI INSEGNAMENTI": {
        "no": "35,14",
        "si": "44,59"
    },

   ...

}
```

### License
MIT Francesco Cannizzaro