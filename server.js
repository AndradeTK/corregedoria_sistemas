const express = require("express");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./src/routes/auth");
const indexRoutes = require("./src/routes/index");
const intimacaoRoutes = require("./src/routes/intimacao");
const path = require('path');
require("dotenv").config();
require("./src/config/discord-strategy"); // Configuração do Passport

const moment = require("moment");

require("moment/locale/pt-br");

const app = express();
const multer = require("multer");
const upload = multer(); // Usamos o multer sem configurações específicas, se não precisar salvar arquivos

// Usando o middleware multer para processar os dados do formulário
app.use(upload.none()); // Isso garante que os dados do form sejam processados

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname) + '/src/views');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: "aaaaaaaaaaaasds",
        resave: true,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/intimacao", intimacaoRoutes);

// Iniciar o bot Discord
require('./src/bot/index.js');  // IMPORTANDO O BOT AQUI

app.use((req, res, next) => {
    res.status(404).send("Desculpe, não conseguimos encontrar essa página.");
  })

  app.listen(process.env.PORT, async function (erro) {
    if (erro) {
      console.log("❌ » Erro :" + erro);
    } else {
      console.clear();
      console.log("✅ » Servidor Online atualizado às " + moment().format('HH:mm') + " na porta " + process.env.PORT + "...");
    }
  });

