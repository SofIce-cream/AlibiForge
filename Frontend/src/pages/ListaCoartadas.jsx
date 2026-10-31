import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    obtenerCoartadas,
    votarCoartada,
    unirseComoTestigo,
    desertarDeLaCadena,
    marcarComoFalsa,
    cambiarEstadoCoartada,
    eliminarCoartada
} from "../api";
import { useAuth } from "../context/AuthContext";
import TarjetaCoartada from "../components/TarjetaCoartada";
import Mensaje from "../components/Mensaje";

function ListaCoartadas() {
    const [coartadas, setCoartadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ocupado, setOcupado] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
    const [filtro, setFiltro] = useState("Todas");

    const { usuario, esAdmin } = useAuth();
    const navegar = useNavigate();

    async function cargarCoartadas() {
        try {
            setCoartadas(await obtenerCoartadas());
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarCoartadas();
    }, []);

    // Reemplaza en la lista la coartada que devolvió el backend (con el índice recalculado)
    function actualizarEnLista(actualizada) {
        setCoartadas((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
    }

    // Ejecuta una acción del backend y muestra el resultado o el error en pantalla
    async function ejecutar(accion, textoOk) {
        setOcupado(true);
        setMensaje({ texto: "", tipo: "info" });
        try {
            actualizarEnLista(await accion());
            if (textoOk) setMensaje({ texto: textoOk, tipo: "ok" });
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    const manejarVoto = (id, voto) => ejecutar(() => votarCoartada(id, voto), "Voto registrado.");
    const manejarTestigo = (id) => ejecutar(() => unirseComoTestigo(id), "Ahora eres testigo de esta coartada.");
    const manejarMarcarFalsa = (id) => ejecutar(() => marcarComoFalsa(id), "Marcaste la coartada como falsa.");
    const manejarCambioEstado = (id, estado) => ejecutar(() => cambiarEstadoCoartada(id, estado), `Estado actualizado a ${estado}.`);

    // Desertar penaliza credibilidad (lo hace el backend)
    async function manejarDesertar(id) {
        if (!window.confirm("Si abandonas la cadena, tú y el resto pierden credibilidad. ¿Continuar?")) return;
        await ejecutar(() => desertarDeLaCadena(id), "Abandonaste la cadena.");
    }

    async function manejarEliminar(coartada) {
        if (!window.confirm(`¿Eliminar la coartada "${coartada.titulo}"? Esta acción no se puede deshacer.`)) return;
        setOcupado(true);
        setMensaje({ texto: "", tipo: "info" });
        try {
            await eliminarCoartada(coartada.id);
            setCoartadas((lista) => lista.filter((c) => c.id !== coartada.id));
            setMensaje({ texto: "Coartada eliminada.", tipo: "ok" });
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    const visibles = coartadas.filter((c) => {
        if (filtro === "Todas") return true;
        if (filtro === "Mías") return c.autor === usuario.alias;
        return c.estado === filtro;
    });

    return (
        <main className="pagina-ancha">
            <h2>Coartadas de la comunidad</h2>

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="filtro">Mostrar:</label>
                <select id="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    {["Todas", "Mías", "Draft", "Submitted", "UnderReview", "Approved", "Rejected"].map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </form>

            <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

            {cargando && <p className="cargando">Cargando coartadas...</p>}
            {!cargando && visibles.length === 0 && <p>No hay coartadas para mostrar.</p>}

            {visibles.map((coartada) => (
                <TarjetaCoartada
                    key={coartada.id}
                    coartada={coartada}
                    aliasActual={usuario.alias}
                    esAdmin={esAdmin}
                    ocupado={ocupado}
                    onVotar={manejarVoto}
                    onTestigo={manejarTestigo}
                    onDesertar={manejarDesertar}
                    onMarcarFalsa={manejarMarcarFalsa}
                    onCambiarEstado={manejarCambioEstado}
                    onEditar={(id) => navegar(`/editar-coartada/${id}`)}
                    onEliminar={manejarEliminar}
                />
            ))}
        </main>
    );
}

export default ListaCoartadas;