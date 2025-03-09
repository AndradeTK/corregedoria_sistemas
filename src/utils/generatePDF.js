const puppeteer = require("puppeteer");
const moment = require("moment");

require("moment/locale/pt-br");
const path = require("path");
const fs = require("fs");

async function generatePDF(data) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Carregar o template HTML
    let template = fs.readFileSync(path.join(__dirname, "/intimacao_template.html"), "utf-8");

    // Substituir as chaves pelos dados reais
    template = template.replace("{{nome}}", data.intimado);
    template = template.replace("{{patente}}", data.patente);
    template = template.replace("{{dataComparecimento}}", data.dataComparecimento);
    template = template.replace("{{horaComparecimento}}", data.horaComparecimento);
    template = template.replace("{{dataEmissao}}",  moment(data.dataEmissao).locale('pt-br').format('DD/MM/YYYY'));
    template = template.replace("{{dataEmissao2}}",  moment(data.dataEmissao).locale('pt-br').format('DD/MM/YYYY'));
    template = template.replace("{{dataEmissao3}}",  moment(data.dataEmissao).locale('pt-br').format('HH:mm:ss'));
    template = template.replace("{{assinatura}}", data.assinatura);
    template = template.replace("{{userEmissao}}", data.userEmissao);

    // Configurar o conteúdo da página com o HTML modificado
    await page.setContent(template);

    // Gerar o PDF
    const filePath = path.join(__dirname, `../../public/intimacoes/intimacao_${moment().locale('pt-br').format('DD-MM-YYYY HH:mm')}.pdf`);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });

    await browser.close();
    return filePath;
}

module.exports = generatePDF;
