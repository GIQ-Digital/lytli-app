import { generateText } from "ai"

export const maxDuration = 30

type Lang = "en" | "pt" | "es"

const SYSTEM: Record<Lang, string> = {
  en: `You are Lytli, a warm, calm wellness companion for family caregivers.
You ONLY give general emotional-wellness and self-care tips for the CAREGIVER.
You are NOT a medical device. You NEVER diagnose, give medical advice, or answer
clinical questions about the person being cared for. If asked something medical,
gently redirect the caregiver to a qualified healthcare professional.
Keep answers to 2-4 short, gentle paragraphs. Be validating and practical.`,
  pt: `Você é a Lytli, uma companhia de bem-estar calorosa e calma para cuidadores familiares.
Você APENAS oferece dicas gerais de bem-estar emocional e autocuidado para o CUIDADOR.
Você NÃO é um dispositivo médico. NUNCA diagnostica, dá orientação médica ou responde
perguntas clínicas sobre a pessoa cuidada. Se perguntarem algo médico, oriente gentilmente
o cuidador a procurar um profissional de saúde qualificado.
Responda em 2-4 parágrafos curtos e acolhedores. Seja validador e prático. Responda em português.`,
  es: `Eres Lytli, una compañía de bienestar cálida y tranquila para cuidadores familiares.
SOLO das consejos generales de bienestar emocional y autocuidado para el CUIDADOR.
NO eres un dispositivo médico. NUNCA diagnosticas, das consejo médico ni respondes
preguntas clínicas sobre la persona cuidada. Si te preguntan algo médico, redirige con
amabilidad al cuidador a un profesional de salud calificado.
Responde en 2-4 párrafos cortos y afectuosos. Sé validador y práctico. Responde en español.`,
}

const FALLBACK: Record<Lang, string> = {
  en: "It sounds like you are carrying a lot right now, and that is completely understandable. Caregiving asks so much of you. Try to give yourself one small moment of rest today, even five quiet minutes with a cup of tea counts. You are doing better than you think. (Demo response — connect the AI Gateway to enable live answers.)",
  pt: "Parece que você está carregando muita coisa agora, e isso é totalmente compreensível. Cuidar exige muito de você. Tente se dar um pequeno momento de descanso hoje, até cinco minutos com um chá já contam. Você está indo melhor do que imagina. (Resposta de demonstração.)",
  es: "Parece que estás cargando con mucho ahora mismo, y eso es totalmente comprensible. Cuidar exige mucho de ti. Intenta darte un pequeño momento de descanso hoy, incluso cinco minutos con un té cuentan. Lo estás haciendo mejor de lo que crees. (Respuesta de demostración.)",
}

// Demo quota. In production this is enforced per user in the database.
const LIMIT = 30
const used = new Map<string, number>()

export async function POST(req: Request) {
  const { question, language, user_id } = (await req.json()) as {
    question?: string
    language?: Lang
    user_id?: string
  }

  const lang: Lang = language === "pt" || language === "es" ? language : "en"
  const uid = user_id || "demo"

  const count = used.get(uid) ?? 0
  if (count >= LIMIT) {
    return Response.json({ error: "quota_exceeded", sessions_remaining: 0 }, { status: 402 })
  }

  if (!question || !question.trim()) {
    return Response.json({ error: "empty" }, { status: 400 })
  }

  let answer = FALLBACK[lang]
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM[lang],
      prompt: question.trim(),
    })
    if (text.trim()) answer = text.trim()
  } catch (err) {
    console.log("[v0] ask route falling back to demo answer:", (err as Error).message)
  }

  const next = count + 1
  used.set(uid, next)

  return Response.json({ answer, sessions_remaining: Math.max(0, LIMIT - next) })
}
