import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {crearCoartada, editarCoartada, obtenerCoartada, obtenerSituaciones, obtenerAliasUsuarios} from "../api";
import { useAuth } from "../context/AuthContext";

const claseInput =
    "w-full rounded-lg border-2 border-[#8e7bdc] bg-white p-3 text-[#21175c] outline-none transition focus:border-[#0d0074] focus:ring-2 focus:ring-[#c9c0ff]";
const claseTitulo = "mb-2 mt-6 text-xl font-semibold text-[#37288a]";
const claseBoton =
    "rounded-lg bg-[#0d0074] px-[18px] py-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1600a0] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";
const claseBotonClaro =
    "rounded-lg bg-[#ded6ff] px-4 py-2 font-bold text-[#21175c] transition hover:bg-[#ccc1ff] disabled:opacity-50";

const estilosMensaje = {
    error: "bg-red-100 text-red-700 border border-red-300",
    exito: "bg-green-100 text-green-700 border border-green-300"
};

// Sirve para crear (/crear-coartada) y para editar un borrador (/editar-coartada/:id)
function CreateAlibi() {
    const { id } = useParams();
    const editando = Boolean(id);
    const navegar = useNavigate();
    const { usuario } = useAuth();

    const [titulo, setTitulo] = useState("");
    const [situacion, setSituacion] = useState("");
    const [situaciones, setSituaciones] = useState([]);
    const [historia, setHistoria] = useState("");
    const [detalles, setDetalles] = useState(["", "", ""]);
    const [testigos, setTestigos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Situaciones (foro), posibles testigos y, si se edita, la coartada actual: todo desde el backend
    useEffect(() => {
        async function cargar() {
            try {
                const lista = await obtenerSituaciones();
                setSituaciones(lista.map((s) => s.titulo));

                if (editando) {
                    const coartada = await obtenerCoartada(id);
                    if (coartada.estado !== "Draft") {
                        setMensaje({ texto: "Solo se pueden editar los borradores.", tipo: "error" });
                    }
                    setTitulo(coartada.titulo);
                    setSituacion(coartada.situacion);
                    setHistoria(coartada.historia);
                    setDetalles(coartada.detalles.length >= 3 ? coartada.detalles : [...coartada.detalles, "", ""].slice(0, 3));
                } else {
                    const aliases = await obtenerAliasUsuarios();
                    setUsuarios(aliases.filter((u) => u.alias !== usuario.alias));
                }
            } catch (e) {
                setMensaje({ texto: e.message, tipo: "error" });
            } finally {
                setCargando(false);
            }
        }
        cargar();
    }, [id, editando, usuario.alias]);

    function alternarTestigo(alias) {
        setTestigos((actuales) =>
            actuales.includes(alias) ? actuales.filter((t) => t !== alias) : [...actuales, alias]
        );
    }

    function agregarDetalle() {
        setDetalles([...detalles, ""]);
    }

    function quitarDetalle(index) {
        setDetalles(detalles.filter((_, i) => i !== index));
    }

    function cambiarDetalle(index, valor) {
        const nuevos = [...detalles];
        nuevos[index] = valor;
        setDetalles(nuevos);
    }

    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
    }

    async function guardar(nuevoEstado) {
        const detallesLlenos = detalles.map((d) => d.trim()).filter((d) => d !== "");

        if (!titulo.trim() || !situacion || !historia.trim()) {
            mostrarMensaje("Por favor, completa el título, la situación y la historia.", "error");
            return;
        }
        if (titulo.trim().length < 3) {
            mostrarMensaje("El título debe tener al menos 3 caracteres.", "error");
            return;
        }
        if (detallesLlenos.length < 3) {
            mostrarMensaje("La coartada debe tener al menos 3 detalles clave.", "error");
            return;
        }

        setGuardando(true);
        setMensaje({ texto: "", tipo: "" });
        try {
            if (editando) {
                await editarCoartada(id, {
                    titulo: titulo.trim(),
                    situacion,
                    historia: historia.trim(),
                    detalles: detallesLlenos,
                    estado: nuevoEstado
                });
                navegar("/coartadas");
                return;
            }

            // El backend valida el bloqueo (credibilidad < 0), los estados y los testigos
            await crearCoartada({
                titulo: titulo.trim(),
                situacion,
                historia: historia.trim(),
                detalles: detallesLlenos,
                testigos,
                estado: nuevoEstado
            });

            mostrarMensaje(
                nuevoEstado === "Draft" ? "Coartada guardada como borrador." : "Coartada enviada a revisión.",
                "exito"
            );
            setTitulo("");
            setSituacion("");
            setHistoria("");
            setDetalles(["", "", ""]);
            setTestigos([]);
        } catch (e) {
            mostrarMensaje(e.message, "error");
        } finally {
            setGuardando(false);
        }
    }

    const opcionesSituacion = situacion && !situaciones.includes(situacion) ? [situacion, ...situaciones] : situaciones;

    if (cargando) {
        return (
            <main className="min-h-screen bg-[#ac97ff] px-5 py-10 font-sans text-[#21175c]">
                <div className="mx-auto max-w-3xl rounded-2xl bg-[#f5f2ff] p-6 shadow-xl sm:p-9">
                    <p className="text-center font-semibold">Cargando...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#ac97ff] px-5 py-10 font-sans text-[#21175c]">
            <div className="mx-auto max-w-3xl rounded-2xl bg-[#f5f2ff] p-6 shadow-xl sm:p-9">
                <h1 className="mb-10 text-center text-3xl font-bold text-[#0d0074] sm:text-4xl">
                    {editando ? "Editar borrador" : "Crea tu Alibi"}
                </h1>

                <label htmlFor="titulo" className={claseTitulo + " block"}>Título</label>
                <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título de tu Alibi" maxLength={100} className={claseInput} />

                <label htmlFor="situacion" className={claseTitulo + " block"}>Situación</label>
                <select id="situacion" value={situacion} onChange={(e) => setSituacion(e.target.value)} className={claseInput}>
                    <option value="">Selecciona una situación</option>
                    {opcionesSituacion.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {situaciones.length === 0 && (
                    <p className="mt-1 text-sm text-gray-600">Aún no hay situaciones. Crea una en el Foro.</p>
                )}

                <label htmlFor="historia" className={claseTitulo + " block"}>Historia</label>
                <textarea id="historia" maxLength={500} value={historia} onChange={(e) => setHistoria(e.target.value)}
                    placeholder="Historia de tu Alibi. Máximo 500 caracteres" className={claseInput + " min-h-32 resize-y"} />
                <p className="mt-1 text-right text-sm text-gray-500">{historia.length} / 500 caracteres</p>

                <h2 className={claseTitulo}>Detalles clave (mínimo 3)</h2>
                <div className="flex flex-col gap-3">
                    {detalles.map((detalle, index) => (
                        <div key={index} className="flex gap-2">
                            <input type="text" value={detalle} onChange={(e) => cambiarDetalle(index, e.target.value)}
                                placeholder={`Detalle ${index + 1}`} className={claseInput} />
                            {index >= 3 && (
                                <button type="button" onClick={() => quitarDetalle(index)} className={claseBotonClaro}>Quitar</button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={agregarDetalle} className={claseBotonClaro + " mt-4"}>+ Agregar detalle</button>

                {!editando && (
                    <>
                        <h2 className={claseTitulo}>Testigos (opcional)</h2>
                        <div className="flex flex-wrap gap-2">
                            {usuarios.map((u) => (
                                <label key={u.alias} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">
                                    <input type="checkbox" checked={testigos.includes(u.alias)} onChange={() => alternarTestigo(u.alias)} />
                                    {u.alias}
                                </label>
                            ))}
                            {usuarios.length === 0 && <p className="text-sm text-gray-500">No hay otros usuarios disponibles.</p>}
                        </div>
                    </>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button type="button" disabled={guardando} onClick={() => guardar("Draft")} className={claseBoton}>
                        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar borrador"}
                    </button>
                    <button type="button" disabled={guardando} onClick={() => guardar("Submitted")} className={claseBoton}>
                        {editando ? "Guardar y enviar" : "Enviar Alibi"}
                    </button>
                    {editando && (
                        <button type="button" disabled={guardando} onClick={() => navegar("/coartadas")} className={claseBotonClaro}>
                            Cancelar
                        </button>
                    )}
                </div>

                {mensaje.texto && (
                    <div role={mensaje.tipo === "error" ? "alert" : "status"} className={`mt-5 rounded-lg p-3 font-bold ${estilosMensaje[mensaje.tipo]}`}>
                        {mensaje.texto}
                    </div>
                )}
            </div>
        </main>
    );
}

export default CreateAlibi;