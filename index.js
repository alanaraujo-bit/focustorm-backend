require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/ranking', async (req, res) => {
  try {
const { data, error } = await supabase
  .from('sessoes1')
  .select(`
  usuario_id,
  duracao,
  tipo,
  usuarios (
    name
  )
`)
  .order('duracao', { ascending: false });
  console.log("🔍 Dados recebidos do Supabase:");
console.log(JSON.stringify(data, null, 2));


if (error || !data) {
  console.error("Erro no Supabase:", error?.message || "Sem dados");
  return res.status(500).json({ erro: "Erro ao buscar dados no Supabase" });
  console.log("Dados recebidos:", data);

}


    const rankingMap = {};
    for (const sessao of data) {
      const id = sessao.usuario_id;
      const nome = sessao.usuarios?.name || 'Desconhecido';
      const duracao = sessao.duracao;

      if (!rankingMap[id]) {
        rankingMap[id] = { nome, tempoTotal: 0 };
      }
      rankingMap[id].tempoTotal += duracao;
    }

    const ranking = Object.values(rankingMap)
      .sort((a, b) => b.tempoTotal - a.tempoTotal)
      .slice(0, 100);

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar ranking' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
