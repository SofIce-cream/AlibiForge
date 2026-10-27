import { useState, useEffect } from "react";
import { obtenerRankings } from "../api";

const TABLAS = [
    { clave: "masterDeceit", titulo: "Master of Deceit", descripcion: "Mayor credibilidad promedio", unidad: "pts" },
    { clave: "mostCreative", titulo: "Most Creative", descripcion: "Mayor creatividad promedio", unidad: "/ 5" },
    { clave: "mostConsistent", titulo: "Most Consistent", descripcion: "Mayor consistencia promedio", unidad: "/ 5" },
    { clave: "mostWanted", titulo: "Most Wanted", descripcion: "Más coartadas creadas", unidad: "coartadas" }
];

function Rankings() {
    const [rankings, setRankings] = useState(null);
    const [mensaje, setMensaje] = useState("");

    useEffect(function () {
        obtenerRankings()
            .then(setRankings)
            .catch(function (error) {
                setMensaje(error.message);
            });
    }, []);

    return (
        <main>
            <h2>Maestros del engaño</h2>

            {mensaje && <p>{mensaje}</p>}
            {!rankings && !mensaje && <p>Cargando rankings...</p>}

            {rankings && TABLAS.map(function (tabla) {
                const filas = rankings[tabla.clave] || [];
                return (
                    <section key={tabla.clave}>
                        <h3>{tabla.titulo}</h3>
                        <p className="ranking-descripcion">{tabla.descripcion}</p>
                        {filas.length === 0 && <p>Aún no hay datos.</p>}
                        <ol className="ranking-lista">
                            {filas.slice(0, 10).map(function (fila) {
                                return (
                                    <li key={fila.autor}>
                                        <span>{fila.autor}</span>
                                        <strong>{fila.puntos} {tabla.unidad}</strong>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                );
            })}
        </main>
    );
}

export default Rankings;