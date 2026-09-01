const fs = require('fs');
const csv = require('csv-parser');

function generarENOE() {
    return new Promise((resolve, reject) => {

        const resultados = [];

        fs.createReadStream('./datos/ENOE.csv')
            .pipe(csv())
            .on('data', (fila) => {

                resultados.push({
                    estado: Number(fila.cve_ent),
                    edad: Number(fila.eda),
                    genero: Number(fila.sex),
                    grado: Number(fila.cs_p13_1),
                    carrera: Number(fila.cs_p14_c),
                    trabaja: Number(fila.clase2),
                    posicion: Number(fila.pos_ocu),
                    subocupacion: Number(fila.sub_o),
                    ingreso: Number(fila.ingocup),
                    factor: Number(fila.fac_tri)
                });

            })
            .on('end', () => {

                fs.writeFileSync(
                    './datos/ENOE.json',
                    JSON.stringify(resultados, null, 2)
                );

                console.log('JSON generado');
                resolve();
            })
            .on('error', reject);

    });
}

function top(){
    return new Promise((resolve, reject) => {

        const resultados = [];

        fs.createReadStream('./datos/top_10_mas_desempleados.csv')
            .pipe(csv())
            .on('data', (fila) => {
                const claves = Object.keys(fila);

                resultados.push({
                    rango: Number(fila[claves[0]]),
                    carrera: fila[claves[1]],
                    valor: fila[claves[2]]
                });
            })
            .on('end', () => {

                fs.writeFileSync(
                    './datos/top_10_mas_desempleados.json',
                    JSON.stringify(resultados, null, 2)
                );

                console.log('JSON generado');
                resolve();
            })
            .on('error', reject);
    });
}

function top2(){
    return new Promise((resolve, reject) => {

        const resultados = [];

        fs.createReadStream('./datos/top_10_mejor_pagadas.csv')
            .pipe(csv())
            .on('data', (fila) => {
                const claves = Object.keys(fila);

                resultados.push({
                    rango: Number(fila[claves[0]]),
                    carrera: fila[claves[1]],
                    valor: fila[claves[2]]
                });
            })
            .on('end', () => {

                fs.writeFileSync(
                    './datos/top_10_mejor_pagadas.json',
                    JSON.stringify(resultados, null, 2)
                );

                console.log('JSON generado');
                resolve();
            })
            .on('error', reject);

    });
}

module.exports = { generarENOE, top, top2 };