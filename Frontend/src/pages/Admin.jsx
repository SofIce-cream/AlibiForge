import { useState, useEffect } from "react";
import {
    listarUsuarios,
    cambiarRolUsuario,
    eliminarUsuario,
    obtenerCoartadas,
    cambiarEstadoCoartada,
    eliminarCoartada
} from "../api";
import { useAuth } from "../context/AuthContext";
import Mensaje from "../components/Mensaje";

// Panel solo para administradores: usuarios y cola de moderación de coartadas
function Admin() {
    const { usuario: yo } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [coartadas, setCoartadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ocupado, setOcupado] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });

    async function cargar() {
        try {
            const [listaUsuarios, listaCoartadas] = await Promise.all([listarUsuarios(), obtenerCoartadas()]);
            setUsuarios(listaUsuarios);
            setCoartadas(listaCoartadas.filter((c) => c.estado === "Submitted" || c.estado === "UnderReview"));
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    async function ejecutar(accion, textoOk) {
        setOcupado(true);
        setMensaje({ texto: "", tipo: "info" });
        try {
            await accion();
            setMensaje({ texto: textoOk, tipo: "ok" });
            await cargar();
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
        } finally {
            setOcupado(false);
        }
    }

    function alternarRol(u) {
        const nuevo = u.role === "admin" ? "user" : "admin";
        ejecutar(() => cambiarRolUsuario(u._id, nuevo), `${u.alias} ahora es ${nuevo === "admin" ? "administrador" : "usuario"}.`);
    }

    function borrarUsuario(u) {
        if (!window.confirm(`¿Eliminar a ${u.alias}? También se borrarán sus coartadas y votos.`)) return;
        ejecutar(() => eliminarUsuario(u._id), `Usuario ${u.alias} eliminado.`);
    }

    function moverEstado(c, estado) {
        ejecutar(() => cambiarEstadoCoartada(c.id, estado), `"${c.titulo}" pasó a ${estado}.`);
    }

    function borrarCoartada(c) {
        if (!window.confirm(`¿Eliminar la coartada "${c.titulo}"?`)) return;
        ejecutar(() => eliminarCoartada(c.id), "Coartada eliminada.");
    }

    return (
        <main className="pagina-ancha">
            <h2>Administración</h2>

            <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
            {cargando && <p className="cargando">Cargando panel...</p>}

            {!cargando && (
                <>
                    <section>
                        <h3>Moderación de coartadas</h3>
                        <p className="ranking-descripcion">Coartadas enviadas o en revisión que esperan una decisión.</p>
                        {coartadas.length === 0 && <p>No hay coartadas pendientes.</p>}
                        {coartadas.map((c) => (
                            <div key={c.id} className="fila-admin">
                                <div className="datos">
                                    <strong>{c.titulo}</strong><br />
                                    <small>{c.autor} · <span className={`estado estado-${c.estado}`}>{c.estado}</span> · {c.indice} pts</small>
                                </div>
                                <div className="acciones">
                                    {c.transiciones.map((estado) => (
                                        <button key={estado} className="btn-estado" disabled={ocupado} onClick={() => moverEstado(c, estado)}>
                                            Pasar a {estado}
                                        </button>
                                    ))}
                                    <button className="btn-peligro" disabled={ocupado} onClick={() => borrarCoartada(c)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h3>Usuarios ({usuarios.length})</h3>
                        {usuarios.map((u) => (
                            <div key={u._id} className="fila-admin">
                                <div className="datos">
                                    <strong>{u.alias}</strong> {u.role === "admin" && <em>(admin)</em>}<br />
                                    <small>{u.especialidad} · {u.gremio ? u.gremio.nombre : "Sin gremio"} · {u.credibilidad} pts</small>
                                </div>
                                {u.alias !== yo.alias && (
                                    <div className="acciones">
                                        <button className="btn-secundario" disabled={ocupado} onClick={() => alternarRol(u)}>
                                            {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                                        </button>
                                        <button className="btn-peligro" disabled={ocupado} onClick={() => borrarUsuario(u)}>Eliminar</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                </>
            )}
        </main>
    );
}

export default Admin;