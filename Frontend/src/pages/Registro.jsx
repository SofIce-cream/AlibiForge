import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario, obtenerGremios } from "../api";
import Mensaje from "../components/Mensaje";

const ESPECIALIDADES = ["Excusa Creativa", "Detallista", "Improvisador", "Conspirador"];

function Registro() {
    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [especialidad, setEspecialidad] = useState(ESPECIALIDADES[0]);
    const [gremio, setGremio] = useState("");
    const [gremios, setGremios] = useState([]);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
    const [cargando, setCargando] = useState(false);

    const navegar = useNavigate();

    // Gremios disponibles desde el backend
    useEffect(() => {
        obtenerGremios()
            .then(setGremios)
            .catch(() => setGremios([]));
    }, []);

    async function manejarSubmit(evento) {
        evento.preventDefault();

        if (alias.trim().length < 3 || alias.trim().length > 30) {
            setMensaje({ texto: "El alias debe tener entre 3 y 30 caracteres.", tipo: "error" });
            return;
        }
        if (password.length < 6) {
            setMensaje({ texto: "La contraseña debe tener al menos 6 caracteres.", tipo: "error" });
            return;
        }

        setCargando(true);
        setMensaje({ texto: "", tipo: "info" });
        try {
            await registrarUsuario({ alias: alias.trim(), password, especialidad, gremio });
            setMensaje({ texto: "¡Cuenta creada! Te llevamos al inicio de sesión...", tipo: "ok" });
            setTimeout(() => navegar("/"), 1200);
        } catch (e) {
            setMensaje({ texto: e.message, tipo: "error" });
            setCargando(false);
        }
    }

    return (
        <main>
            <h2>Crear cuenta</h2>
            <form onSubmit={manejarSubmit}>
                <p>
                    <label htmlFor="alias">Alias:</label><br />
                    <input id="alias" type="text" value={alias} onChange={(e) => setAlias(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="password">Contraseña (mínimo 6 caracteres):</label><br />
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="especialidad">Especialidad:</label><br />
                    <select id="especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                        {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                </p>
                <p>
                    <label htmlFor="gremio">Gremio:</label><br />
                    <select id="gremio" value={gremio} onChange={(e) => setGremio(e.target.value)}>
                        <option value="">Sin gremio</option>
                        {gremios.map((g) => <option key={g._id} value={g._id}>{g.nombre}</option>)}
                    </select>
                </p>
                <button type="submit" disabled={cargando}>{cargando ? "Creando cuenta..." : "Registrarme"}</button>
            </form>

            <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

            <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
        </main>
    );
}

export default Registro;