const { MongoClient, ObjectId } = require('mongodb');

// https://app.andes.gob.ar/api/core/term/snomed/expression?expression=%3C%3C69896004%20OR%20%3C%3C709044004%20OR%20%3C%3C40930008
const conceptos = [
    {
        "conceptId": "15687321000119109",
        "term": "artritis reumatoide de ambas manos",
        "fsn": "artritis reumatoide de ambas manos (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "15687201000119107",
        "term": "artritis reumatoide de ambas rodillas",
        "fsn": "artritis reumatoide de ambas rodillas (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "15686281000119101",
        "term": "artritis reumatoide de ambos pies",
        "fsn": "artritis reumatoide de ambos pies (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "10809101000119109",
        "term": "hipotiroidismo en el momento del nacimiento",
        "fsn": "hipotiroidismo en el momento del nacimiento (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "10757481000119107",
        "term": "cardiopatía hipertensiva y enfermedad renal crónica hipertensiva materna preexistentes que complican el embarazo",
        "fsn": "cardiopatía hipertensiva y enfermedad renal crónica hipertensiva materna preexistentes que complican el embarazo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "10757401000119104",
        "term": "cardiopatía hipertensiva y enfermedad renal crónica hipertensiva materna preexistentes que complican el nacimiento",
        "fsn": "cardiopatía hipertensiva y enfermedad renal crónica hipertensiva materna preexistentes que complican el nacimiento (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073821000119109",
        "term": "artritis reumatoide de hombro derecho",
        "fsn": "artritis reumatoide de hombro derecho (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073811000119102",
        "term": "artritis reumatoide de rodilla derecha",
        "fsn": "artritis reumatoide de rodilla derecha (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073801000119100",
        "term": "artritis reumatoide de cadera derecha",
        "fsn": "artritis reumatoide de cadera derecha (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073791000119101",
        "term": "artritis reumatoide de mano derecha",
        "fsn": "artritis reumatoide de mano derecha (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073781000119104",
        "term": "artritis reumatoide de pie derecho",
        "fsn": "artritis reumatoide de pie derecho (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073741000119109",
        "term": "artritis reumatoide de hombro izquierdo",
        "fsn": "artritis reumatoide de hombro izquierdo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073731000119100",
        "term": "artritis reumatoide de rodilla izquierda",
        "fsn": "artritis reumatoide de rodilla izquierda (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073721000119103",
        "term": "artritis reumatoide de cadera izquierda",
        "fsn": "artritis reumatoide de cadera izquierda (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073711000119105",
        "term": "artritis reumatoide de mano izquierda",
        "fsn": "artritis reumatoide de mano izquierda (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1073701000119107",
        "term": "artritis reumatoide de pie izquierdo",
        "fsn": "artritis reumatoide de pie izquierdo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "691421000119108",
        "term": "anemia concomitante con enfermedad renal crónica en estadio 3 y debida a ella",
        "fsn": "anemia concomitante con enfermedad renal crónica en estadio 3 y debida a ella (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "369091000119106",
        "term": "hipotiroidismo causado por amiodarona",
        "fsn": "hipotiroidismo causado por amiodarona (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "367631000119105",
        "term": "hipotiroidismo causado por fármaco",
        "fsn": "hipotiroidismo causado por fármaco (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "319841000119107",
        "term": "enfermedad pulmonar reumatoide con artritis reumatoide",
        "fsn": "enfermedad pulmonar reumatoide con artritis reumatoide (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285881000119109",
        "term": "enfermedad renal crónica por hipertensión maligna, estadio 4",
        "fsn": "enfermedad renal crónica por hipertensión maligna, estadio 4 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285871000119106",
        "term": "enfermedad renal crónica por hipertensión maligna, estadio 3",
        "fsn": "enfermedad renal crónica por hipertensión maligna, estadio 3 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285861000119100",
        "term": "enfermedad renal crónica por hipertensión maligna, estadio 2",
        "fsn": "enfermedad renal crónica por hipertensión maligna, estadio 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285851000119102",
        "term": "enfermedad renal crónica por hipertensión maligna, estadio 1",
        "fsn": "enfermedad renal crónica por hipertensión maligna, estadio 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285831000119108",
        "term": "enfermedad renal crónica por hipertensión maligna",
        "fsn": "enfermedad renal crónica por hipertensión maligna (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285011000119108",
        "term": "enfermedad renal crónica debida a hipertensión benigna, estadio 5",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna, estadio 5 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "285001000119105",
        "term": "enfermedad renal crónica debida a hipertensión benigna, estadio 4",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna, estadio 4 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "284991000119104",
        "term": "enfermedad renal crónica debida a hipertensión benigna, estadio 3",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna, estadio 3 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "284981000119102",
        "term": "enfermedad renal crónica debida a hipertensión benigna, estadio 2",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna, estadio 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "284971000119100",
        "term": "enfermedad renal crónica debida a hipertensión benigna, estadio 1",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna, estadio 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "284961000119106",
        "term": "enfermedad renal crónica debida a hipertensión benigna",
        "fsn": "enfermedad renal crónica debida a hipertensión benigna (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "153851000119106",
        "term": "enfermedad renal crónica por hipertensión maligna, estadio 5",
        "fsn": "enfermedad renal crónica por hipertensión maligna, estadio 5 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "143441000119108",
        "term": "artritis reumatoide en remisión",
        "fsn": "artritis reumatoide en remisión (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "140131000119102",
        "term": "hipertensión en enfermedad renal crónica en estadio 2 debida a diabetes mellitus tipo 2",
        "fsn": "hipertensión en enfermedad renal crónica en estadio 2 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "140121000119100",
        "term": "hipertensión en enfermedad renal crónica en estadio 3 debida a diabetes mellitus tipo 2",
        "fsn": "hipertensión en enfermedad renal crónica en estadio 3 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "140111000119107",
        "term": "hipertensión en enfermedad renal crónica en estadio 4 debida a diabetes mellitus tipo 2",
        "fsn": "hipertensión en enfermedad renal crónica en estadio 4 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "140101000119109",
        "term": "hipertensión en enfermedad renal crónica en estadio 5 debida a diabetes mellitus tipo 2",
        "fsn": "hipertensión en enfermedad renal crónica en estadio 5 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "129181000119109",
        "term": "enfermedad renal crónica debida a hipertensión, estadio 2",
        "fsn": "enfermedad renal crónica debida a hipertensión, estadio 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "129171000119106",
        "term": "enfermedad renal crónica debida a hipertensión, estadio 3",
        "fsn": "enfermedad renal crónica debida a hipertensión, estadio 3 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "129161000119100",
        "term": "enfermedad renal crónica debida a hipertensión, estadio 5",
        "fsn": "enfermedad renal crónica debida a hipertensión, estadio 5 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "129151000119102",
        "term": "enfermedad renal crónica debida a hipertensión, estadio 4",
        "fsn": "enfermedad renal crónica debida a hipertensión, estadio 4 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "117681000119102",
        "term": "enfermedad renal crónica en estadio 1 debida a hipertensión",
        "fsn": "enfermedad renal crónica en estadio 1 debida a hipertensión (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "102871000119101",
        "term": "hipotiroidismo debido a tiroiditis",
        "fsn": "hipotiroidismo debido a tiroiditis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96751000119106",
        "term": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio1",
        "fsn": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96741000119109",
        "term": "cardiopatía Y enfermedad renal crónica por hipertensión, estadio 2",
        "fsn": "cardiopatía Y enfermedad renal crónica por hipertensión, estadio 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96731000119100",
        "term": "cardiopatía Y enfermedad renal crónica por hipertensión, estadio 3",
        "fsn": "cardiopatía Y enfermedad renal crónica por hipertensión, estadio 3 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96721000119103",
        "term": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio 4",
        "fsn": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio 4 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96711000119105",
        "term": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio 5",
        "fsn": "cardiopatía hipertensiva Y enfermedad renal crónica, estadio 5 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "96701000119107",
        "term": "cardiopatía hipertensiva Y enfermedad renal crónica en diálisis",
        "fsn": "cardiopatía hipertensiva Y enfermedad renal crónica en diálisis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90761000119106",
        "term": "estadio 5 de enfermedad renal crónica debida a diabetes mellitus tipo 1",
        "fsn": "estadio 5 de enfermedad renal crónica debida a diabetes mellitus tipo 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90751000119109",
        "term": "estadio 4 de enfermedad renal crónica debida a diabetes mellitus tipo 1",
        "fsn": "estadio 4 de enfermedad renal crónica debida a diabetes mellitus tipo 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90741000119107",
        "term": "estadio 3 de enfermedad renal crónica debida a diabetes mellitus tipo 1",
        "fsn": "estadio 3 de enfermedad renal crónica debida a diabetes mellitus tipo 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90731000119103",
        "term": "estadio 2 de enfermedad renal crónica debida a diabetes mellitus tipo 1",
        "fsn": "estadio 2 de enfermedad renal crónica debida a diabetes mellitus tipo 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90721000119101",
        "term": "estadio 1 de enfermedad renal crónica debida a diabetes mellitus tipo 1",
        "fsn": "estadio 1 de enfermedad renal crónica debida a diabetes mellitus tipo 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "8501000119104",
        "term": "cardiopatía hipertensiva Y enfermedad renal crónica",
        "fsn": "cardiopatía hipertensiva Y enfermedad renal crónica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "1801000119106",
        "term": "anemia, enfermedad renal en estadio preterminal en protocolo de eritropoyetina",
        "fsn": "anemia, enfermedad renal en estadio preterminal en protocolo de eritropoyetina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "751000119104",
        "term": "enfermedad renal crónica en estadio 1 debida a diabetes mellitus tipo 2",
        "fsn": "enfermedad renal crónica en estadio 1 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "741000119101",
        "term": "enfermedad renal crónica en estadio 2 debida a diabetes mellitus tipo 2",
        "fsn": "enfermedad renal crónica en estadio 2 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "731000119105",
        "term": "enfermedad renal crónica en estadio 3 debida a diabetes mellitus tipo 2",
        "fsn": "enfermedad renal crónica en estadio 3 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "721000119107",
        "term": "enfermedad renal crónica en estadio 4 debida a diabetes mellitus tipo 2",
        "fsn": "enfermedad renal crónica en estadio 4 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "711000119100",
        "term": "enfermedad renal crónica en estadio 5 debida a diabetes mellitus tipo 2",
        "fsn": "enfermedad renal crónica en estadio 5 debida a diabetes mellitus tipo 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "783177006",
        "term": "hipotiroidismo congénito debido a ingesta materna de fármaco antitiroideo",
        "fsn": "hipotiroidismo congénito debido a ingesta materna de fármaco antitiroideo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "773987000",
        "term": "hipotiroidismo neonatal transitorio debido a exposición neonatal a yodo",
        "fsn": "hipotiroidismo neonatal transitorio debido a exposición neonatal a yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "771510006",
        "term": "hipotiroidismo congénito central ligado al cromosoma X con aumento de tamaño testicular de comienzo tardío",
        "fsn": "hipotiroidismo congénito central ligado al cromosoma X con aumento de tamaño testicular de comienzo tardío (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "770631009",
        "term": "hipotiroidismo congénito transitorio de origen genético",
        "fsn": "hipotiroidismo congénito transitorio de origen genético (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "763890006",
        "term": "baja estatura con retraso de la edad ósea debido a deficiencia del metabolismo de la hormona tiroidea",
        "fsn": "baja estatura con retraso de la edad ósea debido a deficiencia del metabolismo de la hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "735600005",
        "term": "artritis reumatoide sin erosión",
        "fsn": "artritis reumatoide sin erosión (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "735599007",
        "term": "erosión de superficie articular concomitante con artritis reumatoide y debida a ella",
        "fsn": "erosión de superficie articular concomitante con artritis reumatoide y debida a ella (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "725462002",
        "term": "hipotiroidismo congénito central debido a deficiencia de receptor de hormona liberadora de tirotrofina",
        "fsn": "hipotiroidismo congénito central debido a deficiencia de receptor de hormona liberadora de tirotrofina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "722940002",
        "term": "hipotiroidismo central adquirido",
        "fsn": "hipotiroidismo central adquirido (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "722939004",
        "term": "hipotiroidismo congénito debido a deficiencia de yodo",
        "fsn": "hipotiroidismo congénito debido a deficiencia de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "722938007",
        "term": "hipotiroidismo congénito central",
        "fsn": "hipotiroidismo congénito central (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "722375007",
        "term": "síndrome de Bamforth Lazarus",
        "fsn": "síndrome de Bamforth Lazarus (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "722051004",
        "term": "síndrome de obesidad, colitis, hipotiroidismo, hipertrofia cardíaca y retraso del desarrollo",
        "fsn": "síndrome de obesidad, colitis, hipotiroidismo, hipertrofia cardíaca y retraso del desarrollo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "718690009",
        "term": "hipotiroidismo congénito debido a ausencia de glándula tiroides",
        "fsn": "hipotiroidismo congénito debido a ausencia de glándula tiroides (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "718194004",
        "term": "hipotiroidismo debido a mutación en el factor de transcripción de desarrollo hipofisario",
        "fsn": "hipotiroidismo debido a mutación en el factor de transcripción de desarrollo hipofisario (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "718193005",
        "term": "resistencia periférica a hormona tiroidea",
        "fsn": "resistencia periférica a hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "718183003",
        "term": "dishormonogénesis tiroidea familiar",
        "fsn": "dishormonogénesis tiroidea familiar (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "717334008",
        "term": "hipotiroidismo congénito idiopático",
        "fsn": "hipotiroidismo congénito idiopático (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "717333002",
        "term": "hipotiroidismo congénito debido a pasaje transplacentario de anticuerpos maternos inhibidores de hormona tiroestimulante",
        "fsn": "hipotiroidismo congénito debido a pasaje transplacentario de anticuerpos maternos inhibidores de hormona tiroestimulante (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "716338001",
        "term": "síndrome de pseudohipertrofia muscular e hipotiroidismo",
        "fsn": "síndrome de pseudohipertrofia muscular e hipotiroidismo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "714153000",
        "term": "enfermedad renal crónica, estadio 5, con trasplante",
        "fsn": "enfermedad renal crónica, estadio 5, con trasplante (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "714152005",
        "term": "enfermedad renal crónica, estadio 5, en diálisis",
        "fsn": "enfermedad renal crónica, estadio 5, en diálisis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "709044004",
        "term": "enfermedad renal crónica",
        "fsn": "enfermedad renal crónica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "700379002",
        "term": "enfermedad renal crónica en estadio 3B",
        "fsn": "enfermedad renal crónica en estadio 3B (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "700378005",
        "term": "enfermedad renal crónica en estadio 3A",
        "fsn": "enfermedad renal crónica en estadio 3A (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "699298009",
        "term": "síndrome de blefarofimosis-retardo mental, tipo Say-Barber-Biesecker-Young-Simpson",
        "fsn": "síndrome de blefarofimosis-retardo mental, tipo Say-Barber-Biesecker-Young-Simpson (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "698577000",
        "term": "hipotiroidismo en el lactante causado por fármaco materno",
        "fsn": "hipotiroidismo en el lactante causado por fármaco materno (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "440092001",
        "term": "síndrome de deficiencia congénita endémica de yodo, de tipo mixedematoso",
        "fsn": "síndrome de deficiencia congénita endémica de yodo, de tipo mixedematoso (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "433146000",
        "term": "enfermedad renal crónica, estadio 5",
        "fsn": "enfermedad renal crónica, estadio 5 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "433144002",
        "term": "enfermedad renal crónica, estadio 3",
        "fsn": "enfermedad renal crónica, estadio 3 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "431857002",
        "term": "enfermedad renal crónica, estadio 4",
        "fsn": "enfermedad renal crónica, estadio 4 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "431856006",
        "term": "enfermedad renal crónica, estadio 2",
        "fsn": "enfermedad renal crónica, estadio 2 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "431855005",
        "term": "enfermedad renal crónica, estadio 1",
        "fsn": "enfermedad renal crónica, estadio 1 (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "429192004",
        "term": "artritis reumatoide del pie",
        "fsn": "artritis reumatoide del pie (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "428165003",
        "term": "hipotiroidismo durante el embarazo",
        "fsn": "hipotiroidismo durante el embarazo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "427770001",
        "term": "artritis reumatoide de la articulación temporomandibular",
        "fsn": "artritis reumatoide de la articulación temporomandibular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "425369003",
        "term": "insuficiencia renal crónica progresiva",
        "fsn": "insuficiencia renal crónica progresiva (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "405630007",
        "term": "hipotiroidismo infantil hasta los 24 meses",
        "fsn": "hipotiroidismo infantil hasta los 24 meses (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "405629002",
        "term": "hipotiroidismo infantil",
        "fsn": "hipotiroidismo infantil (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "399923009",
        "term": "arteritis reumatoide",
        "fsn": "arteritis reumatoide (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "398640008",
        "term": "síndrome de Caplan",
        "fsn": "síndrome de Caplan (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "360353005",
        "term": "hipertiroidismo por resistencia a la hormona tiroidea hipofisaria",
        "fsn": "hipertiroidismo por resistencia a la hormona tiroidea hipofisaria (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "360348000",
        "term": "resistencia hipofisaria a la hormona tiroidea",
        "fsn": "resistencia hipofisaria a la hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "287008006",
        "term": "artritis reumatoide de tobillo y/o pie",
        "fsn": "artritis reumatoide de tobillo y/o pie (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "287007001",
        "term": "artritis reumatoide de articulación de la mano",
        "fsn": "artritis reumatoide de articulación de la mano (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "278503003",
        "term": "hipotiroidismo congénito con bocio difuso",
        "fsn": "hipotiroidismo congénito con bocio difuso (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "276630006",
        "term": "hipotirotrofinemia transitoria",
        "fsn": "hipotirotrofinemia transitoria (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "276566003",
        "term": "hipotiroidismo neonatal transitorio",
        "fsn": "hipotiroidismo neonatal transitorio (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "239795001",
        "term": "artritis reumatoide con compromiso multisistémico",
        "fsn": "artritis reumatoide con compromiso multisistémico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237695004",
        "term": "deficiencia idiopática de TSH",
        "fsn": "deficiencia idiopática de TSH (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237567008",
        "term": "hipotiroidismo por deficiencia subclínica de yodo",
        "fsn": "hipotiroidismo por deficiencia subclínica de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237566004",
        "term": "síndrome de deficiencia congénita de yodo - tipo neurológico",
        "fsn": "síndrome de deficiencia congénita de yodo - tipo neurológico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237565000",
        "term": "síndrome de deficiencia congénita de yodo - tipo mixto",
        "fsn": "síndrome de deficiencia congénita de yodo - tipo mixto (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237560005",
        "term": "resistencia generalizada de la hormona tiroidea",
        "fsn": "resistencia generalizada de la hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237559000",
        "term": "síndrome de resistencia a la hormona tiroidea",
        "fsn": "síndrome de resistencia a la hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237556007",
        "term": "hipotiroidismo por defecto de la organificación de yodo",
        "fsn": "hipotiroidismo por defecto de la organificación de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237555006",
        "term": "hipotiroidismo por defecto de atrapamiento de yodo",
        "fsn": "hipotiroidismo por defecto de atrapamiento de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237528002",
        "term": "hipotiroidismo posinfeccioso",
        "fsn": "hipotiroidismo posinfeccioso (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237527007",
        "term": "hipotiroidismo posablativo",
        "fsn": "hipotiroidismo posablativo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237526003",
        "term": "eutiroidismo con anticuerpos tiroideos",
        "fsn": "eutiroidismo con anticuerpos tiroideos (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237521008",
        "term": "hipotiroidismo por anticuerpo bloqueante del receptor de TSH",
        "fsn": "hipotiroidismo por anticuerpo bloqueante del receptor de TSH (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237520009",
        "term": "hipotiroidismo por tiroiditis de Hashimoto",
        "fsn": "hipotiroidismo por tiroiditis de Hashimoto (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237519003",
        "term": "hipotiroidismo autoinmunitario",
        "fsn": "hipotiroidismo autoinmunitario (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237518006",
        "term": "bocio hipotiroideo, adquirido",
        "fsn": "bocio hipotiroideo, adquirido (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "237515009",
        "term": "hipotiroidismo congénito sin bocio",
        "fsn": "hipotiroidismo congénito sin bocio (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "216693007",
        "term": "enanismo hipotiroideo",
        "fsn": "enanismo hipotiroideo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201791009",
        "term": "exacerbación de artritis reumatoide",
        "fsn": "exacerbación de artritis reumatoide (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201785007",
        "term": "artritis reumatoide de articulación interfalángica de dedo del pie",
        "fsn": "artritis reumatoide de articulación interfalángica de dedo del pie (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201784006",
        "term": "artritis reumatoide de articulación metatarsofalángica del quinto dedo",
        "fsn": "artritis reumatoide de articulación metatarsofalángica del quinto dedo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201783000",
        "term": "artritis reumatoidea de la primera articulación metatarsofalángica",
        "fsn": "artritis reumatoidea de la primera articulación metatarsofalángica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201781003",
        "term": "artritis reumatoide de la articulación astragalonavicular",
        "fsn": "artritis reumatoide de la articulación astragalonavicular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201780002",
        "term": "artritis reumatoide de la articulación subastragalina",
        "fsn": "artritis reumatoide de la articulación subastragalina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201779000",
        "term": "artritis reumatoide de tobillo",
        "fsn": "artritis reumatoide de tobillo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201778008",
        "term": "artritis reumatoide de la articulación tibioperonea",
        "fsn": "artritis reumatoide de la articulación tibioperonea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201777003",
        "term": "artritis reumatoide de la rodilla",
        "fsn": "artritis reumatoide de la rodilla (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201776007",
        "term": "artritis reumatoide de la articulación sacroilíaca",
        "fsn": "artritis reumatoide de la articulación sacroilíaca (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201775006",
        "term": "artritis reumatoide de la cadera",
        "fsn": "artritis reumatoide de la cadera (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201774005",
        "term": "artritis reumatoide de la articulación interfalángica distal de dedo de la mano",
        "fsn": "artritis reumatoide de la articulación interfalángica distal de dedo de la mano (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201773004",
        "term": "artritis reumatoide de la articulación interfalángica proximal de dedo de la mano",
        "fsn": "artritis reumatoide de la articulación interfalángica proximal de dedo de la mano (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201772009",
        "term": "artritis reumatoide de la articulación metacarpofalángica",
        "fsn": "artritis reumatoide de la articulación metacarpofalángica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201771002",
        "term": "artritis reumatoide de la articulación de la muñeca",
        "fsn": "artritis reumatoide de la articulación de la muñeca (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201770001",
        "term": "artritis reumatoide de la articulación radiocubital distal",
        "fsn": "artritis reumatoide de la articulación radiocubital distal (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201769002",
        "term": "artritis reumatoide del codo",
        "fsn": "artritis reumatoide del codo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201768005",
        "term": "artritis reumatoide de la articulación acromioclavicular",
        "fsn": "artritis reumatoide de la articulación acromioclavicular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201767000",
        "term": "artritis reumatoide de la articulación esternoclavicular",
        "fsn": "artritis reumatoide de la articulación esternoclavicular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "201766009",
        "term": "artritis reumatoide de hombro",
        "fsn": "artritis reumatoide de hombro (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190284002",
        "term": "hipotiroidismo causado por resorcinol",
        "fsn": "hipotiroidismo causado por resorcinol (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190283008",
        "term": "hipotiroidismo causado por fenilbutazona",
        "fsn": "hipotiroidismo causado por fenilbutazona (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190282003",
        "term": "hipotiroidismo por ácido paraaminosalicílico",
        "fsn": "hipotiroidismo causado por ácido paraaminosalicílico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190279008",
        "term": "hipotiroidismo por déficit de yodo",
        "fsn": "hipotiroidismo por déficit de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190277005",
        "term": "hipotiroidismo por irradiación",
        "fsn": "hipotiroidismo por irradiación (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "190268003",
        "term": "hipotiroidismo congénito",
        "fsn": "hipotiroidismo congénito (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "111567006",
        "term": "síndrome de Refetoff",
        "fsn": "síndrome de Refetoff (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "111566002",
        "term": "hipotiroidismo adquirido",
        "fsn": "hipotiroidismo adquirido (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "93359004",
        "term": "posición anómala congénita de la glándula tiroides",
        "fsn": "posición anómala congénita de la glándula tiroides (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "90688005",
        "term": "síndrome de insuficiencia renal crónica",
        "fsn": "síndrome de insuficiencia renal crónica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "89261000",
        "term": "deficiencia aislada de tirotrofina",
        "fsn": "deficiencia aislada de tirotrofina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "88273006",
        "term": "hipotiroidismo iatrogénico",
        "fsn": "hipotiroidismo iatrogénico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "86219005",
        "term": "síndrome de artritis reumatoidea - uveítis",
        "fsn": "síndrome de artritis reumatoidea - uveítis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "84781002",
        "term": "cretinismo esporádico",
        "fsn": "cretinismo esporádico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "83986005",
        "term": "hipotiroidismo grave",
        "fsn": "hipotiroidismo grave (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "83664006",
        "term": "hipotiroidismo atrófico idiopático",
        "fsn": "hipotiroidismo atrófico idiopático (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "82598004",
        "term": "hipotiroidismo secundario",
        "fsn": "hipotiroidismo secundario (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "78574007",
        "term": "hipotiroidismo secundario a sarcoidosis",
        "fsn": "hipotiroidismo secundario a sarcoidosis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "75065003",
        "term": "cretinismo endémico",
        "fsn": "cretinismo endémico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "70225006",
        "term": "hipotiroidismo causado por exceso de yodo",
        "fsn": "hipotiroidismo causado por exceso de yodo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "69896004",
        "term": "artritis reumatoide",
        "fsn": "artritis reumatoide (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "64491003",
        "term": "forma mixedematosa de cretinismo",
        "fsn": "forma mixedematosa de cretinismo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "63127008",
        "term": "defecto en la síntesis de tiroglobulina",
        "fsn": "defecto en la síntesis de tiroglobulina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "63115005",
        "term": "hipotiroidismo secundario a esclerodermia",
        "fsn": "hipotiroidismo secundario a esclerodermia (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "60733007",
        "term": "hipotiroidismo secundario a amiloidosis",
        "fsn": "hipotiroidismo secundario a amiloidosis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "57160007",
        "term": "síndrome de Felty",
        "fsn": "síndrome de Felty (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "56041007",
        "term": "hipotiroidismo por defecto en la síntesis de hormona tiroidea",
        "fsn": "hipotiroidismo por defecto en la síntesis de hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "55838005",
        "term": "secuencia de hipotiroidismo",
        "fsn": "secuencia de hipotiroidismo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "54823002",
        "term": "hipotiroidismo subclínico",
        "fsn": "hipotiroidismo subclínico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "52724003",
        "term": "defecto en la oxidación del yoduro",
        "fsn": "defecto en la oxidación del yoduro (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "52661003",
        "term": "proceso reumatoideo extrarticular",
        "fsn": "proceso reumatoideo extrarticular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "50375007",
        "term": "defecto de respuesta de hormona tiroidea",
        "fsn": "defecto de respuesta de hormona tiroidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "49830003",
        "term": "hipotiroidismo causado por sustancias alimentarias",
        "fsn": "hipotiroidismo causado por sustancias alimentarias (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "49708008",
        "term": "anemia asociada con insuficiencia renal crónica",
        "fsn": "anemia asociada con insuficiencia renal crónica (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "43507005",
        "term": "mixedema del adulto",
        "fsn": "mixedema del adulto (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "43153006",
        "term": "mixedema",
        "fsn": "mixedema (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "42785009",
        "term": "hipotiroidismo secundario a cistinosis",
        "fsn": "hipotiroidismo secundario a cistinosis (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "42277004",
        "term": "producción disminuida transitoria de T>3<",
        "fsn": "producción disminuida transitoria de T>3< (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "40930008",
        "term": "hipotiroidismo",
        "fsn": "hipotiroidismo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "40539002",
        "term": "hipotiroidismo secundario a terapia con yodo radiactivo",
        "fsn": "hipotiroidismo secundario a terapia con yodo radiactivo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "39444001",
        "term": "hipotiroidismo por tiroiditis fibrosa invasiva",
        "fsn": "hipotiroidismo por tiroiditis fibrosa invasiva (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "37429009",
        "term": "hipotiroidismo hipotalámico",
        "fsn": "hipotiroidismo hipotalámico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "30229009",
        "term": "hipotiroidismo secundario a enfermedad infiltrativa",
        "fsn": "hipotiroidismo secundario a enfermedad infiltrativa (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "28880005",
        "term": "carditis reumatoidea",
        "fsn": "carditis reumatoidea (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "27059002",
        "term": "hipotiroidismo postquirúrgico",
        "fsn": "hipotiroidismo postquirúrgico (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "26692000",
        "term": "hipotiroidismo central",
        "fsn": "hipotiroidismo central (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "23536000",
        "term": "defecto de acoplamiento de yodotirosilo",
        "fsn": "defecto de acoplamiento de yodotirosilo (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "22558005",
        "term": "defecto en el transporte de yoduro",
        "fsn": "defecto en el transporte de yoduro (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "18621008",
        "term": "producción disminuida transitoria de T>4<",
        "fsn": "producción disminuida transitoria de T>4< (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "17885001",
        "term": "defecto en la desyodinación de la yodotirosina",
        "fsn": "defecto en la desyodinación de la yodotirosina (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "14779006",
        "term": "hipotiroidismo secundario a radioterapia externa",
        "fsn": "hipotiroidismo secundario a radioterapia externa (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "10718002",
        "term": "mixedema juvenil",
        "fsn": "mixedema juvenil (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "7607008",
        "term": "pericarditis secundaria a artritis reumatoidea",
        "fsn": "pericarditis concomitante con artritis reumatoidea extra-articular (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "4641009",
        "term": "cardiopatía por mixedema",
        "fsn": "cardiopatía por mixedema (trastorno)",
        "semanticTag": "trastorno"
    },
    {
        "conceptId": "2917005",
        "term": "hipotiroidismo transitorio",
        "fsn": "hipotiroidismo transitorio (trastorno)",
        "semanticTag": "trastorno"
    }
]


async function getColl(name) {
    const db = await getConnection('andes', mongoURL);
    return db.collection(name);
}
const databases = {};

const getConnection = async function (name, url) {
    try {
        if (databases[name]) {
            return databases[name];
        } else {
            const conn = await MongoClient.connect(url, { slave_ok: true });
            const db = conn.db(name);
            databases[name] = db;
            return db;
        }
    } catch (err) {
        console.warn(err.message);
        process.exit();
    }
}


async function main() {
    const cie = await getColl('snomed-cie10');
    const ps = conceptos.map(async c => {
        const map = await cie.findOne({ conceptId: c.conceptId })
        return {
            ...c,
            cie10: map.mapTarget
        }
    });
    const cie10 = await Promise.all(ps);

    console.log(JSON.stringify(cie10));
}

main();