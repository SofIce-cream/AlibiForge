import { useState } from "react";

const PUNTAJES = [1, 2, 3, 4, 5];

function SelectorPuntaje({ etiqueta, valor, onCambiar, deshabilitado }) {
    return (
        <label>
            {etiqueta}:
            <select value={valor} onChange={(e) => onCambiar(e.target.value)} disabled={deshabilitado}>
                {PUNTAJES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
        </label>
    );
}

function TarjetaCoartada({
    coartada,
    aliasActual,
    esAdmin,
    ocupado,
    onVotar,
    onTestigo,
    onDesertar,
    onMarcarFalsa,
    onCambiarEstado,
    onEditar,
    onEliminar
}) {
    const [credibilidad, setCredibilidad] = useState(3);
    const [creatividad, setCreatividad] = useState(3);
    const [consistencia, setConsistencia] = useState(3);

    const esAutor = coartada.autor === aliasActual;
    const esTestigo = coartada.testigos.includes(aliasActual);
    const yaVoto = coartada.votos.some((v) => v.usuario === aliasActual);
    const yaMarcoFalsa = coartada.marcasFalsas.includes(aliasActual);
    const esBorrador = coartada.estado === "Draft";
    const cerrada = coartada.estado === "Rejected";
    const transiciones = coartada.transiciones || [];

    const puedeVotar = !esAutor && !esBorrador && !yaVoto;
    const puedeSerTestigo = !esAutor && !esTestigo && !esBorrador && !cerrada;
    const puedeMarcarFalsa = !esAutor && !esBorrador && !yaMarcoFalsa && !coartada.expuesta;
    const puedeEditar = (esAutor || esAdmin) && esBorrador;
    const puedeEliminar = esAutor || esAdmin;

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
            <p><span className={`estado estado-${coartada.estado}`}>{coartada.estado}</span></p>
            <p><strong>Situación:</strong> {coartada.situacion}</p>
            <p>{coartada.historia}</p>
            <p><strong>Detalles clave:</strong> {coartada.detalles.join(", ")}</p>
            <p><strong>Autor:</strong> {coartada.autor}</p>
            <p>
                <strong>Testigos:</strong> {coartada.testigos.length}
                {coartada.testigos.length > 0 && ` (${coartada.testigos.join(", ")})`}
            </p>

            {coartada.expuesta && (
                <p className="aviso-expuesta">
                    Esta coartada fue marcada como FALSA por la comunidad.
                </p>
            )}

            <p className="indice"><strong>Índice de Credibilidad: {coartada.indice ?? 0}</strong></p>

            {coartada.versiones.length > 0 && (
                <details className="versiones">
                    <summary>Versiones anteriores ({coartada.versiones.length})</summary>
                    {coartada.versiones.map((v) => (
                        <div key={v.numero} className="version">
                            <strong>Versión {v.numero}: {v.titulo}</strong>
                            <p>{v.historia}</p>
                            <p><em>Detalles: {(v.detalles || []).join(", ")}</em></p>
                        </div>
                    ))}
                </details>
            )}

            <div className="votar">
                {puedeVotar && (
                    <>
                        <SelectorPuntaje etiqueta="Credibilidad" valor={credibilidad} onCambiar={setCredibilidad} deshabilitado={ocupado} />
                        <SelectorPuntaje etiqueta="Creatividad" valor={creatividad} onCambiar={setCreatividad} deshabilitado={ocupado} />
                        <SelectorPuntaje etiqueta="Consistencia" valor={consistencia} onCambiar={setConsistencia} deshabilitado={ocupado} />
                        <button onClick={manejarVotar} disabled={ocupado}>Votar</button>
                    </>
                )}
                {yaVoto && <button disabled>Ya votaste</button>}

                {puedeSerTestigo && (
                    <button className="btn-secundario" onClick={() => onTestigo(coartada.id)} disabled={ocupado}>Ser testigo</button>
                )}
                {esTestigo && (
                    <button className="btn-secundario" onClick={() => onDesertar(coartada.id)} disabled={ocupado}>Desertar</button>
                )}
                {puedeMarcarFalsa && (
                    <button className="btn-peligro" onClick={() => onMarcarFalsa(coartada.id)} disabled={ocupado}>Marcar como falsa</button>
                )}

                {transiciones.map((estado) => (
                    <button key={estado} className="btn-estado" onClick={() => onCambiarEstado(coartada.id, estado)} disabled={ocupado}>
                        Pasar a {estado}
                    </button>
                ))}

                {puedeEditar && (
                    <button className="btn-secundario" onClick={() => onEditar(coartada.id)} disabled={ocupado}>Editar borrador</button>
                )}
                {puedeEliminar && (
                    <button className="btn-peligro" onClick={() => onEliminar(coartada)} disabled={ocupado}>Eliminar</button>
                )}
            </div>
        </div>
    );
}

export default TarjetaCoartada;