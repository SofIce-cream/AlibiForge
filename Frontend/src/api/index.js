const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

//Sesión
export function obtenerToken() {
    return localStorage.getItem("token");
}

export function obtenerAliasActual() {
    return localStorage.getItem("usuarioActual");
}

export function guardarSesion(usuario, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuarioActual", usuario.alias);
}

export function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioActual");
}

export function haySesion() {
    return Boolean(obtenerToken());
}

//Cliente HTTP
async function peticion(metodo, ruta, cuerpo) {
    const headers = { "Content-Type": "application/json" };
    const token = obtenerToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: metodo,
            headers: headers,
            body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor. ¿Está encendido el backend?");
    }

    let datos = {};
    try {
        datos = await respuesta.json();
    } catch {
        datos = {};
    }

    if (!respuesta.ok) {
        if (respuesta.status === 401 && token) {
            cerrarSesion();
        }
        const error = new Error(datos.error || "Ocurrió un error inesperado");
        error.status = respuesta.status;
        throw error;
    }

    return datos;
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
        transiciones: c.transiciones || []
    };
}

//Autenticación y perfil
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

// Alibis
export async function obtenerCoartadas() {
    const datos = await peticion("GET", "/api/coartadas");
    return datos.coartadas.map(normalizarCoartada);
}

export async function crearCoartada(coartada) {
    const datos = await peticion("POST", "/api/coartadas", coartada);
    return normalizarCoartada(datos.coartada);
}

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

// ---------- Rankings ----------
export async function obtenerRankings() {
    const datos = await peticion("GET", "/api/rankings");
    return datos.rankings;
}

//Foro de situaciones
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

export async function solicitarCoartada(id, mensaje) {
    const datos = await peticion("POST", `/api/situaciones/${id}/solicitar`, { mensaje });
    return datos.situacion;
}