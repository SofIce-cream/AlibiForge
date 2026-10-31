import { useState, useEffect } from "react";
import {
    obtenerSituaciones,
    obtenerSituacion,
    crearSituacion,
    actualizarSituacion,
    eliminarSituacion,
    solicitarCoartada
} from "../api";
import { useAuth } from "../context/AuthContext";
import Mensaje from "../components/Mensaje";

// Foro de "situaciones de riesgo": qué coartada usar en cada ocasión
function Situaciones() {
    const { esAdmin } = useAuth();

    const [situaciones, setSituaciones] = useState([]);
    const [abierta, setAbierta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [ocupado, setOcupado] = useState(false);

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [mensajeSolicitud, setMensajeSolicitud] = useState("");
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });

    async function cargarSituaciones() {
        try {
            setSituaciones(await obtenerSituaciones());
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarSituaciones();
    }, []);

    async function abrirSituacion(id) {
        setOcupado(true);
        try {
            setAbierta(await obtenerSituacion(id));
            setMensajeSolicitud("");
            setMensaje({ texto: "", tipo: "info" });
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    function limpiarFormulario() {
        setTitulo("");
        setDescripcion("");
        setEditandoId(null);
    }

    function empezarEdicion(situacion) {
        setEditandoId(situacion._id);
        setTitulo(situacion.titulo);
        setDescripcion(situacion.descripcion || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // El mismo formulario crea (todos los usuarios) o edita (solo admin)
    async function manejarGuardar(evento) {
        evento.preventDefault();
        if (titulo.trim().length < 3) {
            setMensaje({ texto: "El título debe tener al menos 3 caracteres.", tipo: "error" });
            return;
        }

        setOcupado(true);
        try {
            if (editandoId) {
                await actualizarSituacion(editandoId, titulo.trim(), descripcion);
                setMensaje({ texto: "Situación actualizada.", tipo: "ok" });
                if (abierta && abierta._id === editandoId) setAbierta(null);
            } else {
                await crearSituacion(titulo.trim(), descripcion);
                setMensaje({ texto: "Situación creada.", tipo: "ok" });
            }
            limpiarFormulario();
            await cargarSituaciones();
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    async function manejarEliminar(situacion) {
        if (!window.confirm(`¿Eliminar la situación "${situacion.titulo}"?`)) return;
        setOcupado(true);
        try {
            await eliminarSituacion(situacion._id);
            if (abierta && abierta._id === situacion._id) setAbierta(null);
            setMensaje({ texto: "Situación eliminada.", tipo: "ok" });
            await cargarSituaciones();
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    async function manejarSolicitar() {
        setOcupado(true);
        try {
            await solicitarCoartada(abierta._id, mensajeSolicitud);
            await abrirSituacion(abierta._id);
            setMensaje({ texto: "Solicitud enviada. La comunidad verá que necesitas una coartada.", tipo: "ok" });
            cargarSituaciones();
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    return (
        <main className="pagina-ancha">
            <h2>Foro de situaciones</h2>

            <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

            <form onSubmit={manejarGuardar}>
                <p>
                    <label htmlFor="titulo">{editandoId ? "Editar situación:" : "Nueva situación:"}</label><br />
                    <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Necesito salir de clase" maxLength={100} required />
                </p>
                <p>
                    <label htmlFor="descripcion">Descripción (opcional):</label><br />
                    <input id="descripcion" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={300} />
                </p>
                <button type="submit" disabled={ocupado}>{editandoId ? "Guardar cambios" : "Crear situación"}</button>
                {editandoId && (
                    <button type="button" className="btn-secundario" onClick={limpiarFormulario}>Cancelar edición</button>
                )}
            </form>

            {cargando && <p className="cargando">Cargando situaciones...</p>}
            {!cargando && situaciones.length === 0 && <p>Aún no hay situaciones. ¡Crea la primera!</p>}

            {situaciones.map((situacion) => (
                <section key={situacion._id}>
                    <h3>{situacion.titulo}</h3>
                    {situacion.descripcion && <p>{situacion.descripcion}</p>}
                    <p>{situacion.totalCoartadas} coartadas · {situacion.totalSolicitudes} solicitudes</p>
                    <button className="btn-secundario" disabled={ocupado} onClick={() => abrirSituacion(situacion._id)}>
                        Ver mejores coartadas
                    </button>
                    {esAdmin && (
                        <>
                            <button className="btn-estado" disabled={ocupado} onClick={() => empezarEdicion(situacion)}>Editar</button>
                            <button className="btn-peligro" disabled={ocupado} onClick={() => manejarEliminar(situacion)}>Eliminar</button>
                        </>
                    )}
                </section>
            ))}

            {abierta && (
                <section>
                    <h3>Top coartadas: {abierta.titulo}</h3>
                    {abierta.topCoartadas.length === 0 && <p>Aún no hay coartadas para esta situación.</p>}
                    <ol className="ranking-lista">
                        {abierta.topCoartadas.map((coartada) => (
                            <li key={coartada.id}>
                                <span>{coartada.titulo} <em>({coartada.autor})</em></span>
                                <strong>{coartada.indice} pts</strong>
                            </li>
                        ))}
                    </ol>

                    <p>
                        <label htmlFor="solicitud">¿Necesitas una coartada para esta situación?</label><br />
                        <input id="solicitud" type="text" value={mensajeSolicitud} onChange={(e) => setMensajeSolicitud(e.target.value)}
                            placeholder="Cuéntanos tu caso (opcional)" maxLength={300} />
                    </p>
                    <button disabled={ocupado} onClick={manejarSolicitar}>Solicitar coartada</button>
                    {abierta.solicitudes && abierta.solicitudes.length > 0 && (
                        <p>Solicitudes: {abierta.solicitudes.map((s) => s.usuario && s.usuario.alias).join(", ")}</p>
                    )}
                </section>
            )}
        </main>
    );
}

export default Situaciones;