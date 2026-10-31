import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Mensaje from "../components/Mensaje";

function Login() {
    const [alias, setAlias] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();
    const navegar = useNavigate();

    async function manejarSubmit(evento) {
        evento.preventDefault();
        setError("");

        if (alias.trim().length < 3) {
            setError("El alias debe tener al menos 3 caracteres.");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setCargando(true);
        try {
            await login(alias.trim(), password);
            navegar("/perfil");
        } catch (e) {
            setError(e.message);
            setCargando(false);
        }
    }

    return (
        <main>
            <h2>Iniciar sesión</h2>
            <form onSubmit={manejarSubmit}>
                <p>
                    <label htmlFor="alias">Alias:</label><br />
                    <input id="alias" type="text" value={alias} onChange={(e) => setAlias(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="password">Contraseña:</label><br />
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </p>
                <button type="submit" disabled={cargando}>{cargando ? "Entrando..." : "Entrar"}</button>
            </form>

            {cargando && (
                <p className="cargando">Si el servidor estaba dormido, la primera vez puede tardar hasta un minuto.</p>
            )}
            <Mensaje texto={error} tipo="error" />

            <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </main>
    );
}

export default Login;