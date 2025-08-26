import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { PropertiesPage } from "./pages/properties/PropertiesPage";
import { CreatePropertyPage } from "./pages/properties/CreatePropertyPage";
import { PropertyDetailsPage } from "./pages/properties/PropertyDetailsPage";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/create" element={<CreatePropertyPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
