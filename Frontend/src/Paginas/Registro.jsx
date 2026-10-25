import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { obtenerUsuarios, guardarUsuarios } from "../Almacenamiento/usuarios";

function Registro() {

    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [especialidad, setEspecialidad] = useState("Excusa Creativa");
    const [mensaje, setMensaje] = useState("");

    const navegar = useNavigate();

    function manejarSubmit(evento) {
        evento.preventDefault();

        const usuarios = obtenerUsuarios();

        const yaExiste = usuarios.some(function (usuario) {
            return usuario.alias === alias;
        });

        if (yaExiste) {
            setMensaje("Ese alias ya está en uso, elige otro.");
            return;
        }

        const nuevoUsuario = {
            alias: alias,
            password: password,
            especialidad: especialidad,
            credibilidad: 0
        };

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);

        setMensaje("¡Cuenta creada! Ya puedes iniciar sesión.");

        setTimeout(function () {
            navegar("/");
        }, 1000);
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
                <button type="submit">Registrarme</button>
            </form>

            <p>{mensaje}</p>

            <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
        </main>
    );
}

export default Registro;
