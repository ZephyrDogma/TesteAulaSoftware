import { setupServer } from 'msw/node';

// Servidor mock de rede para testes automatizados com MSW (Slide 16)
export const server = setupServer();
