import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    iniciarSesion,
    cerrarSesion as limpiarSesion,
    haySesion,
    obtenerAliasActual,
    obtenerRolActual,
    EVENTO_SESION_EXPIRADA
} from "../api";

const AuthContext = createContext(null);

// Lee la sesión guardada (si existe) al abrir la app
function leerSesion() {
    if (!haySesion()) return null;
    return { alias: obtenerAliasActual(), role: obtenerRolActual() || "user" };
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(leerSesion);

    // Si el interceptor detecta un token vencido, la UI se entera y saca al usuario
    useEffect(() => {
        const alExpirar = () => setUsuario(null);
        window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
        return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    }, []);

    const login = useCallback(async (alias, password) => {
        const datos = await iniciarSesion(alias, password);
        setUsuario({ alias: datos.alias, role: datos.role || "user" });
        return datos;
    }, []);

    const logout = useCallback(() => {
        limpiarSesion();
        setUsuario(null);
    }, []);

    const valor = {
        usuario,
        autenticado: Boolean(usuario),
        esAdmin: Boolean(usuario) && usuario.role === "admin",
        login,
        logout
    };

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return contexto;
}