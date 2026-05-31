export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  cover: string;
  content: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "quote"; text: string }
  >;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "disfuncao-eretil",
    title: "Disfunção Erétil: causas reais, mitos e o que realmente funciona",
    excerpt:
      "A disfunção erétil é sintoma — não a doença em si. Entenda o que pode estar por trás e como um diagnóstico bem feito muda o tratamento.",
    category: "Disfunção Erétil",
    readingTime: "8 min de leitura",
    date: "2026-05-20",
    cover:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format&fit=crop",
    content: [
      { type: "p", text: "A disfunção erétil (DE) afeta milhões de homens em todas as idades — e ainda assim continua cercada de vergonha, silêncio e desinformação. A boa notícia: na grande maioria dos casos, tem tratamento. A má notícia: a indústria descobriu que o constrangimento é um excelente negócio, e o paciente acaba pagando caro por soluções genéricas que não atacam a causa." },
      { type: "h2", text: "DE é um sintoma, não um diagnóstico" },
      { type: "p", text: "Tratar disfunção erétil apenas com a pílula azul é como tomar analgésico para uma dor de dente sem nunca ir ao dentista. Alivia, mas o problema continua lá. A ereção depende de um sistema complexo: vasos, nervos, hormônios e fatores emocionais trabalhando juntos. Quando algo nesse circuito falha, a ereção falha." },
      { type: "h2", text: "As principais causas que investigamos" },
      { type: "ul", items: [
        "Vasculares — hipertensão, colesterol alto e aterosclerose reduzem o fluxo sanguíneo peniano.",
        "Hormonais — baixa testosterona, alterações de tireoide ou prolactina elevada.",
        "Metabólicas — diabetes, obesidade abdominal e síndrome metabólica.",
        "Neurológicas — lesões medulares, cirurgias pélvicas, neuropatias.",
        "Psicogênicas — ansiedade de desempenho, depressão, estresse crônico, problemas no relacionamento.",
        "Medicamentosas — anti-hipertensivos, antidepressivos e outros fármacos comuns.",
      ]},
      { type: "h2", text: "Por que tantos tratamentos falham" },
      { type: "p", text: "Porque pulam a etapa mais importante: a investigação. Sem entender se a causa é vascular, hormonal ou emocional, qualquer tratamento é uma aposta. Em uma avaliação séria, fazemos história clínica detalhada, exame físico e exames laboratoriais direcionados antes de prescrever qualquer coisa." },
      { type: "quote", text: "A disfunção erétil costuma ser o primeiro aviso de que algo maior — coração, metabolismo, saúde mental — precisa de atenção. Ignorar o sintoma é perder uma chance de diagnóstico precoce." },
      { type: "h2", text: "O que realmente funciona" },
      { type: "ul", items: [
        "Tratamento da causa de base (controle de pressão, diabetes, peso, sono).",
        "Reposição hormonal quando indicada — nunca por modismo.",
        "Fórmulas manipuladas personalizadas, ajustadas ao seu perfil.",
        "Abordagem da saúde emocional e do relacionamento, quando necessário.",
        "Mudança de estilo de vida: exercício, alimentação, redução de álcool e tabagismo.",
      ]},
      { type: "p", text: "Você merece um diagnóstico de verdade — e um tratamento que respeite seu corpo, seu bolso e sua liberdade de escolher onde comprar o que for prescrito." },
    ],
  },
  {
    slug: "ejaculacao-precoce",
    title: "Ejaculação Precoce: o que é, o que não é e como tratar de fato",
    excerpt:
      "Ejaculação precoce não é falta de controle nem 'fraqueza'. É uma condição clínica com causas identificáveis e abordagens eficazes.",
    category: "Ejaculação Precoce",
    readingTime: "6 min de leitura",
    date: "2026-05-12",
    cover:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80&auto=format&fit=crop",
    content: [
      { type: "p", text: "A ejaculação precoce (EP) é a queixa sexual masculina mais comum — e provavelmente a menos falada. O assunto vem cercado de piadas, mitos e soluções caseiras duvidosas que só aumentam o constrangimento. Vamos colocar as coisas no lugar." },
      { type: "h2", text: "O que define ejaculação precoce" },
      { type: "p", text: "Tecnicamente, fala-se em EP quando há ejaculação persistente em até um minuto após a penetração (primária) ou redução clinicamente significativa do tempo em homens que antes não apresentavam o quadro (adquirida), associada a sofrimento pessoal ou prejuízo no relacionamento. Episódios isolados não configuram diagnóstico." },
      { type: "h2", text: "Não é frescura, é fisiologia" },
      { type: "ul", items: [
        "Fatores neurobiológicos — sensibilidade do reflexo ejaculatório, serotonina.",
        "Ansiedade de desempenho e condicionamento.",
        "Inflamações na próstata e infecções urológicas.",
        "Distúrbios hormonais (tireoide, principalmente).",
        "Disfunção erétil associada — o medo de perder a ereção acelera a ejaculação.",
      ]},
      { type: "h2", text: "Como abordamos o tratamento" },
      { type: "p", text: "Não existe uma solução única. Combinamos estratégias conforme o perfil do paciente:" },
      { type: "ul", items: [
        "Técnicas comportamentais (start-stop, squeeze) — efetivas e sem efeitos colaterais.",
        "Anestésicos tópicos em concentrações ajustadas, sem prejudicar a parceira.",
        "Medicações orais sob prescrição (ISRSs específicos, dapoxetina).",
        "Tratamento de disfunção erétil quando coexistente.",
        "Abordagem psicossexual quando o componente ansioso é dominante.",
      ]},
      { type: "quote", text: "EP não é falta de virilidade. É uma condição clínica com tratamento — e quanto mais cedo o paciente busca ajuda, mais simples costuma ser a resolução." },
      { type: "p", text: "O primeiro passo é tirar o assunto da gaveta. Uma consulta sigilosa, sem julgamento, costuma resolver mais do que anos de tentativa e erro com receitas da internet." },
    ],
  },
  {
    slug: "obesidade-sindrome-metabolica",
    title: "Obesidade e Síndrome Metabólica: o elo invisível com a saúde sexual",
    excerpt:
      "Gordura abdominal, glicose alta e pressão elevada formam um conjunto silencioso que sabota a função sexual antes mesmo dos primeiros sintomas cardíacos.",
    category: "Obesidade e Síndrome Metabólica",
    readingTime: "9 min de leitura",
    date: "2026-05-05",
    cover:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80&auto=format&fit=crop",
    content: [
      { type: "p", text: "Síndrome metabólica é o nome dado a um conjunto de alterações — gordura abdominal, pressão alta, glicose elevada, triglicerídeos altos e HDL baixo — que aparecem juntas e potencializam o risco cardiovascular. Para a saúde sexual masculina, é uma combinação especialmente perigosa." },
      { type: "h2", text: "Os critérios diagnósticos" },
      { type: "ul", items: [
        "Circunferência abdominal aumentada (> 94 cm em homens).",
        "Triglicerídeos ≥ 150 mg/dL.",
        "HDL < 40 mg/dL em homens.",
        "Pressão arterial ≥ 130/85 mmHg.",
        "Glicemia de jejum ≥ 100 mg/dL.",
      ]},
      { type: "p", text: "Três ou mais desses critérios fecham o diagnóstico — e mudam o jogo do tratamento." },
      { type: "h2", text: "Por que isso afeta a ereção" },
      { type: "p", text: "A ereção depende de endotélio saudável — o tecido que reveste os vasos sanguíneos. A síndrome metabólica é, na prática, uma doença do endotélio. Antes de comprometer artérias coronárias, ela já compromete as artérias penianas, que são significativamente mais finas. Por isso, disfunção erétil costuma ser o primeiro sinal — um aviso precoce do que está acontecendo no coração." },
      { type: "h2", text: "O eixo testosterona-obesidade" },
      { type: "p", text: "Tecido adiposo abdominal converte testosterona em estrogênio através da enzima aromatase. Resultado: quanto mais gordura abdominal, menos testosterona disponível, mais cansaço, menos libido, mais acúmulo de gordura — um ciclo vicioso que precisa ser quebrado em mais de uma frente." },
      { type: "h2", text: "O que funciona de verdade" },
      { type: "ul", items: [
        "Perda de peso clinicamente significativa (5-10% do peso corporal já melhora marcadores).",
        "Exercício resistido (musculação) — não apenas aeróbico.",
        "Sono de qualidade — privação crônica sabota hormônios.",
        "Redução de ultraprocessados e álcool.",
        "Tratamento medicamentoso quando indicado: para diabetes, dislipidemia, hipertensão e, em casos selecionados, reposição hormonal.",
      ]},
      { type: "quote", text: "Tratar a síndrome metabólica é, ao mesmo tempo, tratar a disfunção erétil, prevenir infarto, melhorar humor e devolver energia. Raramente um único cuidado tem tanto retorno." },
      { type: "p", text: "A abordagem aqui é integral: investigação metabólica completa, hormonal, e plano personalizado. Sem fórmulas mágicas, sem dietas milagrosas, sem suplementos da moda." },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
