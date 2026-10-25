export function obtenerUsuarios() {
    const datos = localStorage.getItem("usuarios");
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}

export function guardarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

export function modificarCredibilidad(alias, cambio) {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(function (u) {
        return u.alias === alias;
    });

    if (!usuario) {
        return;
    }

    usuario.credibilidad = usuario.credibilidad + cambio;

    if (usuario.credibilidad < 0 && !usuario.bloqueadoHasta) {
        const sieteDiasEnMilisegundos = 7 * 24 * 60 * 60 * 1000;
        usuario.bloqueadoHasta = Date.now() + sieteDiasEnMilisegundos;
    }

    guardarUsuarios(usuarios);
}

export function puedeCrearCoartada(alias) {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(function (u) {
        return u.alias === alias;
    });

    if (!usuario) {
        return false;
    }

    if (!usuario.bloqueadoHasta) {
        return true;
    }

    return Date.now() > usuario.bloqueadoHasta;
}
