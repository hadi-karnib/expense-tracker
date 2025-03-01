import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/login"; // Import the Login page
import Register from "./Pages/register";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
