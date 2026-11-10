/**
 * Context API: Estado Partilhado Global
 * Baseado no Slide 11 da UC LEI022:
 * - AuthProvider guarda o estado partilhado (user)
 * - Evita "prop drilling" através da árvore de componentes (Layout -> Navbar -> Página)
 * - Hook personalizado useAuth() para acesso ergonómico
 */

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado partilhado de autenticação
  const [user, setUser] = useState({
    id: 101,
    name: "Prof. Wilson",
    email: "wilson@docentes.escola.pt",
    role: "docente", // "docente" | "estudante" | "visitante"
  });

  const loginAs = (role) => {
    if (role === 'docente') {
      setUser({ id: 101, name: "Prof. Wilson", email: "wilson@docentes.escola.pt", role: "docente" });
    } else if (role === 'estudante') {
      setUser({ id: 202, name: "Maria João", email: "m.joao@alunos.escola.pt", role: "estudante" });
    } else {
      setUser(null);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para consumir o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
};
