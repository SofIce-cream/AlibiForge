import { useState } from "react";
import { tagsDefault } from "./TagSystem";
import { obtenerCoartadas, guardarCoartadas } from "./coartadas";
import { puedeCrearCoartada } from "../utils/usuarios";

//Mini nota: hay algunas cosas que dependen de codigo de la otra rama (usuario y coartadas) no estan juntas por comodidad al hacer codigo pero si deseas que funcione quita los comentarios en estas :D

function CreateAlibi() {
    //Estados
    const [titulo, setTitulo] = useState("");
    const [situacion, setSituacion] = useState("");
    const [tags, setTags] = useState(tagsDefault);
    const [historia, setHistoria] = useState("");
    const [detalles, setDetalles] = useState(["","",""]);
    const [estado, setEstado] = useState("");
    const [mensaje, setMensaje] = useState({texto: "",tipo: "" });

    //Mockdata para usuario
    const usuarios = [
        { id: 1, alias: "ShadowHuntress" },
        { id: 2, alias: "TomatoSoup" },
        { id: 3, alias: "Urfear" },
        { id: 4, alias: "Cowfarm" },
        { id: 5, alias: "404error" }
    ];

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
    function crearAlibi(nuevoEstado) {
        const detallesLlenos = detalles.map((detalle) => detalle.trim()).filter((detalle) => detalle !== "");


        //Usuario con sesión iniciada (si no hay, se usa el mock de antes)
        const aliasActual = localStorage.getItem("usuarioActual");
        if (aliasActual && !puedeCrearCoartada(aliasActual)) {
            mostrarMensaje("Estás bloqueado: no puedes crear coartadas todavía.", "error");
            return;
        }

        //Validación
        if (!titulo || !situacion || !historia) {
            mostrarMensaje("Por favor, completar todos los campos requeridos.", "error");
            return;
        }

        if (detallesLlenos.length < 3) {
            mostrarMensaje(
                "La coartada debe tener al menos 3 detalles.",
                "error"
            );
            return;
        }

        //Coartadas
        const coartadas = obtenerCoartadas();

        const nuevaCoartda = {
            id: Date.now(),
            titulo: titulo,
            situacion: situacion,
            historia: historia,
            detalles: detallesLlenos,
            testigos: [],
            estado: nuevoEstado,
            autor: aliasActual || "ShadowHuntress",
            votos: [],
            marcasFalsas: [],
            expuesta: false
        };

        //Agregar la coartada creada
        coartadas.push(nuevaCoartda);
        guardarCoartadas(coartadas);
        setEstado(nuevoEstado);
        console.log("Coartada guardad:", nuevaCoartda)

        //Estado
        if (nuevoEstado === "Draft") {
            mostrarMensaje("Alibi guardado como borrador.", "exito");
        }

        if (nuevoEstado === "Submitted") {
            mostrarMensaje("Alibi enviado a revisión.", "exito");
            setTimeout(() => {setEstado("UnderReview");
                mostrarMensaje("🔍 Tu Alibi ahora está en revisión.", "revision");
            }, 3000);
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

