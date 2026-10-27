import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import CreateAlibi from "./pages/CreateAlibi.jsx";
import AlibiChain from "./pages/AlibiChain.jsx";
import Coartadas from "./Paginas/coartadas";
import Rankings from "./Paginas/Rankings";
import Situaciones from "./Paginas/Situaciones";
import { haySesion } from "./api";

// Solo deja pasar si hay sesión iniciada; si no, manda al login
function RutaProtegida({ children }) {
    return haySesion() ? children : <Navigate to="/" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <header>
                <h1>AlibiForge</h1>
                <nav>
                    <Link to="/">Login</Link>
                    <Link to="/registro">Registro</Link>
                    <Link to="/perfil">Mi perfil</Link>
                    <Link to="/coartadas">Coartadas</Link>
                    <Link to="/crear-coartada">Crear coartada</Link>
                    <Link to="/alibi-chain">Alibi Chain</Link>
                    <Link to="/situaciones">Foro</Link>
                    <Link to="/rankings">Rankings</Link>
                </nav>
            </header>

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/coartadas" element={<RutaProtegida><Coartadas /></RutaProtegida>} />
                <Route path="/crear-coartada" element={<RutaProtegida><CreateAlibi /></RutaProtegida>} />
                <Route path="/alibi-chain" element={<RutaProtegida><AlibiChain /></RutaProtegida>} />
                <Route path="/situaciones" element={<RutaProtegida><Situaciones /></RutaProtegida>} />
                <Route path="/rankings" element={<RutaProtegida><Rankings /></RutaProtegida>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;