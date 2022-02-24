const { MongoClient, ObjectId } = require('mongodb');
const { format } = require('@fast-csv/format');
const fs = require('fs');
const Chain = require('stream-chain');

const mongoURL = 'mongodb://localhost:27017/andes';


async function getColl(name) {
    const db = await getConnection('andes', mongoURL);
    return db.collection(name);
}

function csvTransform() {
    return format({ headers: true });
}

function encriptData() {
    let paciente = 0;
    let prestacion = 0;
    const mappingPrestacion = {};
    const mappingPaciente = {};
    return function transform(data) {
        if (!mappingPaciente[data.idPaciente]) {
            paciente++;
            mappingPaciente[data.idPaciente] = paciente;
            data.idPaciente = paciente;
        } else {
            data.idPaciente = mappingPaciente[data.idPaciente];
        }

        if (!mappingPrestacion[data.idPrestacion]) {
            prestacion++;
            mappingPrestacion[data.idPrestacion] = prestacion;
            data.idPrestacion = prestacion;
        } else {
            data.idPrestacion = mappingPrestacion[data.idPrestacion];
        }
        return data;
    }
}

async function main() {
    const collection = await getColl('prestaciones');
    // const collection = await getColl('prestacionTx');

    const agg = collection.aggregate(pipelineListadoInternacionConServicios);
    const writeStream = fs.createWriteStream('./andes_internaciones.csv');

    // const chain = new Chain([
    //     encriptData()
    // ]);

    agg.pipe(csvTransform()).pipe(writeStream);

    agg.on('end', function () {
        // process.exit(0);
        console.log('termine')
    });

    agg.on('error', e => {
        console.log(e);
    })

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


const pipeline2 = [
    {
        $match: {
            'organizacion.id': new ObjectId("57e9670e52df311059bc8964"),
            fechaIngreso: { $gte: new Date("2021-01-01") }
        }
    },


    // { $limit: 10 },
    {
        $lookup: {
            from: 'prestaciones',
            let: { paciente: '$paciente.id', fecha: '$fechaIngreso' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$paciente.id', '$$paciente'], },
                                { $gte: ['$solicitud.fecha', '$$fecha'] }
                            ]


                        },
                        'solicitud.organizacion.id': new ObjectId("57e9670e52df311059bc8964"),
                        'solicitud.tipoPrestacion.conceptId': '5491000013101',
                        'estadoActual.tipo': 'validada'

                    }
                },

                { $unwind: '$ejecucion.registros' },
                { $unwind: '$ejecucion.registros.registros' },
                { $match: { 'ejecucion.registros.registros.concepto.conceptId': '5961000013104' } },
                { $unwind: '$ejecucion.registros.registros.registros' },
                { $project: { r: '$ejecucion.registros.registros.registros' } }

            ],
            as: 'registros'
        }
    },
    { $unwind: { path: '$registros', preserveNullAndEmptyArrays: true } },

    {
        $project: {
            _id: 0,
            idInternacion: { $toString: '$_id' },
            paciente_id: { $toString: '$paciente.id' },
            paciente_documento: '$paciente.documento',
            paciente_nombre: { $concat: ['$paciente.nombre', ' ', '$paciente.apellido'] },
            paiente_fechaNacimiento: {
                $dateToString: {
                    date: '$paciente.fechaNacimiento',
                    format: '%Y-%m-%d',
                    timezone: 'America/Argentina/Buenos_Aires'
                }
            },
            fechaIngreso: { $dateToString: { date: '$fechaIngreso', format: '%Y-%m-%d', timezone: 'America/Argentina/Buenos_Aires' } },
            fechaEgreso: { $dateToString: { date: '$fechaEgreso', format: '%Y-%m-%d', timezone: 'America/Argentina/Buenos_Aires' } },
            razonAlta: '$tipo_egreso',
            diagnostico_conceptId: { $ifNull: ['$registros.r.concepto.conceptId', ''] },
            diagnostico_term: { $ifNull: ['$registros.r.concepto.term', ''] },



        }

    }




]

