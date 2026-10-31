import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil } from "../api";
import { useAuth } from "../context/AuthContext";
import Mensaje from "../components/Mensaje";

function Perfil() {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState("");
    const { logout } = useAuth();
    const navegar = useNavigate();

    useEffect(() => {
        obtenerPerfil()
            .then(setUsuario)
            .catch((e) => setError(e.message));
    }, []);

    function salir() {
        logout();
        navegar("/");
    }

    if (error) {
        return (
            <main>
                <h2>Mi perfil</h2>
                <Mensaje texto={error} tipo="error" />
            </main>
        );
    }

    if (!usuario) {
        return (
            <main>
                <h2>Mi perfil</h2>
                <p className="cargando">Cargando perfil...</p>
            </main>
        );
    }

    const bloqueadoHasta = usuario.bloqueadoHasta ? new Date(usuario.bloqueadoHasta).getTime() : null;
    const estaBloqueado = bloqueadoHasta && Date.now() < bloqueadoHasta;

    return (
        <main>
            <h2>Mi perfil</h2>
            <section>
                <p><strong>Alias:</strong> {usuario.alias}</p>
                <p><strong>Rol:</strong> {usuario.role === "admin" ? "Administrador" : "Usuario"}</p>
                <p><strong>Especialidad:</strong> {usuario.especialidad}</p>
                <p><strong>Gremio:</strong> {usuario.gremio ? usuario.gremio.nombre : "Sin gremio"}</p>
                <p><strong>Credibilidad:</strong> {usuario.credibilidad} puntos</p>

                {estaBloqueado && (
                    <p className="bloqueado">
                        No puedes crear coartadas hasta el {new Date(bloqueadoHasta).toLocaleDateString()}
                    </p>
                )}
            </section>

            <button className="btn-secundario" onClick={salir}>Cerrar sesión</button>
        </main>
    );
}

export default Perfil;
