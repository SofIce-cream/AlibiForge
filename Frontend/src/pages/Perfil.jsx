
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil, haySesion, cerrarSesion as limpiarSesion } from "../api";

function Perfil() {
    // Empezamos con "null" porque todavía no sabemos quién es el usuario
    const [usuario, setUsuario] = useState(null);
    const navegar = useNavigate();

    // Arreglo vacio para que se ejecute una sola vez 
    useEffect(function () {
        if (!haySesion()) {
            navegar("/");
            return;
        }

        obtenerPerfil()
            .then(setUsuario)
            .catch(function () {
                limpiarSesion();
                navegar("/");
            });
    }, []);

    function cerrarSesion() {
        limpiarSesion();
        navegar("/");
    }

   
    if (!usuario) {
        return null;
    }

    const bloqueadoHasta = usuario.bloqueadoHasta ? new Date(usuario.bloqueadoHasta).getTime() : null;
    const estaBloqueado = bloqueadoHasta && Date.now() < bloqueadoHasta;

    return (
        <main>
            <h2>Mi perfil</h2>
            <section>
                <p><strong>Alias:</strong> {usuario.alias}</p>
                <p><strong>Especialidad:</strong> {usuario.especialidad}</p>
                <p><strong>Gremio:</strong> {usuario.gremio ? usuario.gremio.nombre : "Sin gremio"}</p>
                <p><strong>Credibilidad:</strong> {usuario.credibilidad} puntos</p>

                {estaBloqueado && (
                    <p className="bloqueado">
                         No puedes crear coartadas hasta el{" "}
                        {new Date(bloqueadoHasta).toLocaleDateString()}
                    </p>
                )}
            </section>

            <button onClick={cerrarSesion}>Cerrar sesión</button>
        </main>
    );
}

export default Perfil;
