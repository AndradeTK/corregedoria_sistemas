const puppeteer = require("puppeteer");
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
    template = template.replace("{{dataEmissao}}", data.dataEmissao);
    template = template.replace("{{assinatura}}", data.assinatura);

    // Configurar o conteúdo da página com o HTML modificado
    await page.setContent(template);

    // Gerar o PDF
    const filePath = path.join(__dirname, `../../public/intimacoes/intimacao_${data.discordId}.pdf`);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });

    await browser.close();
    return filePath;
}

module.exports = generatePDF;
