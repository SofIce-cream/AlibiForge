//¡¡Aqui quitas los comentario para funcionalidad total del codigo!!

// Para leer y guardar coartadas
//Usa el mismo Localstorage de la parte B de sofi
 import { modificarCredibilidad } from "../utils/usuarios";
 
export function obtenerCoartadas() {
    const datos = localStorage.getItem("coartadas");
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}
 
export function guardarCoartadas(coartadas) {
    localStorage.setItem("coartadas", JSON.stringify(coartadas));
}
 
//Calculamos el indice de credibilidad de una coartada
 
export function calcularComplejidad(coartada) {
    const cantidadDetalles = coartada.detalles.length;
 
    if (cantidadDetalles >= 10) {
        return 20;
    } else if (cantidadDetalles >= 5) {
        return 10;
    } else if (cantidadDetalles >= 3) {
        return 5;
    } else {
        return 0;
    }
}
 
export function calcularPromedioVotos(coartada) {
    if (coartada.votos.length === 0) {
        return 0;
    }
 
    let sumaPromedios = 0;
 
    coartada.votos.forEach(function (voto) {
        const promedioDeEsteVoto = (voto.credibilidad + voto.creatividad + voto.consistencia) / 3;
        sumaPromedios = sumaPromedios + promedioDeEsteVoto;
    });
 
    return sumaPromedios / coartada.votos.length;
}
 
export function calcularIndiceCredibilidad(coartada) {
    const promedio = calcularPromedioVotos(coartada);
    const puntosPorTestigos = coartada.testigos.length * 2;
    const complejidad = calcularComplejidad(coartada);
 
    const indice = (promedio * 10) + puntosPorTestigos + complejidad;
 
    return Math.round(indice * 10) / 10;
}
 
// Cadena de testigos
 
// Recibe la lista completa, el id de la coartada, y quién se quiere unir 
// y devuelve la lista nueva o la misma en caso de que no se haya podido añadir
export function unirseComoTestigo(coartadas, idCoartada, alias) {
    const coartada = coartadas.find(function (c) {
        return c.id === idCoartada;
    });
 
    if (!coartada) {
        return coartadas;
    }
 
    if (coartada.testigos.includes(alias)) {
        alert("Ya eres testigo de esta coartada.");
        return coartadas;
    }
 
    coartada.testigos.push(alias);
    guardarCoartadas(coartadas);
    return coartadas;
}
 
// Cuando desiertan el usuario se quita como testigo, y se penaliza al autor 
// y a los testigos que quedaron -5 puntos (decidimos)
const PENALIZACION_POR_DESERCION = 5;
 
export function desertarDeLaCadena(coartadas, idCoartada, alias) {
    const coartada = coartadas.find(function (c) {
        return c.id === idCoartada;
    });
 
    if (!coartada) {
        return coartadas;
    }
 
    if (!coartada.testigos.includes(alias)) {
        alert("No eres testigo de esta coartada.");
        return coartadas;
    }
 
    coartada.testigos = coartada.testigos.filter(function (testigo) {
        return testigo !== alias;
    });
 
    modificarCredibilidad(coartada.autor, -PENALIZACION_POR_DESERCION);
 
    coartada.testigos.forEach(function (testigo) {
        modificarCredibilidad(testigo, -PENALIZACION_POR_DESERCION);
    });
 
    guardarCoartadas(coartadas);
    return coartadas;
}
 
// Penalizaciones
 
const PENALIZACION_POR_EXPOSICION = 10;
const VOTOS_NECESARIOS_PARA_EXPONER = 3;
 
// Marcar una coartada como falsa (un usuario solo puede marcar falsa 
// una sola vez por coartada), cuando se juntan 3 marcas, la coartada se rechaza 
// y el autor pierde credibilidad UNA sola vez 
export function marcarComoFalsa(coartadas, idCoartada, alias) {
    const coartada = coartadas.find(function (c) {
        return c.id === idCoartada;
    });
 
    if (!coartada) {
        return coartadas;
    }
 
    if (coartada.marcasFalsas.includes(alias)) {
        alert("Ya marcaste esta coartada como falsa.");
        return coartadas;
    }
 
    coartada.marcasFalsas.push(alias);
 
    if (coartada.marcasFalsas.length >= VOTOS_NECESARIOS_PARA_EXPONER && !coartada.expuesta) {
        coartada.expuesta = true;
        coartada.estado = "Rejected";
        modificarCredibilidad(coartada.autor, -PENALIZACION_POR_EXPOSICION);
    }
 
    guardarCoartadas(coartadas);
    return coartadas;
}
