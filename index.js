import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

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

    console.log("🔍 Dados brutos recebidos do Supabase:", JSON.stringify(data, null, 2));

    if (error || !data) {
      console.error("Erro no Supabase:", error?.message || "Sem dados");
      return res.status(500).json({ erro: "Erro ao buscar dados no Supabase" });
    }

    console.log("Dados brutos antes do mapeamento:", JSON.stringify(data, null, 2));
    const rankingMap = {};
    for (const sessao of data) {
      const id = sessao.usuario_id;
      const nome = sessao.usuarios?.name || 'Desconhecido';
      const duracao = sessao.duracao;

      if (!id) {
        console.warn(`Sessão ignorada: usuario_id é ${id} para nome ${nome}`);
        continue;
      }

      if (!rankingMap[id]) {
        rankingMap[id] = { id, nome, tempoTotal: 0 };
      }
      rankingMap[id].tempoTotal += duracao;
    }

    const ranking = Object.values(rankingMap)
      .sort((a, b) => b.tempoTotal - a.tempoTotal)
      .slice(0, 100);

    console.log("🔍 Ranking final enviado:", JSON.stringify(ranking, null, 2));

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar ranking' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
  res.send('API FocusStorm está rodando 💡⚡');
});
