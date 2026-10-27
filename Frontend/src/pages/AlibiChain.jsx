import { useState, useEffect } from "react";
import { obtenerCoartadas, unirseComoTestigo, desertarDeLaCadena, obtenerAliasActual } from "../api";

// Estados en los que una coartada admite testigos (no borradores ni rechazadas)
const ESTADOS_CON_CADENA = ["Submitted", "UnderReview", "Approved"];

function AlibiChain() {
    const [coartadas, setCoartadas] = useState([]);
    const [idCoartada, setIdCoartada] = useState("");
    const [mensaje, setMensaje] = useState("");

    // El usuario es el de la sesión iniciada
    const alias = obtenerAliasActual() || "";

    async function cargarCoartadas() {
        try {
            const lista = await obtenerCoartadas();
            setCoartadas(lista.filter((coartada) => ESTADOS_CON_CADENA.includes(coartada.estado)));
        } catch (error) {
            setMensaje(error.message);
        }
    }

    useEffect(() => {
        cargarCoartadas();
    }, []);

    async function unirse() {
        if (!alias || !idCoartada) {
            setMensaje("Selecciona una coartada (y inicia sesión).");
            return;
        }

        const coartada = coartadas.find((coartada) => coartada.id === idCoartada);

        if (!coartada) {
            setMensaje("No se encontró la coartada.");
            return;
        }

        if (coartada.autor === alias) {
            setMensaje("El autor no puede ser testigo de su propia coartada.");
            return;
        }

        try {
            await unirseComoTestigo(idCoartada);
            setMensaje(`${alias} ahora es testigo de la coartada.`);
            await cargarCoartadas();
        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function desertar(id) {
        try {
            await desertarDeLaCadena(id);
            setMensaje(`${alias} abandonó la Alibi Chain.`);
            await cargarCoartadas();
        } catch (error) {
            setMensaje(error.message);
        }
    }

    return (
        <main className="min-h-screen bg-[#ac97ff] px-5 py-10 font-sans text-[#21175c]">
            <div className="mx-auto max-w-3xl rounded-2xl bg-[#f5f2ff] p-6 shadow-xl sm:p-9">
                <h1 className="mb-8 text-center text-3xl font-bold text-[#0d0074]">Alibi Chain</h1>
                <h2 className="mb-2 text-xl font-semibold text-[#37288a]">Usuario</h2>
                <p className="mb-6 rounded-lg border-2 border-[#8e7bdc] bg-white p-3">{alias || "Inicia sesión para unirte a una cadena"}</p>
                <select value={alias} onChange={(e) => setAlias(e.target.value)} className="mb-6 w-full
                 rounded-lg border-2 border-[#8e7bdc] bg-white p-3">
                <option value="">Selecciona tu usuario</option>
                {usuarios.map((usuario) => (<option key={usuario.id} value={usuario.alias}>{usuario.alias}</option>))}
                </select>
                <h2 className="mb-2 text-xl font-semibold text-[#37288a]">Coartada</h2>
                
                <select value={idCoartada} onChange={(e) => setIdCoartada(e.target.value)} className="mb-6 w-full
                 rounded-lg border-2 border-[#8e7bdc] bg-white p-3">
                    <option value="">Selecciona una coartada</option>

                    {coartadas.filter((coartada) => coartada.estado === "Submitted").map((coartada) => 
                        (<option key={coartada.id} value={coartada.id}> {coartada.titulo} </option>))}
                </select>

                <button type="button" onClick={unirse} className="rounded-lg bg-[#0d0074] px-5 py-3 font-bold text-white"> 
                    Unirse como testigo </button>

                {mensaje && ( <p className="mt-5 rounded-lg bg-[#e8e2ff] p-3 font-semibold"> {mensaje} </p>)}

                <div className="mt-8">
                {coartadas.filter((coartada) => coartada.estado === "Submitted").map((coartada) => (
                            <div key={coartada.id} className="mb-4 rounded-lg bg-white p-5 shadow-sm">
                                <h3 className="text-lg font-bold text-[#37288a]">{coartada.titulo}</h3>
                                <p className="mt-2">Autor: {coartada.autor}</p>
                                <p className="mt-2">Testigos: {coartada.testigos.length}</p>
                                {coartada.testigos.length > 0 && (
                                    <ul className="mt-2 list-disc pl-5">{coartada.testigos.map((testigo) => (<li key={testigo}> {testigo}
                                    {testigo === alias && (<button type="button" onClick={() => desertar(coartada.id)}
                                    className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">Desertar</button>)}</li>))}
                                    </ul>)}
                            </div>))}
                </div>
            </div>
        </main>
    );
}

export default AlibiChain;
