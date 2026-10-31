import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import ListaCoartadas from "./pages/ListaCoartadas";
import CreateAlibi from "./pages/CreateAlibi";
import AlibiChain from "./pages/AlibiChain";
import Situaciones from "./pages/Situaciones";
import Rankings from "./pages/Rankings";
import Admin from "./pages/Admin";

// Solo deja pasar si hay sesión iniciada; si no, manda al login
function RutaProtegida({ children }) {
    const { autenticado } = useAuth();
    return autenticado ? children : <Navigate to="/" replace />;
}

// Solo para administradores; un usuario normal vuelve a su perfil
function RutaAdmin({ children }) {
    const { autenticado, esAdmin } = useAuth();
    if (!autenticado) return <Navigate to="/" replace />;
    return esAdmin ? children : <Navigate to="/perfil" replace />;
}

// Login y registro no tienen sentido si ya hay sesión
function RutaInvitado({ children }) {
    const { autenticado } = useAuth();
    return autenticado ? <Navigate to="/perfil" replace /> : children;
}

function Cabecera() {
    const { autenticado, esAdmin, logout } = useAuth();
    const navegar = useNavigate();

    function salir() {
        logout();
        navegar("/");
    }

    return (
        <header>
            <h1>AlibiForge</h1>
            <nav>
                {!autenticado && (
                    <>
                        <NavLink to="/" end>Login</NavLink>
                        <NavLink to="/registro">Registro</NavLink>
                    </>
                )}
                {autenticado && (
                    <>
                        <NavLink to="/perfil">Mi perfil</NavLink>
                        <NavLink to="/coartadas">Coartadas</NavLink>
                        <NavLink to="/crear-coartada">Crear coartada</NavLink>
                        <NavLink to="/alibi-chain">Alibi Chain</NavLink>
                        <NavLink to="/situaciones">Foro</NavLink>
                        <NavLink to="/rankings">Rankings</NavLink>
                        {esAdmin && <NavLink to="/admin">Administración</NavLink>}
                        <button type="button" className="nav-salir" onClick={salir}>Cerrar sesión</button>
                    </>
                )}
            </nav>
        </header>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Cabecera />

                <Routes>
                    <Route path="/" element={<RutaInvitado><Login /></RutaInvitado>} />
                    <Route path="/registro" element={<RutaInvitado><Registro /></RutaInvitado>} />
                    <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
                    <Route path="/coartadas" element={<RutaProtegida><ListaCoartadas /></RutaProtegida>} />
                    <Route path="/crear-coartada" element={<RutaProtegida><CreateAlibi /></RutaProtegida>} />
                    <Route path="/editar-coartada/:id" element={<RutaProtegida><CreateAlibi /></RutaProtegida>} />
                    <Route path="/alibi-chain" element={<RutaProtegida><AlibiChain /></RutaProtegida>} />
                    <Route path="/situaciones" element={<RutaProtegida><Situaciones /></RutaProtegida>} />
                    <Route path="/rankings" element={<RutaProtegida><Rankings /></RutaProtegida>} />
                    <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;