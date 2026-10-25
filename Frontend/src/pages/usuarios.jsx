// ¡Eliminar comentarios para funcionalidad del codigo!
import { useState } from "react";
import { calcularIndiceCredibilidad } from "./coartadas";
 
// "presta" coartadas
function TarjetaCoartada({ coartada, onVotar, onTestigo, onDesertar, onMarcarFalsa }) {
 
    const [credibilidad, setCredibilidad] = useState(3);
    const [creatividad, setCreatividad] = useState(3);
    const [consistencia, setConsistencia] = useState(3);
 
    const indice = calcularIndiceCredibilidad(coartada);
 
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
            <p><strong>Testigos:</strong> {coartada.testigos.length}</p>
 
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
 
                <button onClick={manejarVotar}>Votar</button>
                <button onClick={() => onTestigo(coartada.id)}>Ser testigo</button>
                <button onClick={() => onDesertar(coartada.id)}>Desertar</button>
                <button onClick={() => onMarcarFalsa(coartada.id)}>Marcar como falsa</button>
            </div>
        </div>
    );
}
 
export default TarjetaCoartada;

export function modificarCredibilidad(alias, puntos) {
    // Lógica para actualizar la credibilidad del usuario
    console.log(`Credibilidad de ${alias} modificada en ${puntos} puntos.`);
}