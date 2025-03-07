const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const generatePDF = require("../utils/generatePDF");
require("dotenv").config();
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });
bot.login(process.env.BOT_TOKEN);

const router = express.Router();

router.post("/enviar", async (req, res) => {
    console.log(req.body); // Adicione isso para ver o que está chegando
    const { discordId, nome, patente, hora, data } = req.body;

    const datas = {
        intimado: nome,
        patente: patente,
        dataComparecimento: data,
        horaComparecimento: hora,
        dataEmissao: new Date()
    }

    // Verifique se os dados estão chegando corretamente
    if (!discordId || !nome || !patente || !hora || !data) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    const pdfPath = await generatePDF(datas);

    try {
        const user = await bot.users.fetch(discordId);
        const dm = await user.createDM();

        // Criando o embed com os botões
        const timestamp = new Date();

        const embed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("⚖️ Corregedoria Geral PMC - Intimação")
            .setDescription(
                "Você está sendo intimado a comparecer ao departamento para prestar esclarecimentos. **Abra o documento** para mais informações! \n \n Acha que isso foi um erro? Entre em contato conosco!"
            )
            .setTimestamp(timestamp)
            .setThumbnail(process.env.CORRICON)
            .setFooter({
                text: "Clique para baixar o PDF",
                iconURL: "https://cdn-icons-png.flaticon.com/512/4726/4726010.png",
            });

        // Criando os botões
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmarLeitura')
            .setLabel('Confirmar Leitura')
            .setStyle(ButtonStyle.Primary);

        const reagendarButton = new ButtonBuilder()
            .setCustomId('reagendar')
            .setLabel('Reagendamento')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, reagendarButton);

        // Enviar o embed com o PDF
        await dm.send({
            embeds: [embed],
            components: [actionRow],
            files: [pdfPath] // Enviar o PDF com a intimação
        });

        res.json({ success: true, message: "Intimação enviada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
