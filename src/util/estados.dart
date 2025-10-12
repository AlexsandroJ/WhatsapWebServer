// Estado inicial
let currentState = {
  serverState: true,        // servidor sempre ligado após start
  clientState: false,       // cliente criado?
  conectado: false,         // conectado ao WhatsApp?
  botActiveState: false,    // bot responde?
  botAIState: false,        // IA ativa?
  imageData: null,
  reiniciando: false
};

// Função para atualizar o estado com regras mínimas
function updateState(updates) {
  const newState = { ...currentState, ...updates };

  // 🔒 Regras simples de validação (evita estados inválidos)
  if (newState.clientState && !currentState.serverState) {
    console.warn("Não é possível criar cliente sem servidor ativo");
    return false;
  }

  if (newState.conectado && !newState.clientState) {
    console.warn("Não é possível conectar sem cliente criado");
    return false;
  }

  if ((newState.botActiveState || newState.botAIState) && !newState.conectado) {
    console.warn("Não é possível ativar bot sem estar conectado");
    return false;
  }

  if (newState.reiniciando) {
    // Ao reiniciar, reseta tudo exceto serverState
    Object.assign(newState, {
      serverState: true,
      clientState: false,
      conectado: false,
      botActiveState: false,
      botAIState: false,
      imageData: null,
      reiniciando: true
    });
  }

  currentState = newState;
  console.log("Estado atualizado:", currentState);
  return true;
}

// ✅ Exemplo de uso (substitui seu array `estados`)
updateState({ 
    serverState: true,
    clientState: true,
    conectado: true,
    botActiveState: true,
    botAIState: true    ,
    imageData: "data:image/png;base64,iVBORlid3"  ,
    reiniciando: false
});           // OK

// Estado atual está sempre em `currentState`
console.log(currentState);