import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// Sesión (almacenada en localStorage)
const CLAVE_TOKEN = "token";
const CLAVE_ALIAS = "usuarioActual";
const CLAVE_ROL = "rolActual";

// Evento que se dispara cuando el servidor responde 401 con un token guardado (sesión vencida)
export const EVENTO_SESION_EXPIRADA = "alibiforge:sesion-expirada";

export function obtenerToken() {
    return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerAliasActual() {
    return localStorage.getItem(CLAVE_ALIAS);
}

export function obtenerRolActual() {
    return localStorage.getItem(CLAVE_ROL);
}

export function guardarSesion(usuario, token) {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_ALIAS, usuario.alias);
    localStorage.setItem(CLAVE_ROL, usuario.role || "user");
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_ALIAS);
    localStorage.removeItem(CLAVE_ROL);
}

export function haySesion() {
    return Boolean(obtenerToken());
}

// Cliente HTTP (Axios) con interceptores
// El timeout es largo porque Render (plan gratis) puede tardar ~1 min en despertar.
const http = axios.create({
    baseURL: API_URL,
    timeout: 90000,
    headers: { "Content-Type": "application/json" }
});

// Interceptor de petición: adjunta el JWT en la cabecera Authorization
http.interceptors.request.use((config) => {
    const token = obtenerToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta: unifica los errores y cierra la sesión si el token ya no sirve
http.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
        if (!error.response) {
            const mensaje = error.code === "ECONNABORTED"
                ? "El servidor tardó demasiado en responder. Intenta de nuevo en unos segundos."
                : "No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.";
            return Promise.reject(new Error(mensaje));
        }

        const { status, data } = error.response;
        if (status === 401 && obtenerToken()) {
            cerrarSesion();
            window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
        }

        const err = new Error((data && data.error) || "Ocurrió un error inesperado");
        err.status = status;
        return Promise.reject(err);
    }
);

async function peticion(metodo, ruta, cuerpo) {
    const respuesta = await http.request({ method: metodo, url: ruta, data: cuerpo });
    return respuesta.data;
}

// Normalización
// El backend devuelve autor/testigos/votos poblados; los componentes usan alias e "id".
export function normalizarCoartada(c) {
    return {
        ...c,
        id: c._id,
        autor: c.autor ? c.autor.alias : "",
        especialidadAutor: c.autor ? c.autor.especialidad : "",
        testigos: (c.testigos || []).map((t) => t.alias),
        votos: (c.votos || []).map((v) => ({
            usuario: v.usuario ? v.usuario.alias : "",
            credibilidad: v.credibilidad,
            creatividad: v.creatividad,
            consistencia: v.consistencia
        })),
        marcasFalsas: (c.marcasFalsas || []).map((m) => m.alias),
        versiones: c.versiones || [],
        transiciones: c.transiciones || []
    };
}

// Autenticación y perfil
export async function registrarUsuario({ alias, password, especialidad, gremio }) {
    return await peticion("POST", "/api/auth/registrar", {
        alias,
        password,
        especialidad,
        gremio: gremio || undefined
    });
}

export async function iniciarSesion(alias, password) {
    const datos = await peticion("POST", "/api/auth/login", { alias, password });
    guardarSesion(datos.usuario, datos.token);
    return datos.usuario;
}

export async function obtenerPerfil() {
    return await peticion("GET", "/api/usuarios/me");
}

export async function obtenerAliasUsuarios() {
    const datos = await peticion("GET", "/api/usuarios/alias");
    return datos.usuarios;
}

export async function obtenerGremios() {
    const datos = await peticion("GET", "/api/gremios");
    return datos.gremios;
}

// Administración de usuarios (solo admin)
export async function listarUsuarios() {
    return await peticion("GET", "/api/usuarios");
}

export async function cambiarRolUsuario(id, role) {
    const datos = await peticion("PUT", `/api/usuarios/${id}/rol`, { role });
    return datos.usuario;
}

export async function eliminarUsuario(id) {
    return await peticion("DELETE", `/api/usuarios/${id}`);
}

// Coartadas (CRUD)
export async function obtenerCoartadas() {
    const datos = await peticion("GET", "/api/coartadas");
    return datos.coartadas.map(normalizarCoartada);
}

export async function obtenerCoartada(id) {
    const datos = await peticion("GET", `/api/coartadas/${id}`);
    return normalizarCoartada(datos.coartada);
}

export async function crearCoartada(coartada) {
    const datos = await peticion("POST", "/api/coartadas", coartada);
    return normalizarCoartada(datos.coartada);
}

export async function editarCoartada(id, cambios) {
    const datos = await peticion("PUT", `/api/coartadas/${id}`, cambios);
    return normalizarCoartada(datos.coartada);
}

export async function eliminarCoartada(id) {
    return await peticion("DELETE", `/api/coartadas/${id}`);
}

// Votos, cadena y moderación
export async function votarCoartada(id, voto) {
    const datos = await peticion("POST", `/api/coartadas/${id}/votar`, voto);
    return normalizarCoartada(datos.coartada);
}

export async function unirseComoTestigo(id) {
    const datos = await peticion("POST", `/api/coartadas/${id}/testigo`);
    return normalizarCoartada(datos.coartada);
}

export async function desertarDeLaCadena(id) {
    const datos = await peticion("DELETE", `/api/coartadas/${id}/testigo`);
    return normalizarCoartada(datos.coartada);
}

export async function marcarComoFalsa(id) {
    const datos = await peticion("POST", `/api/coartadas/${id}/marcar-falsa`);
    return normalizarCoartada(datos.coartada);
}

export async function cambiarEstadoCoartada(id, estado) {
    const datos = await peticion("PUT", `/api/coartadas/${id}/estado`, { estado });
    return normalizarCoartada(datos.coartada);
}

// Rankings
export async function obtenerRankings() {
    const datos = await peticion("GET", "/api/rankings");
    return datos.rankings;
}

// Foro de situaciones
export async function obtenerSituaciones() {
    const datos = await peticion("GET", "/api/situaciones");
    return datos.situaciones;
}

export async function obtenerSituacion(id) {
    const datos = await peticion("GET", `/api/situaciones/${id}`);
    const situacion = datos.situacion;
    return {
        ...situacion,
        topCoartadas: (situacion.topCoartadas || []).map(normalizarCoartada)
    };
}

export async function crearSituacion(titulo, descripcion) {
    const datos = await peticion("POST", "/api/situaciones", { titulo, descripcion });
    return datos.situacion;
}

export async function actualizarSituacion(id, titulo, descripcion) {
    const datos = await peticion("PUT", `/api/situaciones/${id}`, { titulo, descripcion });
    return datos.situacion;
}

export async function eliminarSituacion(id) {
    return await peticion("DELETE", `/api/situaciones/${id}`);
}

export async function solicitarCoartada(id, mensaje) {
    const datos = await peticion("POST", `/api/situaciones/${id}/solicitar`, { mensaje });
    return datos.situacion;
}