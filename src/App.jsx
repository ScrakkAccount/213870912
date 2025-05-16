import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingCart, HelpCircle, Settings } from 'lucide-react';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import SupportPage from '@/pages/SupportPage';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from "@/components/ui/tooltip";
import ConnectionStatus from './components/ConnectionStatus';

// Método alternativo para evitar el error con el import directo
// Coloca tu logo en la carpeta public/images/ y usa esta ruta
const LOGO_PATH = "/images/logo.png";

// NOTA: Si prefieres usar import, descomenta esta línea cuando tengas el archivo logo.png en src/assets
// import logoImage from './assets/logo.png';

const App = () => {
  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out
    ${isActive
      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
      : 'text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground hover:scale-105'
    }`;

  const iconProps = {
    size: 20,
    className: "mr-3"
  };

  return (
    <Router>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-[#0c0404] text-foreground">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
              <Link to="/" className="flex items-center">
                {/* Contenedor rectangular para logo con ratio aproximado de 4.5:1 */}
                <div className="overflow-hidden rounded-md h-10 w-44 flex items-center justify-center bg-transparent">
                  <img 
                    src={LOGO_PATH} 
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-2">
                <NavLink to="/" className={navLinkClasses}><Home {...iconProps} /> Inicio</NavLink>
                <NavLink to="/shop" className={navLinkClasses}><ShoppingCart {...iconProps} /> Comprar</NavLink>
                <NavLink to="/support" className={navLinkClasses}><HelpCircle {...iconProps} /> Soporte</NavLink>
              </nav>
              <div className="flex items-center space-x-2">
                {/* Recuadro de búsqueda eliminado */}
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Routes>
            </motion.div>
          </main>

          <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container">
              <p>&copy; {new Date().getFullYear()} RyVen. Todos los derechos reservados.</p>
              <p className="mt-1">Diseñado con <span className="text-primary">&hearts;</span> por RyVen</p>
            </div>
          </footer>
          <Toaster />
          <ConnectionStatus />
        </div>
      </TooltipProvider>
    </Router>
  );
};

export default App;
  