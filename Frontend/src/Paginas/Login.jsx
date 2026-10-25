
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { obtenerUsuarios } from "../Almacenamiento/usuarios";

function Login() {
    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const navegar = useNavigate();

    function manejarSubmit(evento) {
        evento.preventDefault();

        const usuarios = obtenerUsuarios();

        const usuarioEncontrado = usuarios.find(function (usuario) {
            return usuario.alias === alias && usuario.password === password;
        });

        if (!usuarioEncontrado) {
            setMensaje("Alias o contraseña incorrectos.");
            return;
        }

        localStorage.setItem("usuarioActual", alias);
        navegar("/perfil");
    }

    return (
        <main>
            <h2>Iniciar sesión</h2>
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
                <button type="submit">Entrar</button>
            </form>

            <p>{mensaje}</p>

            <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </main>
    );
}

export default Login;
