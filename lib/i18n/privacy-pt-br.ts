/**
 * Política de Privacidade e tratamento de dados — Cuidado em Par.
 * Redigido sob persona Especialista LGPD (Lei 13.709/2018).
 * Controladora: pessoa natural (Janaina Guiotti), fase pré-empresa / validação do produto.
 */

export const privacyCopy = {
  eyebrow: "Privacidade e proteção de dados",
  title: "Política de Privacidade e Tratamento de Dados",
  updatedAtLabel: "Última atualização",
  updatedAt: "21 de setembro de 2026",
  intro:
    "Esta Política explica, de forma clara e completa, como o Cuidado em Par trata dados pessoais e dados pessoais sensíveis de saúde. Ela integra os Termos de Uso aceitos no primeiro acesso. Em caso de conflito entre resumos na interface e este documento, prevalece o texto desta Política.",
  controllerNotice:
    "O Cuidado em Par é uma iniciativa desenvolvida por Janaina Guiotti a partir da própria busca por cuidar da saúde com segurança e constância, junto de pessoas de confiança. A proposta foi aberta para que mais gente possa se beneficiar do mesmo cuidado — ainda em fase de validação do produto, sem pessoa jurídica constituída neste momento. Canal de contato e exercício de direitos: jana.guiotti@gmail.com (além das ferramentas da Conta no aplicativo).",

  sections: [
    {
      id: "controller",
      title: "1. Quem é o controlador",
      paragraphs: [
        "A controladora dos dados pessoais tratados no Cuidado em Par é Janaina Guiotti, pessoa natural, responsável por esta iniciativa. Ela decide as finalidades e os meios de tratamento descritos nesta Política.",
        "Origem do projeto: a plataforma nasceu do interesse da controladora em melhorar a própria saúde e o acompanhamento com pares, com filtragem segura de movimento e alimentação. A decisão de compartilhar a ferramenta com outras pessoas que possam se beneficiar não altera os deveres de transparência, minimização e segurança da LGPD.",
        "Nesta fase não há razão social, CNPJ nem sede empresarial publicada, porque o produto está em validação antes de eventual constituição de empresa. Isso não dispensa o cumprimento da LGPD: o tratamento continua sob responsabilidade da controladora identificada neste documento, com canal de contato abaixo.",
        "Operadores de infraestrutura (por exemplo, provedor de autenticação e banco de dados, hospedagem da aplicação) tratam dados sob instrução da controladora, mediante relação contratual/comercial com o serviço e medidas de segurança adequadas, nos termos dos arts. 39 e 46 da LGPD.",
        "Não há, no MVP, papel de administrador de conteúdo com acesso a dados clínicos, biométricos, de ciclo/gestação ou logs de consentimento identificáveis de outras pessoas. O backoffice de biblioteca de exercícios e refeições não inclui leitura de saúde de quem usa o app.",
      ],
    },
    {
      id: "scope",
      title: "2. Escopo e a quem se aplica",
      paragraphs: [
        "Esta Política aplica-se a quem cria conta, conclui onboarding, usa hábitos, motor de conteúdo seguro, círculo de cuidado (dupla ou grupo) ou exerce direitos pela Conta.",
        "O serviço é destinado a pessoas com capacidade civil para consentir. Não coletamos, de forma intencional, dados de crianças ou adolescentes sem os mecanismos legais cabíveis. Se identificar cadastro indevido, entre em contato para exclusão.",
        "O app é um espaço de bem-estar preventivo e filtragem de conteúdo por tags. Não presta telemedicina, não emite diagnóstico, não substitui avaliação profissional de saúde e não utiliza inteligência artificial generativa para montar treinos, dietas ou laudos.",
      ],
    },
    {
      id: "definitions",
      title: "3. Definições úteis",
      paragraphs: [
        "Dado pessoal: informação relacionada a pessoa natural identificada ou identificável (ex.: e-mail, apelido).",
        "Dado pessoal sensível: dado sobre saúde, incluindo condições clínicas, mobilidade, restrições alimentares com impacto clínico, ciclo menstrual, gestação, biometria (peso) e demais informações de saúde declaradas no onboarding ou nas preferências.",
        "Perfil público: conjunto mínimo visível a outras pessoas do mesmo círculo de cuidado (hoje: nome de exibição), sem dado sensível.",
        "Motor relacional: cruzamento determinístico, no banco de dados, entre tags do seu perfil e tags de conteúdo publicado, para bloquear o que for incompatível. Não há geração automática de plano clínico por modelo generativo.",
        "Titular: você, a pessoa a quem os dados se referem.",
      ],
    },
    {
      id: "categories",
      title: "4. Quais dados tratamos",
      paragraphs: [
        "Conta e autenticação: endereço de e-mail; identificadores técnicos de sessão gerados pelo provedor de autenticação; data/hora de eventos de acesso necessários à segurança. O acesso preferencial é por link enviado ao e-mail (magic link), reduzindo armazenamento de senha no produto.",
        "Perfil de apresentação: apelido ou nome de exibição; identidade de gênero opcional (texto livre de respeito, sem disparar motor clínico); progresso de onboarding.",
        "Dados de saúde e contexto (sensíveis), quando você consente e informa: foco de cuidado; condições e restrições clínicas (tags); capacidades de movimento; padrão alimentar e tags do que você evita; módulo opcional de ciclo menstrual e/ou gestação (fases/tags); peso opcional apenas para sugerir meta de hidratação.",
        "Hábitos e consistência: registros do dia (água, sono, pausa ativa, movimento e refeição marcados), preferências de lembrete local no aparelho, metas simples de hidratação/sono quando configuradas.",
        "Círculo de cuidado: participação em no máximo um círculo (dupla ou grupo); código de convite; nome do círculo; eventos agregados do dia (apenas o tipo de cuidado cumprido, sem detalhe clínico, sem ml, sem qualidade de sono, sem título de exercício ou refeição).",
        "Consentimentos e auditoria: finalidade, aceite ou revogação, carimbo de tempo e vínculo à conta — para comprovar transparência e permitir revogação.",
        "Conteúdo de biblioteca: exercícios e refeições são cadastros editoriais do backoffice, não são dados pessoais de quem usa o app.",
        "Dados que não pedimos no MVP: foto do corpo, documentos de identidade, geolocalização contínua, contatos da agenda, microfone/câmera clínica, dados de wearables obrigatórios, histórico financeiro detalhado.",
      ],
    },
    {
      id: "purposes",
      title: "5. Finalidades e bases legais",
      paragraphs: [
        "Execução de cadastro e autenticação: criar e manter a conta, enviar link de acesso, proteger a sessão. Base: execução de contrato / procedimentos preliminares (art. 7º, V, LGPD) e legítimo interesse em segurança da conta, quando cabível, sem prejuízo do consentimento onde exigido.",
        "Termos e esta Política: registro do aceite. Base: consentimento (art. 7º, I) e cumprimento de obrigação legal/regulatória de informação quando aplicável.",
        "Personalização de segurança do conteúdo (motor de tags): usar dados de saúde e alimentação para filtrar exercícios e refeições compatíveis e bloquear conteúdos contraindicados ou incompatíveis. Base para dados sensíveis: consentimento específico e destacado (art. 11, I, LGPD). Sem esse consentimento, o app não libera a biblioteca personalizada.",
        "Hábitos de consistência (água, sono, pausa): apoiar rotina preventiva com registros seus. Bases: execução do serviço contratado e, quando houver dado sensível associado, consentimento correspondente.",
        "Biometria (peso): unicamente para sugerir meta de água, se você autorizar. Base: consentimento específico. Pode ser revogado; o peso deixa de ser usado e pode ser removido.",
        "Módulo de ciclo/gestação: adaptar filtros de conteúdo às fases declaradas, apenas com opt-in explícito. Base: consentimento específico para dado sensível. Identidade de gênero não dispara este módulo.",
        "Círculo de cuidado: compartilhar com membros do mesmo círculo apenas nome de exibição e indicadores agregados de cuidado do dia. Base: execução do serviço e consentimento aos Termos; o compartilhamento não inclui dado sensível. Você controla entrar, sair ou dissolver o círculo.",
        "Lembretes locais no aparelho: notificações no dispositivo, quando permitidas no sistema operacional; o service worker do PWA não armazena payloads de saúde em cache.",
        "Exercício de direitos e segurança: exportar seus dados, revogar consentimentos, excluir conta, prevenir abuso e garantir integridade. Bases: cumprimento de direito do titular, obrigação legal e legítimo interesse em segurança, observados os limites da LGPD.",
        "Não usamos seus dados de saúde para publicidade comportamental, scoring de crédito, venda a terceiros, ranking corporal ou comparação estética.",
      ],
    },
    {
      id: "sensitive",
      title: "6. Dados sensíveis de saúde — regras especiais",
      paragraphs: [
        "Dados de saúde são tratados com finalidade explícita, transparência e minimização: só o necessário ao filtro de segurança e aos módulos que você ativou.",
        "Consentimento de personalização de saúde é granular, registrado em log auditável e revogável a qualquer momento na Conta. A revogação impede novo uso para aquela finalidade e implica limpeza ou desassociação dos dados sensíveis vinculados, conforme a regra de produto (incluindo esconder bibliotecas personalizadas até novo aceite).",
        "Isolamento técnico: políticas de Row Level Security (RLS) no banco impedem que uma pessoa autentique e leia o sensível de outra. Perfil público e feed do círculo não carregam lesão, peso, ciclo, gestação, restrição alimentar clínica nem detalhe de hábito.",
        "Em dúvida clínica de tag, o motor bloqueia conteúdo — não improvisa. Isso é medida de segurança do produto, não aconselhamento médico personalizado.",
        "Logs de erro, URLs, analytics de marketing e cache do PWA não devem conter dado clínico. O service worker limita-se a casca estática (ícones, manifest, assets), em rede para rotas autenticadas e dados.",
      ],
    },
    {
      id: "sharing",
      title: "7. Com quem os dados podem ser compartilhados",
      paragraphs: [
        "Com você mesmo, via telas do app e exportação JSON dos seus dados.",
        "Com membros do seu círculo de cuidado: somente nome de exibição e kinds agregados do dia (água/meta, descanso, pausa, movimento, refeição), sem detalhes sensíveis.",
        "Com operadores de infraestrutura estritamente necessários à operação (autenticação, banco, hospedagem), sob instruções da controladora.",
        "Com autoridades públicas, quando houver obrigação legal, ordem judicial ou requisição válida, na medida do estritamente necessário.",
        "Não vendemos dados pessoais. Não compartilhamos dado sensível com anunciantes. Não há painel interno lendo consentimentos de produção de outras pessoas no MVP.",
      ],
    },
    {
      id: "transfers",
      title: "8. Transferência internacional",
      paragraphs: [
        "Dependendo do provedor de nuvem utilizado (por exemplo, infraestrutura que possa processar dados fora do Brasil), poderá haver transferência internacional. Quando ocorrer, a controladora adotará uma das hipóteses do art. 33 da LGPD (cláusulas contratuais, país com grau adequado, ou outra garantia válida) e manterá transparência sobre o mecanismo utilizado.",
        "Você pode solicitar informações atualizadas sobre a localização do tratamento pelo e-mail de contato indicado nesta Política.",
      ],
    },
    {
      id: "retention",
      title: "9. Retenção e exclusão",
      paragraphs: [
        "Mantemos dados enquanto a conta estiver ativa e forem necessários às finalidades informadas, ou pelos prazos legais de guarda quando existirem.",
        "Ao excluir a conta pela Conta (confirmação explícita), removemos ou anonimizamos perfil, dados sensíveis, hábitos, vínculos de círculo e registros associados à identidade, observado o tecnicamente possível e eventuais obrigações legais de retenção mínima (ex.: comprovação de consentimento em disputa).",
        "Conteúdo editorial da biblioteca (exercícios/refeições) permanece, pois não é dado pessoal seu.",
        "Backups de infraestrutura seguem ciclo de retenção do operador e são protegidos contra restauração indevida para uso ativo após exclusão.",
      ],
    },
    {
      id: "rights",
      title: "10. Seus direitos (titular)",
      paragraphs: [
        "Nos termos dos arts. 18 e seguintes da LGPD, você pode solicitar: confirmação de tratamento; acesso; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; portabilidade (exportação na Conta); informação sobre compartilhamentos; informação sobre a possibilidade de não consentir e consequências; revogação do consentimento; oposição a tratamento irregular; revisão de decisões automatizadas exclusivamente quando cabível — esclarecendo que o motor de tags é regra determinística de bloqueio de conteúdo, não scoring de crédito ou decisão empregatícia.",
        "Canais: (a) Conta no aplicativo — consentimentos, exportação e exclusão; (b) e-mail jana.guiotti@gmail.com. Responderemos no prazo legal, podendo solicitar confirmação de identidade razoável para proteger você contra acesso indevido.",
        "A ANPD (Autoridade Nacional de Proteção de Dados) é o órgão competente para petições sobre proteção de dados no Brasil.",
      ],
    },
    {
      id: "security",
      title: "11. Segurança da informação",
      paragraphs: [
        "Adotamos medidas técnicas e organizacionais proporcionais: autenticação com provedor especializado; comunicação criptografada (HTTPS); segregação de perfil público e sensível; RLS no PostgreSQL; minimização de campos; service worker sem cache de saúde; princípio de privilégio mínimo no backoffice.",
        "Nenhum sistema é 100% isento de risco. Em incidente de segurança com risco ou dano relevante aos titulares, a controladora avaliará comunicação à ANPD e aos titulares, conforme art. 48 da LGPD e guias da Autoridade.",
        "Dados reais de saúde de produção não devem ser usados para depuração cotidiana; ambientes de teste usam perfis sintéticos.",
      ],
    },
    {
      id: "pwa",
      title: "12. Aplicativo instalável (PWA), cookies e armazenamento local",
      paragraphs: [
        "Podemos usar armazenamento local do navegador/aparelho para sessão, preferências de lembrete e instalação do PWA. Isso não inclui publicar seu dado clínico em storage compartilhado ou em cache de rede do service worker.",
        "Não utilizamos pixels de redes sociais para rastrear navegação de saúde. Ferramentas de medição, se forem introduzidas no futuro, exigirão atualização desta Política e, quando necessário, novo consentimento.",
      ],
    },
    {
      id: "children",
      title: "13. Crianças e adolescentes",
      paragraphs: [
        "O serviço não é direcionado a crianças. Tratamento de dados de crianças e adolescentes observa o art. 14 da LGPD. Se você acredita que houve cadastro irregular, solicite exclusão imediatamente pelo e-mail de contato.",
      ],
    },
    {
      id: "changes",
      title: "14. Alterações desta Política",
      paragraphs: [
        "Podemos atualizar este texto para refletir mudanças legais, de infraestrutura, de produto ou, no futuro, eventual constituição de pessoa jurídica (quando razão social, CNPJ e demais dados empresariais forem publicados nesta Política). A data de atualização será revisada no topo.",
        "Mudanças relevantes sobre dado sensível ou novas finalidades serão comunicadas de forma destacada e, quando a lei exigir, solicitaremos novo consentimento antes do tratamento.",
        "O uso continuado após aviso e, quando aplicável, após novo aceite, implica ciência da versão vigente. Você pode exportar ou excluir a conta se discordar das alterações.",
      ],
    },
    {
      id: "terms",
      title: "15. Termos de Uso (resumo vinculante)",
      paragraphs: [
        "Ao criar conta e aceitar os Termos, você declara informações verdadeiras na medida do seu conhecimento, usa o app para bem-estar preventivo pessoal e não para diagnóstico de terceiros, e reconhece que o conteúdo filtrado não substitui orientação de profissionais de saúde habilitados.",
        "É vedado tentar burlar controles de segurança, acessar dados de outras pessoas, publicar conteúdo ilícito no backoffice (se tiver perfil admin), ou usar o serviço para assédio, discriminação ou pressão estética sobre outras pessoas no círculo.",
        "A controladora pode suspender contas em abuso, fraude ou risco à segurança de titulares, com preservação de logs mínimos para defesa e cumprimento legal.",
        "A responsabilidade por decisões de movimento ou alimentação permanece com você e com os profissionais que eventualmente acompanham seu caso. Em dor, mal-estar ou dúvida clínica, interrompa a prática e busque atendimento adequado.",
        "Lei aplicável: República Federativa do Brasil. Foro: comarca do domicílio da controladora, salvo foro privilegiado legal do consumidor quando aplicável.",
      ],
    },
    {
      id: "contact",
      title: "16. Contato",
      paragraphs: [
        "Para dúvidas sobre esta Política ou exercício de direitos LGPD: use a Conta no aplicativo (exportar, revogar consentimentos, excluir conta) e o e-mail jana.guiotti@gmail.com.",
        "Neste momento, o mesmo canal funciona como ponto de contato da controladora para pedidos relacionados a dados pessoais. Pedidos serão registrados e respondidos conforme a LGPD. O consentimento permanece informativo — nunca condição disfarçada de marketing persuasivo.",
      ],
    },
  ],

  closing:
    "Ao marcar o aceite de Termos e Política no onboarding, você declara ter lido este documento e compreendido as finalidades, os riscos residuais de tratamento em meio digital e os meios para exercer seus direitos.",
} as const;
