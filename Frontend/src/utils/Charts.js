import { calcularIndiceCredibilidad } from "../Almacenamiento/coartadas";

class Chart {
    constructor(id, alias, deceitPoints, creativityPoints, consistencyPoints, wantedPoints) {
        this.id = id;
        this.alias = alias;
        this.deceitPoints = deceitPoints;
        this.creativityPoints = creativityPoints;
        this.consistencyPoints = consistencyPoints;
        this.wantedPoints = wantedPoints;
    }
}

export function calcularRankings(coartadas) {
    return {
        masterDeceit: masterDeceit(coartadas),
        mostCreative: mostCreative(coartadas),
        mostConsistent: mostConsistent(coartadas),
        mostWanted: mostWanted(coartadas)
    };
}

// Master of deceit (mayor credibilidad)
function masterDeceit(coartadas) {
    const datos = coartadas.map((coartada) => ({
        autor: coartada.autor,
        puntos: calcularIndiceCredibilidad(coartada)
    }));
    return datos.sort((a, b) => b.puntos - a.puntos);
}

// Most creative (mayor creatividad)
function mostCreative(coartadas) {
    const datos = coartadas.map((coartada) => ({
        autor: coartada.autor,
        puntos: calcularPromedioCreatividad(coartada)
    }));
    return datos.sort((a, b) => b.puntos - a.puntos);
}

// Función auxiliar
function calcularPromedioCreatividad(coartada) {
    if (coartada.votos.length === 0) {
        return 0;
    }
    let suma = 0;
    coartada.votos.forEach(function(voto) {
        suma = suma + voto.creatividad;
    });
    return suma / coartada.votos.length;
}

// Most consistent (mayor consistencia)
function mostConsistent(coartadas) {
    const datos = coartadas.map((coartada) => ({
        autor: coartada.autor,
        puntos: calcularPromedioConsistencia(coartada)
    }));
    return datos.sort((a, b) => b.puntos - a.puntos);
}

// Función auxiliar
function calcularPromedioConsistencia(coartada) {
    if (coartada.votos.length === 0) {
        return 0;
    }
    let suma = 0;
    coartada.votos.forEach(function(voto) {
        suma = suma + voto.consistencia;
    });
    return suma / coartada.votos.length;
}


// Most wanted (más alibis creados)
function mostWanted(coartadas) {
    const cantidades = {};
    coartadas.forEach(function(coartada) {
        if (cantidades[coartada.autor]) {
            cantidades[coartada.autor]++;
        } else {
            cantidades[coartada.autor] = 1;
        }
    });
    const datos = Object.keys(cantidades).map((autor) => ({
        autor: autor,
        puntos: cantidades[autor]
    }));
    return datos.sort((a, b) => b.puntos - a.puntos);
}
