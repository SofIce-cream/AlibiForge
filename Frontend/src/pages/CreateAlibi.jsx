import { useState, useEffect } from "react";
import { tagsDefault } from "./TagSystem";
import { crearCoartada, obtenerSituaciones, obtenerAliasUsuarios, obtenerAliasActual } from "../api";

function CreateAlibi() {
    //Estados
    const [titulo, setTitulo] = useState("");
    const [situacion, setSituacion] = useState("");
    const [tags, setTags] = useState(tagsDefault);
    const [historia, setHistoria] = useState("");
    const [detalles, setDetalles] = useState(["","",""]);
    const [estado, setEstado] = useState("");
    const [mensaje, setMensaje] = useState({texto: "",tipo: "" });
    const [testigos, setTestigos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    //Situaciones (foro) y usuarios que pueden ser testigos, desde el backend
    useEffect(() => {
        obtenerSituaciones()
            .then((situaciones) => {
                if (situaciones.length > 0) {
                    setTags(situaciones.map((s) => ({ Id: s._id, nombre: s.titulo })));
                }
            })
            .catch(() => {});

        const aliasActual = obtenerAliasActual();
        obtenerAliasUsuarios()
            .then((lista) => setUsuarios(lista.filter((u) => u.alias !== aliasActual)))
            .catch(() => {});
    }, []);

    function alternarTestigo(alias) {
        if (testigos.includes(alias)) {
            setTestigos(testigos.filter((t) => t !== alias));
        } else {
            setTestigos([...testigos, alias]);
        }
    }

    //Detalles
    function agregarDetalle() {
        setDetalles([...detalles,""]);
    }

    function cambiarDetalle(index, valor) {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = valor;
        setDetalles(nuevosDetalles);
    }

        //Crear Alibi
    async function crearAlibi(nuevoEstado) {
        const detallesLlenos = detalles.map((detalle) => detalle.trim()).filter((detalle) => detalle !== "");

        //Validación
        if (!titulo || !situacion || !historia) {
            mostrarMensaje("Por favor, completar todos los campos requeridos.", "error");
            return;
        }

        if (detallesLlenos.length < 3) {
            mostrarMensaje("La coartada debe tener al menos 3 detalles.", "error");
            return;
        }

        //El backend valida el bloqueo (credibilidad < 0), los estados y los testigos
        try {
            const nueva = await crearCoartada({
                titulo: titulo,
                situacion: situacion,
                historia: historia,
                detalles: detallesLlenos,
                testigos: testigos,
                estado: nuevoEstado
            });

            setEstado(nueva.estado);

            if (nueva.estado === "Draft") {
                mostrarMensaje("Alibi guardado como borrador.", "exito");
            } else {
                mostrarMensaje("Alibi enviado a revisión.", "exito");
            }

            //Limpiar el formulario
            setTitulo("");
            setSituacion("");
            setHistoria("");
            setDetalles(["", "", ""]);
            setTestigos([]);
        } catch (error) {
            mostrarMensaje(error.message, "error");
        }
    }

    //Mensajes
    function mostrarMensaje(texto, tipo) {
        setMensaje({texto, tipo});
        setTimeout(() => {setMensaje({texto: "", tipo: ""});
        }, 3000);
    }

    /*✧Estilo ✧*/
    const estilosMensaje = {
    error: "bg-red-100 text-red-700 border border-red-300",
    exito: "bg-green-100 text-green-700 border border-green-300",
    revision: "bg-yellow-100 text-yellow-700 border border-yellow-300"
    };
    return ( 
    <main className="min-h-screen bg-[#ac97ff] px-5 py-10 font-sans text-[#21175c]"> 
    <div className="mx-auto max-w-3xl rounded-2xl bg-[#f5f2ff] p-6 shadow-xl sm:p-9"> 
        <h1 className="mb-10 text-center text-3xl font-bold text-[#0d0074] sm:text-4xl"> Crea tu Alibi </h1> 
        
        {/* TÍTULO */} 
        <h2 className="mb-2 mt-6 text-xl font-semibold text-[#37288a]"> Título </h2>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}  
          placeholder="Título de tu Alibi" className="w-full rounded-lg border-2 border-[#8e7bdc]  
          bg-white p-3 text-[#21175c] outline-none transition focus:border-[#0d0074] focus:ring-2 focus:ring-[#c9c0ff]" /> 
        
        {/* SITUACIÓN */}
        <h2 className="mb-2 mt-6 text-xl font-semibold text-[#37288a]">Situación</h2>
        <select value={situacion}onChange={(e) => setSituacion(e.target.value)} className="w-full rounded-lg border-2 border-[#8e7bdc] bg-white p-3  
        text-[#21175c] outline-none transition focus:border-[#0d0074] focus:ring-2 focus:ring-[#c9c0ff]">
        <option value="">Selecciona una situación</option>
        {tags.map((tag) => (<option key={tag.Id} value={tag.nombre}>{tag.nombre}</option>))}</select>
        
        {/* HISTORIA */} 
        <h2 className="mb-2 mt-6 text-xl font-semibold text-[#37288a]"> Historia </h2> 
        <textarea maxLength={500} value={historia} onChange={(e) => setHistoria(e.target.value)}
            placeholder="Historia de tu Alibi. Máximo 500 caracteres" className="min-h-32 w-full resize-y rounded-lg border-2 border-[#8e7bdc]  
            bg-white p-3 text-[#21175c] outline-none transition focus:border-[#0d0074] focus:ring-2 focus:ring-[#c9c0ff]" />
        <p className="mt-1 text-right text-sm text-gray-500"> {historia.length} / 500 caracteres </p> 
        
        {/* DETALLES */} 
        <h2 className="mb-2 mt-6 text-xl font-semibold text-[#37288a]"> Detalles clave </h2> 
        <div className="flex flex-col gap-3"> {detalles.map((detalle, index) => ( <input key={index} type="text" 
            value={detalle} onChange={(e) => cambiarDetalle(index, e.target.value) }
            placeholder={ index < 3 ? `Detalle ${index + 1}` : "Ingrese un detalle" } 
            className="w-full rounded-lg border-2 border-[#8e7bdc] bg-white p-3 text-[#21175c] outline-none transition focus:border-[#0d0074] 
            focus:ring-2 focus:ring-[#c9c0ff]" /> ))} </div>
        <button type="button" onClick={agregarDetalle} className="mt-4 rounded-lg bg-[#ded6ff] px-5 py-3 font-bold text-[#21175c] transition 
            hover:-translate-y-0.5 hover:bg-[#ccc1ff] active:translate-y-0" > + Agregar detalle </button> 
        
        {/* TESTIGOS */}
        <h2 className="mb-2 mt-6 text-xl font-semibold text-[#37288a]"> Testigos (opcional) </h2>
        <div className="flex flex-wrap gap-2">
            {usuarios.map((u) => (
                <label key={u.alias} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">
                    <input type="checkbox" checked={testigos.includes(u.alias)} onChange={() => alternarTestigo(u.alias)} />
                    {u.alias}
                </label>
            ))}
            {usuarios.length === 0 && <p className="text-sm text-gray-500">No hay otros usuarios disponibles.</p>}
        </div>

        {/* BOTONES */} 
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"> 
        <button type="button" onClick={() => crearAlibi("Draft")}
        className="rounded-lg bg-[#0d0074] px-[18px] py-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1600a0] active:translate-y-0" > 
        Guardar borrador </button> <button type="button" onClick={() => crearAlibi("Submitted")} className="rounded-lg bg-[#0d0074] px-[18px] py-[11px] font-bold 
        text-white transition hover:-translate-y-0.5 hover:bg-[#1600a0] active:translate-y-0" > Enviar Alibi </button> </div> 
                                      
        {/* MENSAJES */} 
        {mensaje.texto && ( <div className={`mt-5 rounded-lg p-3 font-bold ${ estilosMensaje[mensaje.tipo] }`} >
             {mensaje.texto} </div> )} 
        {/* ESTADO */} 
        {estado && ( <div className="mt-5 rounded-lg bg-white p-3 shadow-sm"> Estado actual: {" "}
        <strong className="text-[#0d0074]"> {estado} </strong> </div> )} </div> </main> ); 
}
    
export default CreateAlibi;

