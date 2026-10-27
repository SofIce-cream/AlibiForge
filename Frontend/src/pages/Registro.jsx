import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario, obtenerGremios } from "../api";

function Registro() {

    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [especialidad, setEspecialidad] = useState("Excusa Creativa");
    const [gremio, setGremio] = useState("");
    const [gremios, setGremios] = useState([]);
    const [mensaje, setMensaje] = useState("");

    const navegar = useNavigate();

    // Cargamos los gremios disponibles desde el backend
    useEffect(function () {
        obtenerGremios()
            .then(setGremios)
            .catch(function () {
                setGremios([]);
            });
    }, []);

    async function manejarSubmit(evento) {
        evento.preventDefault();

        try {
            await registrarUsuario({ alias, password, especialidad, gremio });
            setMensaje("¡Cuenta creada! Ya puedes iniciar sesión.");

            setTimeout(function () {
                navegar("/");
            }, 1000);
        } catch (error) {
            setMensaje(error.message);
        }
    }

    // Input controlados
    return (
        <main>
            <h2>Crear cuenta</h2>
            <form onSubmit={manejarSubmit}>
                <p>
                    <label>Alias:</label><br />
                    <input
                        type="text"
                        value={alias}
                        onChange={(evento) => setAlias(evento.target.value)}
                        required
                    />
                </p>
                <p>
                    <label>Contraseña:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(evento) => setPassword(evento.target.value)}
                        required
                    />
                </p>
                <p>
                    <label>Especialidad:</label><br />
                    <select
                        value={especialidad}
                        onChange={(evento) => setEspecialidad(evento.target.value)}
                    >
                        <option value="Excusa Creativa">Excusa Creativa</option>
                        <option value="Detallista">Detallista</option>
                        <option value="Improvisador">Improvisador</option>
                        <option value="Conspirador">Conspirador</option>
                    </select>
                </p>
                <p>
                    <label>Gremio:</label><br />
                    <select
                        value={gremio}
                        onChange={(evento) => setGremio(evento.target.value)}
                    >
                        <option value="">Sin gremio</option>
                        {gremios.map(function (g) {
                            return <option key={g._id} value={g._id}>{g.nombre}</option>;
                        })}
                    </select>
                </p>
                <button type="submit">Registrarme</button>
            </form>

            <p>{mensaje}</p>

            <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
        </main>
    );
}

export default Registro;