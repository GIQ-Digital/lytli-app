export type Lang = "en" | "pt" | "es"

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
]

type Entry = { en: string; pt: string; es: string }

const dict = {
  // Brand / global
  tagline: {
    en: "Caregiving made lighter",
    pt: "Cuidar com leveza",
    es: "Cuidar, sin agotarse",
  },
  giqProduct: {
    en: "A GIQ Digital product",
    pt: "Um produto GIQ Digital",
    es: "Un producto GIQ Digital",
  },
  // Emergency + disclaimers
  emergency: {
    en: "🚨 Emergency? Call 911 (US) · 192 (BR) · 112 (EU)",
    pt: "🚨 Emergência? Ligue 192 (BR) · 911 (EUA) · 112 (EU)",
    es: "🚨 ¿Emergencia? Llama 911 (EEUU) · 192 (BR) · 112 (EU)",
  },
  disclaimerBar: {
    en: "Lytli is not a medical device. Content is for informational purposes only.",
    pt: "Lytli não é um dispositivo médico. Conteúdo apenas para fins informativos.",
    es: "Lytli no es un dispositivo médico. Contenido solo para fines informativos.",
  },
  wellnessDisclaimer: {
    en: "Lytli offers general wellness tips for caregivers. For medical questions about your loved one, always consult a healthcare professional.",
    pt: "Lytli oferece dicas gerais de bem-estar para cuidadores. Para questões médicas sobre seu familiar, consulte sempre um profissional de saúde.",
    es: "Lytli ofrece consejos de bienestar para cuidadores. Para preguntas médicas sobre su familiar, consulte siempre a un profesional.",
  },
  dismiss: { en: "Dismiss", pt: "Fechar", es: "Cerrar" },

  // Login
  continueGoogle: {
    en: "Continue with Google",
    pt: "Continuar com Google",
    es: "Continuar con Google",
  },
  orEmail: {
    en: "or sign in with email",
    pt: "ou entre com email",
    es: "o inicia sesión con email",
  },
  signInWithEmail: {
    en: "Sign in with email",
    pt: "Entrar com email",
    es: "Iniciar sesión con email",
  },
  authOr: { en: "or", pt: "ou", es: "o" },
  passwordLabel: { en: "Password", pt: "Senha", es: "Contraseña" },
  passwordPlaceholder: {
    en: "At least 8 characters",
    pt: "Mínimo de 8 caracteres",
    es: "Mínimo 8 caracteres",
  },
  signInButton: { en: "Sign in", pt: "Entrar", es: "Iniciar sesión" },
  createAccountButton: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
  signingIn: { en: "Please wait…", pt: "Aguarde…", es: "Espera…" },
  noAccountYet: {
    en: "New to Lytli? Create an account",
    pt: "Novo no Lytli? Crie uma conta",
    es: "¿Nuevo en Lytli? Crea una cuenta",
  },
  haveAccountAlready: {
    en: "Already have an account? Sign in",
    pt: "Já tem conta? Entre",
    es: "¿Ya tienes cuenta? Inicia sesión",
  },
  orUseMagicLink: {
    en: "or use magic link",
    pt: "ou use o magic link",
    es: "o usa el magic link",
  },
  backToPassword: {
    en: "Back to email and password",
    pt: "Voltar para email e senha",
    es: "Volver a email y contraseña",
  },
  passwordAuthError: {
    en: "Couldn't sign you in. Check your email and password and try again.",
    pt: "Não foi possível entrar. Confira seu email e senha e tente novamente.",
    es: "No pudimos iniciar sesión. Revisa tu email y contraseña e inténtalo de nuevo.",
  },
  googleAuthError: {
    en: "Google sign-in isn't available right now. Try another option.",
    pt: "O login com Google não está disponível agora. Tente outra opção.",
    es: "El inicio con Google no está disponible ahora. Prueba otra opción.",
  },
  emailPlaceholder: {
    en: "your@email.com",
    pt: "seu@email.com",
    es: "tu@email.com",
  },
  sendMagicLink: {
    en: "Send magic link",
    pt: "Enviar link de acesso",
    es: "Enviar enlace mágico",
  },
  magicSent: {
    en: "Check your email — we sent you a sign in link.",
    pt: "Verifique seu email — enviamos um link de acesso.",
    es: "Revisa tu email — te enviamos un enlace de acceso.",
  },
  magicError: {
    en: "Could not send the link. Please try again.",
    pt: "Não foi possível enviar o link. Tente novamente.",
    es: "No se pudo enviar el enlace. Inténtalo de nuevo.",
  },
  sending: {
    en: "Sending…",
    pt: "Enviando…",
    es: "Enviando…",
  },
  useAnotherEmail: {
    en: "Use another email",
    pt: "Usar outro email",
    es: "Usar otro email",
  },
  loginLegal: {
    en: "By continuing you agree to our {terms} and {privacy}. Lytli™ is not a medical device.",
    pt: "Ao continuar você concorda com {terms} e {privacy}. Lytli™ não é dispositivo médico.",
    es: "Al continuar aceptas {terms} y {privacy}. Lytli™ no es un dispositivo médico.",
  },
  termsOfService: {
    en: "Terms of Service",
    pt: "Termos de Serviço",
    es: "Términos de Servicio",
  },
  privacyPolicy: {
    en: "Privacy Policy",
    pt: "Política de Privacidade",
    es: "Política de Privacidad",
  },

  // Onboarding
  next: { en: "Next", pt: "Próximo", es: "Siguiente" },
  back: { en: "Back", pt: "Voltar", es: "Atrás" },
  onboardWelcome: {
    en: "Welcome to Lytli",
    pt: "Bem-vindo à Lytli",
    es: "Bienvenido a Lytli",
  },
  onboardWelcomeSub: {
    en: "Let's set up who you care for.",
    pt: "Vamos configurar quem você cuida.",
    es: "Configuremos a quién cuidas.",
  },
  step: { en: "Step", pt: "Passo", es: "Paso" },
  of: { en: "of", pt: "de", es: "de" },
  patientNameLabel: {
    en: "Who do you care for?",
    pt: "De quem você cuida?",
    es: "¿A quién cuidas?",
  },
  patientNamePlaceholder: {
    en: "Their name",
    pt: "Nome deles",
    es: "Su nombre",
  },
  ageLabel: { en: "Age", pt: "Idade", es: "Edad" },
  agePlaceholder: { en: "Age", pt: "Idade", es: "Edad" },
  relationshipLabel: {
    en: "Relationship",
    pt: "Relação",
    es: "Relación",
  },
  relMom: { en: "Mom", pt: "Mãe", es: "Mamá" },
  relDad: { en: "Dad", pt: "Pai", es: "Papá" },
  relSpouse: { en: "Spouse", pt: "Cônjuge", es: "Cónyuge" },
  relGrandparent: { en: "Grandparent", pt: "Avô/Avó", es: "Abuelo/a" },
  relOther: { en: "Other", pt: "Outro", es: "Otro" },
  challengeTitle: {
    en: "What's your biggest challenge?",
    pt: "Qual é o seu maior desafio?",
    es: "¿Cuál es tu mayor desafío?",
  },
  challengeMeds: {
    en: "💊 Medications",
    pt: "💊 Medicamentos",
    es: "💊 Medicamentos",
  },
  challengeAppts: {
    en: "📅 Appointments",
    pt: "📅 Consultas",
    es: "📅 Citas",
  },
  challengeFamily: {
    en: "👨‍👩‍👧 Family coordination",
    pt: "👨‍👩‍👧 Coordenação familiar",
    es: "👨‍👩‍👧 Coordinación familiar",
  },
  challengeOrganized: {
    en: "📋 Staying organized",
    pt: "📋 Me organizar",
    es: "📋 Mantenerme organizado",
  },
  beforeBegin: {
    en: "Before we begin",
    pt: "Antes de começar",
    es: "Antes de comenzar",
  },
  legalAcceptance: {
    en: "Legal acceptance",
    pt: "Aceitação legal",
    es: "Aceptación legal",
  },
  importantNotice: {
    en: "⚠️ Important notice",
    pt: "⚠️ Aviso importante",
    es: "⚠️ Aviso importante",
  },
  onboardWarning: {
    en: "Lytli is a wellness tool for caregivers. It is NOT a medical device and does NOT provide medical advice. AI responses are general wellness tips only — not medical advice. For emergencies call 911 (US) · 192 (BR) · 112 (EU).",
    pt: "Lytli é uma ferramenta de bem-estar para cuidadores. NÃO é um dispositivo médico e NÃO fornece orientação médica. As respostas de IA são apenas dicas gerais de bem-estar — não orientação médica. Para emergências ligue 192 (BR) · 911 (EUA) · 112 (EU).",
    es: "Lytli es una herramienta de bienestar para cuidadores. NO es un dispositivo médico y NO proporciona consejo médico. Las respuestas de IA son solo consejos generales de bienestar — no consejo médico. Para emergencias llama 911 (EEUU) · 192 (BR) · 112 (EU).",
  },
  onboardCheck1: {
    en: "I understand Lytli is not a medical device and does not provide medical advice.",
    pt: "Entendo que Lytli não é um dispositivo médico e não fornece orientação médica.",
    es: "Entiendo que Lytli no es un dispositivo médico y no proporciona consejo médico.",
  },
  onboardCheck2: {
    en: "I agree to the Terms of Service and Privacy Policy.",
    pt: "Concordo com os Termos de Serviço e Política de Privacidade.",
    es: "Acepto los Términos de Servicio y Política de Privacidad.",
  },
  onboardCheck3: {
    en: "I confirm I am 18 years of age or older.",
    pt: "Confirmo que tenho 18 anos ou mais.",
    es: "Confirmo que tengo 18 años o más.",
  },
  createAccount: {
    en: "Create my free account",
    pt: "Criar minha conta gratuita",
    es: "Crear mi cuenta gratuita",
  },
  lytliThinking: {
    en: "Lytli is thinking about you...",
    pt: "Lytli está pensando em você...",
    es: "Lytli está pensando en ti...",
  },

  // Home
  hi: { en: "Hi", pt: "Oi", es: "Hola" },
  caringFor: { en: "Caring for", pt: "Cuidando de", es: "Cuidando de" },
  dailyTip: {
    en: "Your daily tip",
    pt: "Sua dica do dia",
    es: "Tu tip del día",
  },
  dailyTipContent: {
    en: "Taking short breaks makes you a better caregiver. Even 5 minutes of fresh air resets your patience.",
    pt: "Pausas curtas fazem de você um cuidador melhor. Até 5 minutos de ar fresco reinicia sua paciência.",
    es: "Los descansos cortos te hacen mejor cuidador. Hasta 5 minutos de aire fresco reinicia tu paciencia.",
  },
  medicationsToday: {
    en: "Medications today",
    pt: "Medicamentos hoje",
    es: "Medicamentos hoy",
  },
  weeksTasks: {
    en: "This week's tasks",
    pt: "Tarefas da semana",
    es: "Tareas de la semana",
  },
  taskCardio: {
    en: "Cardiology appointment",
    pt: "Consulta de cardiologia",
    es: "Cita de cardiología",
  },
  taskBP: {
    en: "Check blood pressure",
    pt: "Verificar pressão arterial",
    es: "Revisar presión arterial",
  },
  taskRenew: {
    en: "Renew Metformin prescription",
    pt: "Renovar receita de Metformina",
    es: "Renovar receta de Metformina",
  },

  // Status pills
  done: { en: "Done", pt: "Feito", es: "Hecho" },
  missed: { en: "Missed", pt: "Perdido", es: "Perdido" },

  // Medications
  medications: {
    en: "Medications",
    pt: "Medicamentos",
    es: "Medicamentos",
  },
  weeklyAdherence: {
    en: "Weekly adherence",
    pt: "Adesão semanal",
    es: "Adherencia semanal",
  },
  morning: { en: "Morning", pt: "Manhã", es: "Mañana" },
  afternoon: { en: "Afternoon", pt: "Tarde", es: "Tarde" },
  evening: { en: "Evening", pt: "Noite", es: "Noche" },
  takeWithFood: {
    en: "Take with food",
    pt: "Tomar com alimentos",
    es: "Tomar con comida",
  },
  addMedication: {
    en: "+ Add medication",
    pt: "+ Adicionar medicamento",
    es: "+ Agregar medicamento",
  },

  // Ask
  askLytli: { en: "Ask Lytli", pt: "Fale com Lytli", es: "Habla con Lytli" },
  askSub: {
    en: "Your caregiver wellness companion",
    pt: "Seu companheiro de bem-estar",
    es: "Tu compañero de bienestar",
  },
  askIntroLabel: {
    en: "For you — the caregiver",
    pt: "Para você — o cuidador",
    es: "Para ti — el cuidador",
  },
  askIntro: {
    en: "I'm here to support YOU as a caregiver — your stress, your rest, your emotions. For medical questions about your loved one, ask their doctor.",
    pt: "Estou aqui para apoiar VOCÊ como cuidador — seu estresse, seu descanso, suas emoções. Para questões médicas sobre seu familiar, consulte o médico.",
    es: "Estoy aquí para apoyarte a TI como cuidador — tu estrés, tu descanso, tus emociones. Para preguntas médicas sobre tu familiar, consulta al médico.",
  },
  askPlaceholder: {
    en: "How are you feeling today?",
    pt: "Como você está se sentindo hoje?",
    es: "¿Cómo te sientes hoy?",
  },
  chipExhausted: {
    en: "I feel exhausted",
    pt: "Me sinto exausto",
    es: "Me siento agotado",
  },
  chipGuilt: {
    en: "Dealing with guilt",
    pt: "Lidando com culpa",
    es: "Lidiando con culpa",
  },
  chipBreak: {
    en: "I need a break",
    pt: "Preciso de uma pausa",
    es: "Necesito un descanso",
  },
  recentAnswers: {
    en: "Recent answers",
    pt: "Respostas recentes",
    es: "Respuestas recientes",
  },
  qa1q: {
    en: "I feel so exhausted all the time",
    pt: "Me sinto exausto o tempo todo",
    es: "Me siento agotado todo el tiempo",
  },
  qa1a: {
    en: "Caregiver fatigue is real and valid. Try to identify one task you can delegate this week, even something small. You cannot pour from an empty cup — your wellbeing matters too. 💚",
    pt: "A fadiga do cuidador é real e válida. Tente identificar uma tarefa que você pode delegar esta semana, mesmo algo pequeno. Você não pode dar o que não tem — seu bem-estar também importa. 💚",
    es: "La fatiga del cuidador es real y válida. Intenta identificar una tarea que puedas delegar esta semana, aunque sea algo pequeño. No puedes dar de una taza vacía — tu bienestar también importa. 💚",
  },
  qa2q: {
    en: "How do I deal with caregiver guilt?",
    pt: "Como lido com a culpa do cuidador?",
    es: "¿Cómo lidio con la culpa del cuidador?",
  },
  qa2a: {
    en: "Guilt often means you care deeply — that's a strength. Set one small boundary this week, even an hour just for you. Taking care of yourself IS part of caring. 🌱",
    pt: "A culpa muitas vezes significa que você se importa profundamente — isso é uma força. Estabeleça um pequeno limite esta semana, mesmo uma hora só para você. Cuidar de si mesmo FAZ parte de cuidar. 🌱",
    es: "La culpa a menudo significa que te importa profundamente — eso es una fortaleza. Establece un pequeño límite esta semana, aunque sea una hora solo para ti. Cuidar de ti mismo ES parte de cuidar. 🌱",
  },
  askQuotaLock: {
    en: "You've used all your free wellness sessions this month. Upgrade to Lytli Pro for 20 sessions plus Family Circle access.",
    pt: "Você usou todas as suas sessões gratuitas de bem-estar este mês. Faça upgrade para o Lytli Pro para 20 sessões e acesso ao Círculo Familiar.",
    es: "Has usado todas tus sesiones gratuitas de bienestar este mes. Actualiza a Lytli Pro para 20 sesiones y acceso al Círculo Familiar.",
  },
  upgradePro: {
    en: "Upgrade to Lytli Pro",
    pt: "Fazer upgrade para o Pro",
    es: "Actualizar a Lytli Pro",
  },

  // Schedule
  schedule: { en: "Schedule", pt: "Agenda", es: "Agenda" },
  upcoming: { en: "Upcoming", pt: "Próximas", es: "Próximas" },
  reminderSet: {
    en: "Reminder set",
    pt: "Lembrete definido",
    es: "Recordatorio activo",
  },
  addAppointment: {
    en: "+ Add appointment",
    pt: "+ Adicionar consulta",
    es: "+ Agregar cita",
  },

  // Family
  familyCircle: {
    en: "Family Circle",
    pt: "Círculo Familiar",
    es: "Círculo Familiar",
  },
  careTeam: { en: "care team", pt: "equipe de cuidado", es: "equipo de cuidado" },
  careTeamLabel: { en: "Care team", pt: "Equipe de cuidado", es: "Equipo de cuidado" },
  summarySent: {
    en: "Today's summary sent ✓",
    pt: "Resumo de hoje enviado ✓",
    es: "Resumen de hoy enviado ✓",
  },
  summaryContent: {
    en: "3 meds ✓ · Appointment May 7 · Feeling good today",
    pt: "3 remédios ✓ · Consulta 7 de maio · Se sentindo bem hoje",
    es: "3 medicinas ✓ · Cita 7 de mayo · Sintiéndose bien hoy",
  },
  primaryCaregiver: {
    en: "Primary caregiver",
    pt: "Cuidador principal",
    es: "Cuidador principal",
  },
  son: { en: "Son", pt: "Filho", es: "Hijo" },
  daughter: { en: "Daughter", pt: "Filha", es: "Hija" },
  activeNow: { en: "Active now", pt: "Ativo agora", es: "Activo ahora" },
  lastSeen: { en: "Last seen", pt: "Visto há", es: "Visto hace" },
  inviteMember: {
    en: "+ Invite family member",
    pt: "+ Convidar familiar",
    es: "+ Invitar familiar",
  },
  sharingSettings: {
    en: "Sharing settings",
    pt: "Configurações de compartilhamento",
    es: "Configuración de compartir",
  },
  appointments: {
    en: "Appointments",
    pt: "Consultas",
    es: "Citas",
  },
  dailyCheckin: {
    en: "Daily check-in",
    pt: "Check-in diário",
    es: "Check-in diario",
  },
  aiSessions: {
    en: "AI sessions",
    pt: "Sessões de IA",
    es: "Sesiones de IA",
  },
  visible: { en: "Visible", pt: "Visível", es: "Visible" },
  hidden: { en: "Hidden", pt: "Oculto", es: "Oculto" },

  // Profile
  yourMother: { en: "Your mother", pt: "Sua mãe", es: "Tu madre" },
  years: { en: "years", pt: "anos", es: "años" },
  weeklyCheckin: {
    en: "Weekly check-in",
    pt: "Check-in semanal",
    es: "Check-in semanal",
  },
  howAreYou: {
    en: "How are YOU doing",
    pt: "Como VOCÊ está",
    es: "¿Cómo estás TÚ",
  },
  energyLevel: { en: "Energy level", pt: "Nível de energia", es: "Nivel de energía" },
  stressLevel: { en: "Stress level", pt: "Nível de estresse", es: "Nivel de estrés" },
  feelingSupported: {
    en: "Feeling supported",
    pt: "Sentindo-se apoiado",
    es: "Sentirse apoyado",
  },
  lytliSays: { en: "Lytli says", pt: "Lytli diz", es: "Lytli dice" },
  lytliSaysContent: {
    en: "You're working hard this week. Take 15 minutes just for yourself today — even a short walk helps reset your energy. 💚",
    pt: "Você está se esforçando muito esta semana. Tire 15 minutos só para você hoje — até uma caminhada curta ajuda a renovar sua energia. 💚",
    es: "Estás trabajando mucho esta semana. Tómate 15 minutos solo para ti hoy — hasta una caminata corta ayuda a renovar tu energía. 💚",
  },
  myAccount: { en: "My account", pt: "Minha conta", es: "Mi cuenta" },
  plan: { en: "Plan", pt: "Plano", es: "Plan" },
  familyCircleSeats: {
    en: "Family circle",
    pt: "Círculo familiar",
    es: "Círculo familiar",
  },
  sessionsLeft: {
    en: "Sessions left",
    pt: "Sessões restantes",
    es: "Sesiones restantes",
  },
  seats: { en: "seats", pt: "vagas", es: "plazas" },
  medicalDisclaimerLink: {
    en: "Medical Disclaimer",
    pt: "Aviso Médico",
    es: "Aviso Médico",
  },
  signOut: { en: "Sign out", pt: "Sair", es: "Cerrar sesión" },
  profileFooter: {
    en: "Lytli™ is not a medical device. © 2025 GIQ Digital.",
    pt: "Lytli™ não é um dispositivo médico. © 2025 GIQ Digital.",
    es: "Lytli™ no es un dispositivo médico. © 2025 GIQ Digital.",
  },

  // Nav
  navHome: { en: "Home", pt: "Início", es: "Inicio" },
  navMeds: { en: "Meds", pt: "Remédios", es: "Medicinas" },
  navAsk: { en: "Ask", pt: "Falar", es: "Hablar" },
  navSchedule: { en: "Schedule", pt: "Agenda", es: "Agenda" },
  navFamily: { en: "Family", pt: "Família", es: "Familia" },
  navProfile: { en: "Profile", pt: "Perfil", es: "Perfil" },

  // Legal
  backToApp: { en: "Back", pt: "Voltar", es: "Atrás" },
  lastUpdated: {
    en: "Last updated: January 2025",
    pt: "Última atualização: janeiro de 2025",
    es: "Última actualización: enero de 2025",
  },

  // Legal — Terms
  termsTitle: { en: "Terms of Service", pt: "Termos de Serviço", es: "Términos de Servicio" },
  termsKeyBox: {
    en: "LYTLI IS NOT A MEDICAL DEVICE. AI wellness tips are for general informational purposes for caregivers only. They do not constitute medical advice, diagnosis, or treatment for any person. Always seek advice from a qualified healthcare provider.",
    pt: "LYTLI NÃO É UM DISPOSITIVO MÉDICO. As dicas de bem-estar da IA têm fins meramente informativos para cuidadores. Elas não constituem orientação, diagnóstico ou tratamento médico para nenhuma pessoa. Procure sempre um profissional de saúde qualificado.",
    es: "LYTLI NO ES UN DISPOSITIVO MÉDICO. Los consejos de bienestar de la IA son solo con fines informativos generales para cuidadores. No constituyen consejo, diagnóstico ni tratamiento médico para ninguna persona. Busca siempre a un profesional de salud calificado.",
  },
  termsBody: {
    en: "1. Acceptance\nBy creating an account or using Lytli, you agree to these Terms of Service and our Privacy Policy.\n\n2. Service description\nLytli is a wellness companion that helps caregivers stay organized and supported. It provides reminders, organization tools, and general wellness tips. It does not provide medical services.\n\n3. Payments\nLytli Pro is $9.99/month. You can cancel anytime; access continues until the end of the billing period.\n\n4. Intellectual property\nLytli™ is a trademark of GIQ Digital. All content and software are owned by GIQ Digital.\n\n5. Governing law\nThese terms are governed by the laws of Brazil and the United States.\n\n6. Contact\nQuestions? Email admin@giqdigital.com.",
    pt: "1. Aceitação\nAo criar uma conta ou usar a Lytli, você concorda com estes Termos de Serviço e nossa Política de Privacidade.\n\n2. Descrição do serviço\nA Lytli é uma companhia de bem-estar que ajuda cuidadores a se organizarem e se sentirem apoiados. Oferece lembretes, ferramentas de organização e dicas gerais de bem-estar. Não presta serviços médicos.\n\n3. Pagamentos\nO Lytli Pro custa $9,99/mês. Você pode cancelar quando quiser; o acesso continua até o fim do período de cobrança.\n\n4. Propriedade intelectual\nLytli™ é uma marca da GIQ Digital. Todo o conteúdo e software pertencem à GIQ Digital.\n\n5. Legislação aplicável\nEstes termos são regidos pelas leis do Brasil e dos Estados Unidos.\n\n6. Contato\nDúvidas? Escreva para admin@giqdigital.com.",
    es: "1. Aceptación\nAl crear una cuenta o usar Lytli, aceptas estos Términos de Servicio y nuestra Política de Privacidad.\n\n2. Descripción del servicio\nLytli es un compañero de bienestar que ayuda a los cuidadores a organizarse y sentirse apoyados. Ofrece recordatorios, herramientas de organización y consejos generales de bienestar. No presta servicios médicos.\n\n3. Pagos\nLytli Pro cuesta $9,99/mes. Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período de facturación.\n\n4. Propiedad intelectual\nLytli™ es una marca de GIQ Digital. Todo el contenido y software pertenecen a GIQ Digital.\n\n5. Ley aplicable\nEstos términos se rigen por las leyes de Brasil y Estados Unidos.\n\n6. Contacto\n¿Preguntas? Escribe a admin@giqdigital.com.",
  },

  // Legal — Privacy
  privacyTitle: { en: "Privacy Policy", pt: "Política de Privacidade", es: "Política de Privacidad" },
  privacyBody: {
    en: "1. Data we collect\nAccount details, the name/age/relationship of the person you care for, medications and appointments you add, and wellness check-ins.\n\n2. How we use it\nTo provide reminders, organization, family sharing, and general wellness tips.\n\n3. Family sharing\nYou control what is shared with your Family Circle through sharing settings.\n\n4. AI sessions\nYour wellness sessions are stored to show your history. They are NOT used to train AI models.\n\n5. Security\nData is encrypted in transit and at rest.\n\n6. Your rights\nYou may access, correct, or delete your data at any time.\n\n7. Regional laws\nWe comply with LGPD (Brazil) and CCPA (California).\n\n8. Age requirement\nLytli is for adults 18 and older only.\n\n9. Contact\nEmail admin@giqdigital.com.",
    pt: "1. Dados que coletamos\nInformações da conta, nome/idade/relação da pessoa que você cuida, medicamentos e consultas que você adiciona e check-ins de bem-estar.\n\n2. Como usamos\nPara fornecer lembretes, organização, compartilhamento familiar e dicas gerais de bem-estar.\n\n3. Compartilhamento familiar\nVocê controla o que é compartilhado com seu Círculo Familiar nas configurações de compartilhamento.\n\n4. Sessões de IA\nSuas sessões de bem-estar são armazenadas para mostrar seu histórico. Elas NÃO são usadas para treinar modelos de IA.\n\n5. Segurança\nOs dados são criptografados em trânsito e em repouso.\n\n6. Seus direitos\nVocê pode acessar, corrigir ou excluir seus dados a qualquer momento.\n\n7. Leis regionais\nCumprimos a LGPD (Brasil) e a CCPA (Califórnia).\n\n8. Requisito de idade\nA Lytli é apenas para adultos com 18 anos ou mais.\n\n9. Contato\nEscreva para admin@giqdigital.com.",
    es: "1. Datos que recopilamos\nDatos de la cuenta, nombre/edad/relación de la persona que cuidas, medicamentos y citas que agregas, y check-ins de bienestar.\n\n2. Cómo los usamos\nPara ofrecer recordatorios, organización, compartir con la familia y consejos generales de bienestar.\n\n3. Compartir con la familia\nTú controlas lo que se comparte con tu Círculo Familiar mediante la configuración de compartir.\n\n4. Sesiones de IA\nTus sesiones de bienestar se almacenan para mostrar tu historial. NO se usan para entrenar modelos de IA.\n\n5. Seguridad\nLos datos se cifran en tránsito y en reposo.\n\n6. Tus derechos\nPuedes acceder, corregir o eliminar tus datos en cualquier momento.\n\n7. Leyes regionales\nCumplimos con LGPD (Brasil) y CCPA (California).\n\n8. Requisito de edad\nLytli es solo para adultos de 18 años o más.\n\n9. Contacto\nEscribe a admin@giqdigital.com.",
  },

  // Legal — Disclaimer
  disclaimerTitle: { en: "Medical Disclaimer", pt: "Aviso Médico", es: "Aviso Médico" },
  disclaimerBody: {
    en: "Not a medical device\nLytli is a wellness and organization tool for caregivers. It is NOT a medical device and does not diagnose, treat, cure, or prevent any disease.\n\nAI limitations\nLytli's AI offers general wellness tips for caregivers only. It does not answer medical questions about the person you care for and is not a substitute for professional medical advice.\n\nEmergencies\nIn an emergency, call your local emergency number immediately: 911 (US) · 192 (BR) · 112 (EU).\n\nWhen to seek immediate help\nChest pain, difficulty breathing, sudden confusion, severe bleeding, loss of consciousness, or any life-threatening symptom — call emergency services now.\n\nProfessional consultation\nAlways consult a qualified healthcare provider for medical questions, medication changes, or treatment decisions.",
    pt: "Não é um dispositivo médico\nA Lytli é uma ferramenta de bem-estar e organização para cuidadores. NÃO é um dispositivo médico e não diagnostica, trata, cura ou previne nenhuma doença.\n\nLimitações da IA\nA IA da Lytli oferece apenas dicas gerais de bem-estar para cuidadores. Ela não responde a questões médicas sobre a pessoa que você cuida e não substitui orientação médica profissional.\n\nEmergências\nEm uma emergência, ligue imediatamente para o número de emergência local: 192 (BR) · 911 (EUA) · 112 (EU).\n\nQuando procurar ajuda imediata\nDor no peito, dificuldade para respirar, confusão súbita, sangramento intenso, perda de consciência ou qualquer sintoma com risco de vida — ligue para os serviços de emergência agora.\n\nConsulta profissional\nConsulte sempre um profissional de saúde qualificado para questões médicas, mudanças de medicação ou decisões de tratamento.",
    es: "No es un dispositivo médico\nLytli es una herramienta de bienestar y organización para cuidadores. NO es un dispositivo médico y no diagnostica, trata, cura ni previene ninguna enfermedad.\n\nLimitaciones de la IA\nLa IA de Lytli ofrece solo consejos generales de bienestar para cuidadores. No responde preguntas médicas sobre la persona que cuidas y no sustituye el consejo médico profesional.\n\nEmergencias\nEn una emergencia, llama de inmediato a tu número de emergencia local: 911 (EEUU) · 192 (BR) · 112 (EU).\n\nCuándo buscar ayuda inmediata\nDolor en el pecho, dificultad para respirar, confusión repentina, sangrado severo, pérdida de conciencia o cualquier síntoma que ponga en peligro la vida — llama a los servicios de emergencia ahora.\n\nConsulta profesional\nConsulta siempre a un profesional de salud calificado para preguntas médicas, cambios de medicación o decisiones de tratamiento.",
  },
  // Medications subtitle
  medicationsSub: {
    en: "Track doses and mark them as taken",
    pt: "Acompanhe as doses e marque como tomadas",
    es: "Controla las dosis y márcalas como tomadas",
  },

  // Home extras
  goodMorning: { en: "Good morning", pt: "Bom dia", es: "Buenos días" },
  goodAfternoon: { en: "Good afternoon", pt: "Boa tarde", es: "Buenas tardes" },
  goodEvening: { en: "Good evening", pt: "Boa noite", es: "Buenas noches" },
  nextDose: { en: "Next dose", pt: "Próxima dose", es: "Próxima dosis" },
  nextAppt: { en: "Next visit", pt: "Próxima consulta", es: "Próxima cita" },
  allDone: { en: "All done", pt: "Tudo em dia", es: "Todo listo" },
  todayMeds: { en: "Today's medications", pt: "Medicamentos de hoje", es: "Medicamentos de hoy" },
  todayTasks: { en: "Today's tasks", pt: "Tarefas de hoje", es: "Tareas de hoy" },
  viewAll: { en: "View all", pt: "Ver todos", es: "Ver todos" },
  today: { en: "Today", pt: "Hoje", es: "Hoy" },

  // Forms & actions
  save: { en: "Save", pt: "Salvar", es: "Guardar" },
  cancel: { en: "Cancel", pt: "Cancelar", es: "Cancelar" },
  saving: { en: "Saving…", pt: "Salvando…", es: "Guardando…" },
  delete: { en: "Delete", pt: "Excluir", es: "Eliminar" },
  remove: { en: "Remove", pt: "Remover", es: "Quitar" },
  optional: { en: "optional", pt: "opcional", es: "opcional" },

  // Medication form
  medName: { en: "Medication name", pt: "Nome do medicamento", es: "Nombre del medicamento" },
  medDosage: { en: "Dosage", pt: "Dosagem", es: "Dosis" },
  medTimes: { en: "Times (comma separated, e.g. 08:00, 20:00)", pt: "Horários (separados por vírgula, ex.: 08:00, 20:00)", es: "Horarios (separados por coma, ej.: 08:00, 20:00)" },
  medFrequency: { en: "Frequency", pt: "Frequência", es: "Frecuencia" },
  medNotes: { en: "Notes", pt: "Observações", es: "Notas" },
  noMeds: { en: "No medications yet. Add the first one to start tracking doses.", pt: "Nenhum medicamento ainda. Adicione o primeiro para começar a acompanhar as doses.", es: "Aún no hay medicamentos. Agrega el primero para empezar a controlar las dosis." },
  deleteMedConfirm: { en: "Remove this medication?", pt: "Remover este medicamento?", es: "¿Quitar este medicamento?" },

  // Appointment form
  aptTitle: { en: "Title", pt: "Título", es: "Título" },
  aptDoctor: { en: "Doctor", pt: "Médico(a)", es: "Doctor(a)" },
  aptLocation: { en: "Location", pt: "Local", es: "Ubicación" },
  aptDate: { en: "Date & time", pt: "Data e hora", es: "Fecha y hora" },
  aptReminder: { en: "Remind me before", pt: "Lembrar antes", es: "Recordar antes" },
  noAppointments: { en: "No upcoming appointments. Add one to get a reminder.", pt: "Nenhuma consulta agendada. Adicione uma para receber um lembrete.", es: "No hay citas próximas. Agrega una para recibir un recordatorio." },
  min15: { en: "15 min", pt: "15 min", es: "15 min" },
  hour1: { en: "1 hour", pt: "1 hora", es: "1 hora" },
  day1: { en: "1 day", pt: "1 dia", es: "1 día" },

  // Task form
  taskTitle: { en: "Task", pt: "Tarefa", es: "Tarea" },
  addTask: { en: "Add task", pt: "Adicionar tarefa", es: "Agregar tarea" },
  noTasks: { en: "No tasks for today. You're all caught up.", pt: "Nenhuma tarefa para hoje. Você está em dia.", es: "No hay tareas para hoy. Estás al día." },

  // Family / invite
  inviteName: { en: "Their name", pt: "Nome da pessoa", es: "Su nombre" },
  inviteEmail: { en: "Email", pt: "Email", es: "Email" },
  inviteRole: { en: "Role", pt: "Papel", es: "Rol" },
  roleCaregiver: { en: "Caregiver (can edit)", pt: "Cuidador (pode editar)", es: "Cuidador (puede editar)" },
  roleViewer: { en: "Viewer (read only)", pt: "Visualizador (somente leitura)", es: "Visor (solo lectura)" },
  inviteCreated: { en: "Invite ready — share this code:", pt: "Convite pronto — compartilhe este código:", es: "Invitación lista — comparte este código:" },
  copyLink: { en: "Copy invite link", pt: "Copiar link do convite", es: "Copiar enlace de invitación" },
  copied: { en: "Copied!", pt: "Copiado!", es: "¡Copiado!" },
  pendingInvites: { en: "Pending invites", pt: "Convites pendentes", es: "Invitaciones pendientes" },
  noFamily: { en: "No one in your circle yet. Invite a family member to share the care.", pt: "Ninguém no seu círculo ainda. Convide um familiar para compartilhar o cuidado.", es: "Aún no hay nadie en tu círculo. Invita a un familiar para compartir el cuidado." },
  pending: { en: "Pending", pt: "Pendente", es: "Pendiente" },

  // Check-in
  checkinSaved: { en: "Check-in saved. Thanks for taking a moment for yourself.", pt: "Check-in salvo. Obrigado por reservar um momento para você.", es: "Check-in guardado. Gracias por tomarte un momento para ti." },
  saveCheckin: { en: "Save check-in", pt: "Salvar check-in", es: "Guardar check-in" },
  moodLevel: { en: "Mood", pt: "Humor", es: "Ánimo" },
  sleepLevel: { en: "Sleep quality", pt: "Qualidade do sono", es: "Calidad del sueño" },

  // Subscription
  managePlan: { en: "Manage plan", pt: "Gerenciar plano", es: "Gestionar plan" },
  currentPlanFree: { en: "Free", pt: "Gratuito", es: "Gratis" },
  currentPlanPro: { en: "Pro · $9.99/mo", pt: "Pro · $9,99/mês", es: "Pro · $9,99/mes" },
  upgradeToPro: { en: "Upgrade to Pro", pt: "Assinar o Pro", es: "Actualizar a Pro" },
  cancelSubscription: { en: "Cancel subscription", pt: "Cancelar assinatura", es: "Cancelar suscripción" },
  cancelConfirm: { en: "Cancel your Pro subscription? You'll keep access until the end of the billing period.", pt: "Cancelar sua assinatura Pro? Você mantém o acesso até o fim do período de cobrança.", es: "¿Cancelar tu suscripción Pro? Mantendrás el acceso hasta el final del período de facturación." },
  proActive: { en: "Pro active", pt: "Pro ativo", es: "Pro activo" },
  willCancel: { en: "Cancels at period end", pt: "Cancela no fim do período", es: "Se cancela al final del período" },
  renews: { en: "Renews", pt: "Renova em", es: "Se renueva" },
  proPerks: { en: "Unlimited AI wellness sessions, up to 6 family seats, and weekly summaries.", pt: "Sessões de bem-estar com IA ilimitadas, até 6 lugares na família e resumos semanais.", es: "Sesiones de bienestar con IA ilimitadas, hasta 6 lugares familiares y resúmenes semanales." },
  proIncludes: { en: "Your plan includes", pt: "Seu plano inclui", es: "Tu plan incluye" },
  regionAmericas: { en: "Americas", pt: "Américas", es: "Américas" },
  regionBrasil: { en: "Brasil", pt: "Brasil", es: "Brasil" },
  regionInternational: { en: "International", pt: "Internacional", es: "Internacional" },
  freeTrialBadge: { en: "5-day free trial", pt: "5 dias grátis", es: "5 días gratis" },
  yourRegion: { en: "Your region", pt: "Sua região", es: "Tu región" },
  startFreeTrial: { en: "Start 5-day free trial", pt: "Começar 5 dias grátis", es: "Empezar 5 días gratis" },
  regionalPricingTitle: { en: "Lytli Pro pricing", pt: "Preços do Lytli Pro", es: "Precios de Lytli Pro" },
  regionalPricingNote: {
    en: "Your price is set automatically by your location. Cancel anytime during the trial and you won't be charged.",
    pt: "Seu preço é definido automaticamente pela sua localização. Cancele quando quiser durante o teste e você não será cobrado.",
    es: "Tu precio se define automáticamente según tu ubicación. Cancela cuando quieras durante la prueba y no se te cobrará.",
  },
  trialing: { en: "Free trial", pt: "Teste grátis", es: "Prueba gratis" },
  trialEnds: { en: "Trial ends", pt: "Teste termina em", es: "La prueba termina" },
  proUnlocks: { en: "Pro unlocks", pt: "O Pro desbloqueia", es: "Pro desbloquea" },
  perkAi: { en: "Unlimited AI wellness sessions", pt: "Sessões de bem-estar com IA ilimitadas", es: "Sesiones de bienestar con IA ilimitadas" },
  perkSeats: { en: "Up to 6 family circle seats", pt: "Até 6 lugares no círculo familiar", es: "Hasta 6 lugares en el círculo familiar" },
  perkSummaries: { en: "Weekly care summaries", pt: "Resumos semanais de cuidado", es: "Resúmenes semanales de cuidado" },
  checkoutTitle: { en: "Lytli Pro", pt: "Lytli Pro", es: "Lytli Pro" },
  paymentSuccess: { en: "Welcome to Pro! Your subscription is active.", pt: "Bem-vindo ao Pro! Sua assinatura está ativa.", es: "¡Bienvenido a Pro! Tu suscripción está activa." },

  // PWA install prompt
  installTitle: { en: "Install Lytli on your phone", pt: "Instale o Lytli no seu celular", es: "Instala Lytli en tu celular" },
  installBody: {
    en: "Open it from your home screen, full screen, in one tap.",
    pt: "Abra direto da tela inicial, em tela cheia, com um toque.",
    es: "Ábrelo desde tu pantalla de inicio, a pantalla completa, con un toque.",
  },
  installButton: { en: "Install", pt: "Instalar", es: "Instalar" },
  installNotNow: { en: "Not now", pt: "Agora não", es: "Ahora no" },
  installGotIt: { en: "Got it", pt: "Entendi", es: "Entendido" },
  installIosStep1: { en: "Tap Share in the browser bar", pt: "Toque em Compartilhar na barra do navegador", es: "Toca Compartir en la barra del navegador" },
  installIosStep2: { en: "Choose Add to Home Screen", pt: "Escolha Adicionar à Tela de Início", es: "Elige Agregar a inicio" },
} satisfies Record<string, Entry>

export type TKey = keyof typeof dict

export function t(key: TKey, lang: Lang): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[lang] ?? entry.en
}
