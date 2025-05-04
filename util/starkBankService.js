require('dotenv').config(); // Carrega as variáveis de ambiente
const { Transaction, Workspace } = require('starkbank');

class StarkBankService {
  static async createQrCodePayment(amount, description, senderName, senderTaxId) {
    // Verifica se DEV=true nas variáveis de ambiente
    const isDev = process.env.DEV === 'true';

    // Define as tags com base no ambiente
    const tags = isDev ? ['test', 'pix'] : ['production', 'pix'];

    // Define o ambiente (sandbox ou produção)
    const environment = isDev ? 'sandbox' : 'production';
    Workspace.setEnvironment(environment);

    try {
      const transaction = await Transaction.create([
        {
          amount: amount,
          description: description,
          tags: tags,
          rules: [
            {
              key: 'taxId',
              value: senderTaxId, // CPF/CNPJ do remetente
            },
            {
              key: 'name',
              value: senderName, // Nome do remetente
            },
          ],
        },
      ]);
      return transaction[0];
    } catch (error) {
      console.error('Erro ao criar QR Code:', error);
      throw error;
    }
  }

  static async confirmPayment(transactionId) {
    try {
      const updatedTransaction = await Transaction.update(transactionId, {
        status: 'success',
      });
      return updatedTransaction;
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      throw error;
    }
  }
}

module.exports = StarkBankService;