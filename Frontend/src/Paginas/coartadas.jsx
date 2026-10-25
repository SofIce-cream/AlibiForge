import { useState, useEffect } from "react";
import { obtenerCoartadas, guardarCoartadas, unirseComoTestigo, desertarDeLaCadena, marcarComoFalsa } from "../Almacenamiento/coartadas";
import TarjetaCoartada from "../Reutilizables/Tarjetacoartadas";
 
function Coartadas() {
    const [coartadas, setCoartadas] = useState([]);
 
    //Buscamos el usuario para cumplir la regla de solo 1 votar una vez por coartada
    const [aliasActual, setAliasActual] = useState(null);
 
    useEffect(function () {
        setCoartadas(obtenerCoartadas());
        setAliasActual(localStorage.getItem("usuarioActual"));
    }, []);
 
    // "prestamos" coartada guardada
    function manejarVoto(idCoartada, voto) {
        const listaActual = obtenerCoartadas();
 
        const coartada = listaActual.find(function (c) {
            return c.id === idCoartada;
        });
 
        if (!coartada) {
            return;
        }
 
        const yaVoto = coartada.votos.some(function (v) {
            return v.usuario === aliasActual;
        });
 
        if (yaVoto) {
            alert("Ya votaste esta coartada.");
            return;
        }
 
        coartada.votos.push({
            usuario: aliasActual,
            credibilidad: voto.credibilidad,
            creatividad: voto.creatividad,
            consistencia: voto.consistencia
        });
 
        guardarCoartadas(listaActual);
 
         // actualizar el estado de la lista
        setCoartadas(listaActual);
    }
 
    // Unirse como testigo, revisamos duplicados y guardamos en LocalStorage
    function manejarTestigo(idCoartada) {
        const listaActualizada = unirseComoTestigo(obtenerCoartadas(), idCoartada, aliasActual);
        setCoartadas([...listaActualizada]); 
    }
 
    // Desertar: además de quitar al testigo, penaliza credibilidad
    function manejarDesertar(idCoartada) {
        const listaActualizada = desertarDeLaCadena(obtenerCoartadas(), idCoartada, aliasActual);
        setCoartadas([...listaActualizada]);
    }
 
    function manejarMarcarFalsa(idCoartada) {
        const listaActualizada = marcarComoFalsa(obtenerCoartadas(), idCoartada, aliasActual);
        setCoartadas([...listaActualizada]);
    }
 
    return (
        <main>
            <h2>Coartadas de la comunidad</h2>
 
            {coartadas.map(function (coartada) {
                return (
                    <TarjetaCoartada
                        key={coartada.id}
                        coartada={coartada}
                        onVotar={manejarVoto}
                        onTestigo={manejarTestigo}
                        onDesertar={manejarDesertar}
                        onMarcarFalsa={manejarMarcarFalsa}
                    />
                );
            })}
        </main>
    );
}
 
export default Coartadas;