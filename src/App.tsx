import { Route, Routes } from "react-router-dom";
import { NavBar } from "./layout/NavBar";
import { Footer } from "./layout/Footer";
import { SyntheticBanner } from "./ui/SyntheticBanner";
import { Home } from "./pages/Home";
import { Backtester } from "./pages/Backtester";
import { HowItWorks } from "./pages/HowItWorks";
import "./App.css";
import "./styles/site.css";

function App() {
  return (
    <>
      <NavBar />
      <SyntheticBanner />
      <main className="app-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/backtester" element={<Backtester />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
