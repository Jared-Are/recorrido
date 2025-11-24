"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
  useEffect(() => {
    // Solo activamos esto en PRODUCCIÓN
    if (process.env.NODE_ENV === 'production') {
        
        const showWarning = () => {
            console.clear();
            console.log(
                "%c¡DETENTE!",
                "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;"
            );
            console.log(
                "%cEsta función del navegador es para desarrolladores. Si alguien te dijo que copiaras y pegaras algo aquí, es una estafa.",
                "font-size: 18px; color: #333; font-family: sans-serif;"
            );
        };
        
        showWarning();
        
        window.console.log = () => {}; 
        window.console.warn = () => {};
        window.console.error = () => {}; 
        
        const interval = window.setInterval(showWarning, 2000);

        return () => clearInterval(interval);
    }
  }, []);

  return null; 
}