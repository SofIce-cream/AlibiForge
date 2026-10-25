
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerUsuarios } from "../utils/usuarios";

function Perfil() {
    // Empezamos con "null" porque todavía no sabemos quién es el usuario
    const [usuario, setUsuario] = useState(null);
    const navegar = useNavigate();

    // Arreglo vacio para que se ejecute una sola vez 
    useEffect(function () {
        const aliasActual = localStorage.getItem("usuarioActual");

        if (!aliasActual) {
            navegar("/"); // sin sesion mandamos al login
            return;
        }

        const usuarios = obtenerUsuarios();
        const encontrado = usuarios.find(function (u) {
            return u.alias === aliasActual;
        });

        setUsuario(encontrado); // guardamos el usuario en el estado
    }, []);

    function cerrarSesion() {
        localStorage.removeItem("usuarioActual");
        navegar("/");
    }

   
    if (!usuario) {
        return null;
    }

    const estaBloqueado = usuario.bloqueadoHasta && Date.now() < usuario.bloqueadoHasta;

    return (
        <main>
            <h2>Mi perfil</h2>
            <section>
                <p><strong>Alias:</strong> {usuario.alias}</p>
                <p><strong>Especialidad:</strong> {usuario.especialidad}</p>
                <p><strong>Credibilidad:</strong> {usuario.credibilidad} puntos</p>

                {estaBloqueado && (
                    <p className="bloqueado">
                         No puedes crear coartadas hasta el{" "}
                        {new Date(usuario.bloqueadoHasta).toLocaleDateString()}
                    </p>
                )}
            </section>

            <button onClick={cerrarSesion}>Cerrar sesión</button>
        </main>
    );
}

export default Perfil;
