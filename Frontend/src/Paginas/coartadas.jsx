import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    obtenerCoartadas,
    votarCoartada,
    unirseComoTestigo,
    desertarDeLaCadena,
    marcarComoFalsa,
    cambiarEstadoCoartada,
    obtenerAliasActual
} from "../api";
import TarjetaCoartada from "../Reutilizables/Tarjetacoartadas";
 
function Coartadas() {
    const [coartadas, setCoartadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navegar = useNavigate();
 
    const aliasActual = obtenerAliasActual();
 
    async function cargarCoartadas() {
        try {
            setCoartadas(await obtenerCoartadas());
        } catch (error) {
            alert(error.message);
            if (error.status === 401) {
                navegar("/");
            }
        } finally {
            setCargando(false);
        }
    }
 
    useEffect(function () {
        cargarCoartadas();
    }, []);
 
    // Reemplaza en la lista la coartada que devolvió el backend (con el índice recalculado)
    function actualizarEnLista(coartadaActualizada) {
        setCoartadas(function (lista) {
            return lista.map(function (c) {
                return c.id === coartadaActualizada.id ? coartadaActualizada : c;
            });
        });
    }
 
    // Ejecuta una acción del backend; si falla (ej. "Ya votaste") muestra el mensaje
    async function ejecutar(accion) {
        try {
            actualizarEnLista(await accion());
        } catch (error) {
            alert(error.message);
        }
    }
 
    function manejarVoto(idCoartada, voto) {
        ejecutar(function () { return votarCoartada(idCoartada, voto); });
    }
 
    function manejarTestigo(idCoartada) {
        ejecutar(function () { return unirseComoTestigo(idCoartada); });
    }
 
    // Desertar penaliza credibilidad (lo hace el backend)
    async function manejarDesertar(idCoartada) {
        await ejecutar(function () { return desertarDeLaCadena(idCoartada); });
        cargarCoartadas();
    }
 
    async function manejarMarcarFalsa(idCoartada) {
        await ejecutar(function () { return marcarComoFalsa(idCoartada); });
    }
 
    // Draft → Submitted → UnderReview → Approved | Rejected
    function manejarCambioEstado(idCoartada, nuevoEstado) {
        ejecutar(function () { return cambiarEstadoCoartada(idCoartada, nuevoEstado); });
    }
 
    return (
        <main>
            <h2>Coartadas de la comunidad</h2>
 
            {cargando && <p>Cargando coartadas...</p>}
            {!cargando && coartadas.length === 0 && <p>Todavía no hay coartadas.</p>}
 
            {coartadas.map(function (coartada) {
                return (
                    <TarjetaCoartada
                        key={coartada.id}
                        coartada={coartada}
                        aliasActual={aliasActual}
                        onVotar={manejarVoto}
                        onTestigo={manejarTestigo}
                        onDesertar={manejarDesertar}
                        onMarcarFalsa={manejarMarcarFalsa}
                        onCambiarEstado={manejarCambioEstado}
                    />
                );
            })}
        </main>
    );
}
 
export default Coartadas;