// Mensaje en pantalla, tipo: "error" | "ok" | "info"
function Mensaje({ texto, tipo = "info" }) {
    if (!texto) return null;
    return (
        <p className={`mensaje mensaje-${tipo}`} role={tipo === "error" ? "alert" : "status"}>
            {texto}
        </p>
    );
}

export default Mensaje;