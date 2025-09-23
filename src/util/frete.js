const NodeGeocoder = require('node-geocoder');
// Configurar o NodeGeocoder com sua chave de API
const options = {
    provider: 'google',
    apiKey: 'AIzaSyA-5crHg06fNQVBN0gOW2ImdC3CBEhfbF8', // Substitua pela sua chave de API do Google Maps
};
const geocoder = NodeGeocoder(options);
// Função para obter coordenadas de um endereço
async function obterCoordenadas(endereco) {
    try {
        const res = await geocoder.geocode(endereco);
        if (res.length > 0) {
            const { latitude, longitude } = res[0];
            return { latitude, longitude };
        } else {
            throw new Error('Endereço não encontrado');
        }
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error);
    }
}
// Função para calcular a distância usando a Fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        (0.5 - Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            (1 - Math.cos(dLon)) / 2);

    return R * 2 * Math.asin(Math.sqrt(a));
}
async function calcularFrete(origem, destino, custoPorKm, phone) {
    try {

        const coordenadasOrigem = await obterCoordenadas(origem);
        const coordenadasDestino = await obterCoordenadas(destino);
        if (coordenadasOrigem && coordenadasDestino) {

            const distancia = calcularDistancia(
                coordenadasOrigem.latitude,
                coordenadasOrigem.longitude,
                coordenadasDestino.latitude,
                coordenadasDestino.longitude
            );
            const valorFrete = distancia * custoPorKm;
            //console.log(`Distância: ${distancia.toFixed(2)} km`);
            //console.log(`Valor do Frete: R$ ${valorFrete.toFixed(2)}`);
            return valorFrete.toFixed(2);

        } else {
            console.log('Não foi possível calcular a distância e o valor do frete.');
        }
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}
async function calcFrete(data) {
    // Substitua pelos endereços desejados e custo por quilômetro
    const enderecoOrigem = 'R. do Cajueiro, 734 - Cajueiro Seco, Jaboatão dos Guararapes - PE';
    let enderecoDestino = "R. " + data.rua + ", " + data.num + " - " + data.bairro + ", " + data.city + " - PE";
    const custoPorKm = 5.00;

    try {
        return await calcularFrete(enderecoOrigem, enderecoDestino, custoPorKm, data.phone);
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

module.exports = calcFrete;