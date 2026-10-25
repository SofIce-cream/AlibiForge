import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import CreateAlibi from "./pages/CreateAlibi.jsx";
import AlibiChain from "./pages/AlibiChain.jsx";
import Coartadas from "./Paginas/coartadas";

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
                </nav>
            </header>

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/coartadas" element={<Coartadas />} />
                <Route path="/crear-coartada" element={<CreateAlibi />} />
                <Route path="/alibi-chain" element={<AlibiChain />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