const pipeline = [
    {
        $match: {
            start: {
                $gte: new Date("2020-01-01"),
                $lte: new Date("2020-07-01")
            }
        }
    },

    { $unwind: '$registros' },

    {
        $project: {
            _id: false,
            idPrestacion: '$registros.prestacionId',
            idPaciente: { $toString: '$registros.paciente.id' },
            concepto_id: '$concepto.conceptId',
            concepto_term: '$concepto.term',
            fecha: { $dateToString: { date: '$registros.fecha', format: '%Y-%m-%d' } },
            ambito: { $ifNull: ['$registros.ambito', null] },
            valor: { $cond: { if: { $eq: ['$registros.valorType', 'number'] }, then: '$registros.valor', else: null } },

            profesional: '$profesional.nombre',
            organizacion: '$profesional.organizacion',

            prestacion: { $ifNull: ['$registros.tipoPrestacion.term', null] },
            turno: { $ifNull: ['$registros.turno', null] },

            localidad: { $ifNull: ['$registros.paciente.localidad', null] },

            edad: { $ifNull: ['$registros.paciente.edad.edad', null] },

        }
    }



]


const pipelineListadoInternacionConServicios = [

    {
        "$match": {
            "ejecucion.registros.valor.informeIngreso.fechaIngreso": {
                "$gte": new Date("2022-01-01"),
                "$lte": new Date("2022-12-31")
            },
            "solicitud.ambitoOrigen": "internacion",
            "solicitud.tipoPrestacion.conceptId": "32485007",
            "solicitud.organizacion.id": new ObjectId("57e9670e52df311059bc8964"),
            "estadoActual.tipo": {
                "$nin": ["modificada", "anulada"]
            }
        }
    },
    // { $limit: 10 },
    {
        "$lookup": {
            "from": "paciente",
            "localField": "paciente.id",
            "foreignField": "_id",
            "as": "pacienteCompleto"
        }
    },
    {
        "$addFields": {
            "paciente": {
                "$mergeObjects": [
                    {
                        "$arrayElemAt": [
                            "$pacienteCompleto",
                            0
                        ]
                    },
                    "$paciente"
                ]
            }
        }
    },
    {
        "$addFields": {
            "direccion": {
                "$arrayElemAt": [
                    "$paciente.direccion",
                    0
                ]
            }
        }
    },
    {
        "$lookup": {
            "from": "localidad",
            "localField": "direccion.ubicacion.localidad._id",
            "foreignField": "_id",
            "as": "localidad"
        }
    },
    {
        "$addFields": {
            "localidad": {
                "$arrayElemAt": [
                    "$localidad",
                    0
                ]
            },
            "ingreso": {
                "$arrayElemAt": [
                    "$ejecucion.registros",
                    0
                ]
            },
            "egreso": {
                "$arrayElemAt": [
                    "$ejecucion.registros",
                    1
                ]
            }
        }
    },
    {
        "$lookup": {
            "from": "internacionCamaEstados",
            "let": {
                "idInternacion": "$_id"
            },
            "pipeline": [
                {
                    $match: {
                        //'capa': 'estadistica',
                        //'ambito': 'internacion',
                        // 'idOrganizacion' : ObjectId("57e9670e52df311059bc8964"),
                        // 'estados.idInternacion': ObjectId("612f2fedc1d6ccc4325355b8")
                        $expr: {
                            $or: [
                                { $in: ['$$idInternacion', '$estados.idInternacion'] },
                                { $in: ['$$idInternacion', '$estados.extras.idInternacion'] }
                            ]
                        }
                    }
                },
                { $unwind: '$estados' },
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $eq: ['$$idInternacion', '$estados.idInternacion'] },
                                { $eq: ['$$idInternacion', '$estados.extras.idInternacion'] }
                            ]
                        }

                    }
                },
                { $sort: { 'estados.fecha': 1 } },
                {
                    $lookup: {
                        from: 'internacionCamas',
                        localField: 'idCama',
                        foreignField: '_id',
                        as: 'cama'
                    }
                },
                { $unwind: '$cama' },
                {
                    $addFields: {
                        nombreCama: {
                            $concat: [
                                {
                                    $reduce: {
                                        input: '$cama.sectores',
                                        initialValue: '',
                                        in: {
                                            $concat: ['$$value', '$$this.nombre', ', ']
                                        }
                                    }
                                },
                                '$cama.nombre'
                            ]
                        }
                    }
                }


            ],
            as: 'movimientos'
        }

    },
    {
        "$lookup": {
            "from": "prestaciones",
            "let": {
                "paciente": "$paciente.id"
            },
            "pipeline": [
                {
                    "$match": {
                        "ejecucion.registros.concepto.conceptId": "840534001",
                        "estadoActual.tipo": "validada",
                        "$expr": {
                            "$eq": [
                                "$paciente.id",
                                "$$paciente"
                            ]
                        }
                    }
                },
                {
                    "$unwind": "$ejecucion.registros"
                },
                {
                    "$match": {
                        "ejecucion.registros.concepto.conceptId": "840534001"
                    }
                },
                {
                    "$replaceRoot": {
                        "newRoot": {
                            "$ifNull": [
                                "$ejecucion.registros.valor.vacuna",
                                {}
                            ]
                        }
                    }
                },
                {
                    "$sort": {
                        "fechaAplicacion": 1
                    }
                }
            ],
            "as": "vacunas"
        }
    },
    {
        "$addFields": {
            "movIngreso": {
                "$arrayElemAt": [
                    {
                        "$filter": {
                            "input": "$movimientos",
                            "as": "mov",
                            "cond": {
                                "$eq": [
                                    "$$mov.estados.extras.ingreso",
                                    true
                                ]
                            }
                        }
                    },
                    0
                ]
            },
            "movEgreso": {
                "$arrayElemAt": [
                    {
                        "$filter": {
                            "input": "$movimientos",
                            "as": "mov",
                            "cond": {
                                "$eq": [
                                    "$$mov.estados.extras.egreso",
                                    true
                                ]
                            }
                        }
                    },
                    0
                ]
            },
            "pases": {
                "$filter": {
                    "input": "$movimientos",
                    "as": "mov",
                    "cond": {
                        "$ne": [
                            { "$ifNull": ["$$mov.estados.extras.unidadOrganizativaOrigen.conceptId", null] },
                            null
                        ]
                    }
                }
            },
            "primeraDosis": {
                "$arrayElemAt": [
                    "$vacunas",
                    0
                ]
            },
            "segundaDosis": {
                "$arrayElemAt": [
                    "$vacunas",
                    1
                ]
            },
            "progenitor": {
                "$arrayElemAt": [
                    {
                        "$filter": {
                            "input": "$paciente.relacion",
                            "as": "relacion",
                            "cond": {
                                "$gte": [
                                    "$$relacion.nombre",
                                    "progenitor/a"
                                ]
                            }
                        }
                    },
                    0
                ]
            },
            "especialidad": {
                "$arrayElemAt": [
                    "$ingreso.valor.informeIngreso.especialidades",
                    0
                ]
            },
            "diagnostico_1": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.otrosDiagnosticos",
                    0
                ]
            },
            "diagnostico_2": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.otrosDiagnosticos",
                    1
                ]
            },
            "diagnostico_3": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.otrosDiagnosticos",
                    2
                ]
            },
            "diagnostico_4": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.otrosDiagnosticos",
                    3
                ]
            },
            "nacimientos_1": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.nacimientos",
                    0
                ]
            },
            "nacimientos_2": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.nacimientos",
                    1
                ]
            },
            "nacimientos_3": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.nacimientos",
                    2
                ]
            },
            "nacimientos_4": {
                "$arrayElemAt": [
                    "$egreso.valor.InformeEgreso.nacimientos",
                    3
                ]
            },
        }
    },
    {
        $addFields: {
            "pase_1": {
                "$arrayElemAt": [
                    "$pases",
                    0
                ]
            },
            "pase_2": {
                "$arrayElemAt": [
                    "$pases",
                    1
                ]
            },
            "pase_3": {
                "$arrayElemAt": [
                    "$pases",
                    2
                ]
            },
            "pase_4": {
                "$arrayElemAt": [
                    "$pases",
                    3
                ]
            },
            "pase_5": {
                "$arrayElemAt": [
                    "$pases",
                    4
                ]
            },
            "pase_6": {
                "$arrayElemAt": [
                    "$pases",
                    5
                ]
            },
            "pase_7": {
                "$arrayElemAt": [
                    "$pases",
                    6
                ]
            },
            "pase_8": {
                "$arrayElemAt": [
                    "$pases",
                    7
                ]
            },
            "pase_9": {
                "$arrayElemAt": [
                    "$pases",
                    8
                ]
            },
            "pase_10": {
                "$arrayElemAt": [
                    "$pases",
                    9
                ]
            },
            "pase_11": {
                "$arrayElemAt": [
                    "$pases",
                    10
                ]
            },
            "pase_12": {
                "$arrayElemAt": [
                    "$pases",
                    11
                ]
            },
            "pase_13": {
                "$arrayElemAt": [
                    "$pases",
                    12
                ]
            },
            "pase_14": {
                "$arrayElemAt": [
                    "$pases",
                    13
                ]
            },
            "pase_15": {
                "$arrayElemAt": [
                    "$pases",
                    14
                ]
            },
            "pase_16": {
                "$arrayElemAt": [
                    "$pases",
                    15
                ]
            },
            "pase_17": {
                "$arrayElemAt": [
                    "$pases",
                    16
                ]
            },
            "pase_18": {
                "$arrayElemAt": [
                    "$pases",
                    17
                ]
            },
            "pase_19": {
                "$arrayElemAt": [
                    "$pases",
                    18
                ]
            },
            "pase_20": {
                "$arrayElemAt": [
                    "$pases",
                    19
                ]
            },
        }
    },
    {
        "$project": {
            "_id": 0,
            // "movimientos": 1,
            // "movIngreso": 1,
            // "movEgreso": 1,
            // "pases": 1,
            // "pase_1": 1,
            "PrestacionId": "$_id",
            "AnioInfor": {
                "$dateToString": {
                    "date": {
                        "$cond": {
                            "if": {
                                "$eq": [
                                    {
                                        "$type": "$egreso.valor.InformeEgreso.fechaEgreso"
                                    },
                                    "string"
                                ]
                            },
                            "then": {
                                "$dateFromString": {
                                    "dateString": "$egreso.valor.InformeEgreso.fechaEgreso"
                                }
                            },
                            "else": "$egreso.valor.InformeEgreso.fechaEgreso"
                        }
                    },
                    "format": "%Y"
                }
            },
            "Estab": "$ejecucion.organizacion.nombre",
            "HistClin": "$ingreso.valor.informeIngreso.nroCarpeta",
            "Apellido": "$paciente.apellido",
            "Nombre": "$paciente.nombre",
            "CodDocum": "1",
            "NumDocum": "$paciente.documento",
            "NacDia": {
                "$dateToString": {
                    "date": "$paciente.fechaNacimiento",
                    "format": "%d"
                }
            },
            "NacMes": {
                "$dateToString": {
                    "date": "$paciente.fechaNacimiento",
                    "format": "%m"
                }
            },
            "NacAnio": {
                "$dateToString": {
                    "date": "$paciente.fechaNacimiento",
                    "format": "%Y"
                }
            },
            "CodUniEdad": "1",
            "UniEdad": "años",
            "EdadIng": {
                "$toInt": {
                    "$divide": [
                        {
                            "$subtract": [
                                "$ingreso.valor.informeIngreso.fechaIngreso",
                                {
                                    "$cond": {
                                        "if": {
                                            "$eq": [
                                                {
                                                    "$type": "$paciente.fechaNacimiento"
                                                },
                                                "string"
                                            ]
                                        },
                                        "then": {
                                            "$dateFromString": {
                                                "dateString": "$paciente.fechaNacimiento"
                                            }
                                        },
                                        "else": "$paciente.fechaNacimiento"
                                    }
                                }
                            ]
                        },
                        31536000000
                    ]
                }
            },
            "CodDocumM": "1",
            "NumDocumM": {
                "$ifNull": [
                    "$progenitor.documento",
                    null
                ]
            },
            "CodLosRes": {
                "$substr": [
                    "$localidad.codLocalidad",
                    5,
                    8
                ]
            },
            "LocRes": {
                "$ifNull": [
                    "$localidad.nombre",
                    null
                ]
            },
            "CodDepRes": {
                "$substr": [
                    "$localidad.codLocalidad",
                    2,
                    5
                ]
            },
            "DepRes": {
                "$ifNull": [
                    "$localidad.departamento",
                    null
                ]
            },
            "CodProvRes": {
                "$substr": [
                    "$localidad.codLocalidad",
                    0,
                    2
                ]
            },
            "ProvRes": {
                "$ifNull": [
                    "$localidad.provincia.nombre",
                    null
                ]
            },
            "CodPaisRes": "200",
            "PaisRes": "Argentina",
            "CodSexo": "$paciente.sexo",
            "Sexo": "$paciente.sexo",
            "CodAsoc": {
                "$cond": {
                    "if": {
                        "$ne": [
                            "$ingreso.valor.informeIngreso.obraSocial",
                            null
                        ]
                    },
                    "then": 1,
                    "else": 5
                }
            },
            "Osoc": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.obraSocial.nombre",
                    null
                ]
            },
            "CodNivelInst": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.nivelInstruccion",
                    null
                ]
            },
            "NivelInst": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.nivelInstruccion",
                    null
                ]
            },
            "CodSitLab": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.situacionLaboral",
                    null
                ]
            },
            "SitLab": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.situacionLaboral",
                    null
                ]
            },
            "CodOcupac": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.ocupacionHabitual.codigo",
                    null
                ]
            },
            "Ocupac": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.ocupacionHabitual.nombre",
                    null
                ]
            },
            "CodHospPor": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.origen",
                    null
                ]
            },
            "HospPor": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.origen",
                    null
                ]
            },
            "Origen": {
                "$ifNull": [
                    "$ingreso.valor.informeIngreso.organizacionOrigen.nombre",
                    null
                ]
            },
            "FecIngreso": {
                "$dateToString": {
                    "date": "$ingreso.valor.informeIngreso.fechaIngreso",
                    "format": "%Y-%m-%d",
                    "timezone": "America/Argentina/Buenos_Aires"
                }
            },
            "ServicioIngreso": {
                "$ifNull": [
                    "$movIngreso.estados.unidadOrganizativa.term",
                    ''
                ]
            },
            "CamaIngreso": {
                "$ifNull": [
                    "$movIngreso.nombreCama",
                    ''
                ]
            },
            "FecEgreso": {
                "$dateToString": {
                    "date": "$egreso.valor.InformeEgreso.fechaEgreso",
                    "format": "%Y-%m-%d",
                    "timezone": "America/Argentina/Buenos_Aires"
                }
            },
            "ServicioEgreso": {
                "$ifNull": [
                    "$movEgreso.estados.unidadOrganizativa.term",
                    ''
                ]
            },
            "CamaEgreso": {
                "$ifNull": [
                    "$movEgreso.nombreCama",
                    ''
                ]
            },

            "PaseFecha_1": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_1.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_1": {
                $ifNull: ["$pase_1.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_2": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_2.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_2": {
                $ifNull: ["$pase_2.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_3": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_3.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_3": {
                $ifNull: ["$pase_3.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_4": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_4.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_4": {
                $ifNull: ["$pase_4.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_5": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_5.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_5": {
                $ifNull: ["$pase_5.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_6": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_6.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_6": {
                $ifNull: ["$pase_6.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_7": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_7.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_7": {
                $ifNull: ["$pase_7.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_8": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_8.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_8": {
                $ifNull: ["$pase_8.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_9": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_9.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_9": {
                $ifNull: ["$pase_9.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_10": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_10.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_10": {
                $ifNull: ["$pase_10.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_11": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_11.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_11": {
                $ifNull: ["$pase_11.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_12": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_12.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_12": {
                $ifNull: ["$pase_12.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_13": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_13.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_13": {
                $ifNull: ["$pase_13.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_14": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_14.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_14": {
                $ifNull: ["$pase_14.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_15": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_15.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_15": {
                $ifNull: ["$pase_15.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_16": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_16.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_16": {
                $ifNull: ["$pase_16.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_17": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_17.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_17": {
                $ifNull: ["$pase_17.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_18": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_18.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_18": {
                $ifNull: ["$pase_18.estados.unidadOrganizativa.term", '']
            },

            "PaseFecha_19": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_19.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_19": {
                $ifNull: ["$pase_19.estados.unidadOrganizativa.term", '']
            },


            "PaseFecha_20": {
                $ifNull: [
                    {
                        "$dateToString": {
                            "date": "$pase_20.estados.fecha",
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    ''
                ]
            },
            "PaseServicio_20": {
                $ifNull: ["$pase_20.estados.unidadOrganizativa.term", '']
            },

            "EspecEgre": {
                "$ifNull": [
                    "$especialidad.term",
                    null
                ]
            },
            "CodEspecEgre": {
                "$ifNull": [
                    "$especialidad.conceptId",
                    null
                ]
            },
            "DiasTotEst": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.diasDeEstada",
                    null
                ]
            },
            "EgresP": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.tipoEgreso.nombre",
                    null
                ]
            },
            "CodEgresP": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.tipoEgreso.nombre",
                    null
                ]
            },
            "Lugar_Trasl": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.UnidadOrganizativaDestino.nombre",
                    null
                ]
            },
            "CodDiagPr": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.diagnosticoPrincipal.codigo",
                    null
                ]
            },
            "OtDiag1": {
                "$ifNull": [
                    "$diagnostico_1.codigo",
                    null
                ]
            },
            "OtDiag2": {
                "$ifNull": [
                    "$diagnostico_2.codigo",
                    null
                ]
            },
            "OtDiag3": {
                "$ifNull": [
                    "$diagnostico_3.codigo",
                    null
                ]
            },
            "OtDiag4": {
                "$ifNull": [
                    "$diagnostico_4.codigo",
                    null
                ]
            },
            "CodCauExtT": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.causaExterna.producidaPor.nombre",
                    null
                ]
            },
            "CauExtT": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.causaExterna.producidaPor.id",
                    null
                ]
            },
            "CodCauExtL": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.causaExterna.lugar.nombre",
                    null
                ]
            },
            "CauExtL": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.causaExterna.lugar.nombre",
                    null
                ]
            },
            "CodCauExt": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.causaExterna.comoSeProdujo.codigo",
                    null
                ]
            },
            "FecTermEmb": {
                "$dateToString": {
                    "date": "$egreso.valor.InformeEgreso.terminacionEmbarazo",
                    "format": "%Y-%m-%d",
                    "timezone": "America/Argentina/Buenos_Aires"
                }
            },
            "EdadGestac": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.edadGestacional",
                    null
                ]
            },
            "Paridad": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.paridad",
                    null
                ]
            },
            "CodTipPart": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.tipoParto",
                    null
                ]
            },
            "TipPart": {
                "$ifNull": [
                    "$egreso.valor.InformeEgreso.tipoParto",
                    null
                ]
            },
            "PesoNacerRN_1": {
                "$ifNull": [
                    "$nacimientos_1.pesoAlNacer",
                    null
                ]
            },
            "CodCondNacRN_1": {
                "$ifNull": [
                    "$nacimientos_1.condicionAlNacer",
                    null
                ]
            },
            "CondNacRN_1": {
                "$ifNull": [
                    "$nacimientos_1.condicionAlNacer",
                    null
                ]
            },
            "CodTermRN_1": {
                "$ifNull": [
                    "$nacimientos_1.terminacion",
                    null
                ]
            },
            "TermRN_1": {
                "$ifNull": [
                    "$nacimientos_1.terminacion",
                    null
                ]
            },
            "SexoRN_1": {
                "$ifNull": [
                    "$nacimientos_1.sexo",
                    null
                ]
            },
            "CodSexoRN_1": {
                "$ifNull": [
                    "$nacimientos_1.sexo",
                    null
                ]
            },
            "PesoNacerRN_2": {
                "$ifNull": [
                    "$nacimientos_2.pesoAlNacer",
                    null
                ]
            },
            "CodCondNacRN_2": {
                "$ifNull": [
                    "$nacimientos_2.condicionAlNacer",
                    null
                ]
            },
            "CondNacRN_2": {
                "$ifNull": [
                    "$nacimientos_2.condicionAlNacer",
                    null
                ]
            },
            "CodTermRN_2": {
                "$ifNull": [
                    "$nacimientos_2.terminacion",
                    null
                ]
            },
            "TermRN_2": {
                "$ifNull": [
                    "$nacimientos_2.terminacion",
                    null
                ]
            },
            "SexoRN_2": {
                "$ifNull": [
                    "$nacimientos_2.sexo",
                    null
                ]
            },
            "CodSexoRN_2": {
                "$ifNull": [
                    "$nacimientos_2.sexo",
                    null
                ]
            },
            "PesoNacerRN_3": {
                "$ifNull": [
                    "$nacimientos_3.pesoAlNacer",
                    null
                ]
            },
            "CodCondNacRN_3": {
                "$ifNull": [
                    "$nacimientos_3.condicionAlNacer",
                    null
                ]
            },
            "CondNacRN_3": {
                "$ifNull": [
                    "$nacimientos_3.condicionAlNacer",
                    null
                ]
            },
            "CodTermRN_3": {
                "$ifNull": [
                    "$nacimientos_3.terminacion",
                    null
                ]
            },
            "TermRN_3": {
                "$ifNull": [
                    "$nacimientos_3.terminacion",
                    null
                ]
            },
            "SexoRN_3": {
                "$ifNull": [
                    "$nacimientos_3.sexo",
                    null
                ]
            },
            "CodSexoRN_3": {
                "$ifNull": [
                    "$nacimientos_3.sexo",
                    null
                ]
            },
            "PesoNacerRN_4": {
                "$ifNull": [
                    "$nacimientos_4.pesoAlNacer",
                    null
                ]
            },
            "CodCondNacRN_4": {
                "$ifNull": [
                    "$nacimientos_4.condicionAlNacer",
                    null
                ]
            },
            "CondNacRN_4": {
                "$ifNull": [
                    "$nacimientos_4.condicionAlNacer",
                    null
                ]
            },
            "CodTermRN_4": {
                "$ifNull": [
                    "$nacimientos_4.terminacion",
                    null
                ]
            },
            "TermRN_4": {
                "$ifNull": [
                    "$nacimientos_4.terminacion",
                    null
                ]
            },
            "SexoRN_4": {
                "$ifNull": [
                    "$nacimientos_4.sexo",
                    null
                ]
            },
            "CodSexoRN_4": {
                "$ifNull": [
                    "$nacimientos_4.sexo",
                    null
                ]
            },
            "vacunaCovid": {
                "$ifNull": [
                    "$primeraDosis.vacuna.nombre",
                    null
                ]
            },
            "vacunaDosis": {
                "$cond": {
                    "if": {
                        "$eq": [
                            {
                                "$size": "$vacunas"
                            },
                            2
                        ]
                    },
                    "then": "segunda",
                    "else": {
                        "$cond": {
                            "if": {
                                "$eq": [
                                    {
                                        "$size": "$vacunas"
                                    },
                                    1
                                ]
                            },
                            "then": "primera",
                            "else": ""
                        }
                    }
                }
            },
            "vacunaFecha": {
                "$ifNull": [
                    {
                        "$dateToString": {
                            "date": {
                                "$ifNull": [
                                    "$segundaDosis.fechaAplicacion",
                                    "$primeraDosis.fechaAplicacion"
                                ]
                            },
                            "format": "%Y-%m-%d",
                            "timezone": "America/Argentina/Buenos_Aires"
                        }
                    },
                    null
                ]
            }
        }
    }


]

main();
