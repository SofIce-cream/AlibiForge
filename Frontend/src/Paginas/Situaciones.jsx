import { useState, useEffect } from "react";
import {
    obtenerSituaciones,
    obtenerSituacion,
    crearSituacion,
    solicitarCoartada
} from "../api";

// Foro de "situaciones de riesgo": qué coartada usar en cada ocasión
function Situaciones() {
    const [situaciones, setSituaciones] = useState([]);
    const [abierta, setAbierta] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [mensajeSolicitud, setMensajeSolicitud] = useState("");
    const [mensaje, setMensaje] = useState("");

    async function cargarSituaciones() {
        try {
            setSituaciones(await obtenerSituaciones());
        } catch (error) {
            setMensaje(error.message);
        }
    }

    useEffect(function () {
        cargarSituaciones();
    }, []);

    async function abrirSituacion(id) {
        try {
            setAbierta(await obtenerSituacion(id));
            setMensajeSolicitud("");
            setMensaje("");
        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function manejarCrear(evento) {
        evento.preventDefault();
        try {
            await crearSituacion(titulo, descripcion);
            setTitulo("");
            setDescripcion("");
            setMensaje("Situación creada.");
            cargarSituaciones();
        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function manejarSolicitar() {
        try {
            await solicitarCoartada(abierta._id, mensajeSolicitud);
            await abrirSituacion(abierta._id);
            setMensaje("Solicitud enviada. La comunidad verá que necesitas una coartada.");
            cargarSituaciones();
        } catch (error) {
            setMensaje(error.message);
        }
    }

    return (
        <main>
            <h2>Foro de situaciones</h2>

            {mensaje && <p>{mensaje}</p>}

            <form onSubmit={manejarCrear}>
                <p>
                    <label>Nueva situación:</label><br />
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Necesito salir de clase"
                        required
                    />
                </p>
                <p>
                    <label>Descripción (opcional):</label><br />
                    <input
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        maxLength={300}
                    />
                </p>
                <button type="submit">Crear situación</button>
            </form>

            {situaciones.map(function (situacion) {
                return (
                    <section key={situacion._id}>
                        <h3>{situacion.titulo}</h3>
                        <p>
                            {situacion.totalCoartadas} coartadas · {situacion.totalSolicitudes} solicitudes
                        </p>
                        <button onClick={() => abrirSituacion(situacion._id)}>Ver mejores coartadas</button>
                    </section>
                );
            })}

            {abierta && (
                <section>
                    <h3>Top coartadas: {abierta.titulo}</h3>
                    {abierta.topCoartadas.length === 0 && <p>Aún no hay coartadas para esta situación.</p>}
                    <ol className="ranking-lista">
                        {abierta.topCoartadas.map(function (coartada) {
                            return (
                                <li key={coartada.id}>
                                    <span>{coartada.titulo} <em>({coartada.autor})</em></span>
                                    <strong>{coartada.indice} pts</strong>
                                </li>
                            );
                        })}
                    </ol>

                    <p>
                        <label>¿Necesitas una coartada para esta situación?</label><br />
                        <input
                            type="text"
                            value={mensajeSolicitud}
                            onChange={(e) => setMensajeSolicitud(e.target.value)}
                            placeholder="Cuéntanos tu caso (opcional)"
                            maxLength={300}
                        />
                    </p>
                    <button onClick={manejarSolicitar}>Solicitar coartada</button>
                    {abierta.solicitudes && abierta.solicitudes.length > 0 && (
                        <p>Solicitudes: {abierta.solicitudes.map((s) => s.usuario && s.usuario.alias).join(", ")}</p>
                    )}
                </section>
            )}
        </main>
    );
}

export default Situaciones;