import { useState, useEffect } from "react";
import { obtenerRankings } from "../api";
import Mensaje from "../components/Mensaje";

const TABLAS = [
    { clave: "masterDeceit", titulo: "Master of Deceit", descripcion: "Mayor credibilidad promedio", unidad: "pts" },
    { clave: "mostCreative", titulo: "Most Creative", descripcion: "Mayor creatividad promedio", unidad: "/ 5" },
    { clave: "mostConsistent", titulo: "Most Consistent", descripcion: "Mayor consistencia promedio", unidad: "/ 5" },
    { clave: "mostWanted", titulo: "Most Wanted", descripcion: "Más coartadas creadas", unidad: "coartadas" }
];

function Rankings() {
    const [rankings, setRankings] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerRankings()
            .then(setRankings)
            .catch((e) => setError(e.message));
    }, []);

    return (
        <main className="pagina-ancha">
            <h2>Maestros del engaño</h2>

            <Mensaje texto={error} tipo="error" />
            {!rankings && !error && <p className="cargando">Cargando rankings...</p>}

            {rankings && TABLAS.map((tabla) => {
                const filas = rankings[tabla.clave] || [];
                return (
                    <section key={tabla.clave}>
                        <h3>{tabla.titulo}</h3>
                        <p className="ranking-descripcion">{tabla.descripcion}</p>
                        {filas.length === 0 && <p>Aún no hay datos.</p>}
                        <ol className="ranking-lista">
                            {filas.slice(0, 10).map((fila) => (
                                <li key={fila.autor}>
                                    <span>{fila.autor}</span>
                                    <strong>{fila.puntos} {tabla.unidad}</strong>
                                </li>
                            ))}
                        </ol>
                    </section>
                );
            })}
        </main>
    );
}

export default Rankings;