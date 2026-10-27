import { useState } from "react";
import { calcularIndiceCredibilidad } from "../Almacenamiento/coartadas";
 
// "presta" coartadas
function TarjetaCoartada({ coartada, aliasActual, onVotar, onTestigo, onDesertar, onMarcarFalsa, onCambiarEstado }) {
 
    const [credibilidad, setCredibilidad] = useState(3);
    const [creatividad, setCreatividad] = useState(3);
    const [consistencia, setConsistencia] = useState(3);
 
    const indice = coartada.indice !== undefined ? coartada.indice : calcularIndiceCredibilidad(coartada);
    const transiciones = coartada.transiciones || [];
    const yaVoto = coartada.votos.some(function (v){
        return v.usuario === aliasActual;
    }); 
 
    function manejarVotar() {
        onVotar(coartada.id, {
            credibilidad: Number(credibilidad),
            creatividad: Number(creatividad),
            consistencia: Number(consistencia)
        });
    }
 
    return (
        <div className="tarjeta-coartada">
            <h3>{coartada.titulo}</h3>
            <p><strong>Situación:</strong> {coartada.situacion}</p>
            <p>{coartada.historia}</p>
            <p><strong>Detalles clave:</strong> {coartada.detalles.join(", ")}</p>
            <p><strong>Autor:</strong> {coartada.autor}</p>
            <p><strong>Estado:</strong> {coartada.estado}</p>
            <p><strong>Testigos:</strong> {coartada.testigos.length}{coartada.testigos.length > 0 && `(${coartada.testigos.join(", ")})`}</p>
 
            {/* solo si la coartada fue marcada falsa */}
            {coartada.expuesta && (
                <p className="aviso-expuesta">
                    Esta coartada fue marcada como FALSA por la comunidad.
                </p>
            )}
 
            <p className="indice"><strong>Índice de Credibilidad: {indice}</strong></p>
 
            <div className="votar">
                <label>
                    Credibilidad:
                    <select value={credibilidad} onChange={(e) => setCredibilidad(e.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </label>
 
                <label>
                    Creatividad:
                    <select value={creatividad} onChange={(e) => setCreatividad(e.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </label>
 
                <label>
                    Consistencia:
                    <select value={consistencia} onChange={(e) => setConsistencia(e.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </label>
 
                <button onClick={manejarVotar} disabled={yaVoto}>{yaVoto ? "Ya votaste" : "Votar"}</button>
                <button onClick={() => onTestigo(coartada.id)}>Ser testigo</button>
                <button onClick={() => onDesertar(coartada.id)}>Desertar</button>
                <button onClick={() => onMarcarFalsa(coartada.id)}>Marcar como falsa</button>
                {transiciones.map(function(estado){
                    return(
                        <button key = {estado} onClick= {() => onCambiarEstado(coartada.id, estado)}>
                            Pasar a {estado}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
 
export default TarjetaCoartada;
