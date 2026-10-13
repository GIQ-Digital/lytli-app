"use server"

import { generateText } from "ai"
import { db } from "@/lib/db"
import { aiSessions } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { getSubscription } from "@/app/actions/subscription"
import { isPro, FREE_SESSION_LIMIT } from "@/lib/subscription"
import { and, desc, eq, gte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type AskResult =
  | { ok: true; question: string; answer: string; remaining: number | null }
  | { ok: false; reason: "quota"; remaining: 0 }

const SYSTEM: Record<string, string> = {
  en: "You are Lytli, a warm, concise wellness companion for family caregivers. You support the CAREGIVER's own wellbeing only — stress, burnout, guilt, sleep, boundaries, respite, and staying organized. You give general, supportive, practical wellness tips in 2-4 short sentences. You NEVER give medical advice about the person being cared for, never diagnose, never suggest medications or dosages. If asked something medical or clinical, gently redirect to a healthcare professional. Be caring and human, not clinical.",
  pt: "Você é a Lytli, uma companhia de bem-estar acolhedora e concisa para cuidadores familiares. Você apoia apenas o bem-estar do PRÓPRIO CUIDADOR — estresse, esgotamento, culpa, sono, limites, descanso e organização. Dê dicas de bem-estar gerais, acolhedoras e práticas em 2 a 4 frases curtas. NUNCA dê orientação médica sobre a pessoa cuidada, nunca diagnostique, nunca sugira medicamentos ou doses. Se perguntarem algo médico ou clínico, redirecione com gentileza a um profissional de saúde. Seja carinhosa e humana, não clínica.",
  es: "Eres Lytli, una compañera de bienestar cálida y concisa para cuidadores familiares. Apoyas solo el bienestar del PROPIO CUIDADOR: estrés, agotamiento, culpa, sueño, límites, descanso y organización. Ofrece consejos de bienestar generales, comprensivos y prácticos en 2 a 4 frases cortas. NUNCA des consejo médico sobre la persona cuidada, nunca diagnostiques, nunca sugieras medicamentos ni dosis. Si preguntan algo médico o clínico, redirige con amabilidad a un profesional de salud. Sé cariñosa y humana, no clínica.",
}

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

// Curated, non-clinical caregiver-wellness replies used when the AI Gateway
// isn't reachable. Keyword-matched to the caregiver's emotion, per language.
const FALLBACKS: Record<string, { keys: string[]; text: string }[]> = {
  en: [
    { keys: ["guilt", "guilty", "selfish", "bad"], text: "Feeling guilty means you care deeply — it isn't a sign you're doing anything wrong. Needing rest is human, not selfish. Try naming one small thing you did well today, and let that be enough for now." },
    { keys: ["tired", "exhausted", "burnout", "burnout", "drained", "break", "rest"], text: "That exhaustion is real, and it's your body asking for care too. Even a 10-minute pause — a walk, a warm drink, sitting quietly — counts as respite. Is there one task today you could hand off or let wait?" },
    { keys: ["alone", "lonely", "isolated", "no one"], text: "Caregiving can feel very isolating, but you don't have to carry it alone. Reaching out to one person this week — a friend, a support line, your Family Circle — can lighten the load. You matter here too." },
    { keys: ["sleep", "insomnia", "awake", "night"], text: "Broken sleep wears you down fast. A gentle wind-down — dim lights, no screens, a few slow breaths — can help signal rest. If nights are consistently hard, it's worth mentioning to your own doctor." },
    { keys: ["angry", "anger", "frustrat", "resent"], text: "Frustration doesn't make you a bad caregiver — it's a normal response to carrying a lot. Let yourself feel it without judgment, then give it an outlet: a short walk, writing it down, or a quick vent to someone you trust." },
  ],
  pt: [
    { keys: ["culpa", "culpado", "culpada", "egoísta", "egoista", "ruim"], text: "Sentir culpa mostra que você se importa muito — não é sinal de que está fazendo algo errado. Precisar descansar é humano, não egoísmo. Reconheça uma pequena coisa boa que você fez hoje e deixe isso ser suficiente por agora." },
    { keys: ["cansad", "exaust", "esgotad", "sem energia", "pausa", "descanso", "descansar"], text: "Esse cansaço é real e é o seu corpo pedindo cuidado também. Até uma pausa de 10 minutos — uma caminhada, um chá, sentar em silêncio — já conta como descanso. Há alguma tarefa de hoje que você poderia delegar ou deixar para depois?" },
    { keys: ["sozinh", "solid", "isolad", "ninguém", "ninguem"], text: "Cuidar pode ser muito solitário, mas você não precisa carregar isso sozinho(a). Falar com uma pessoa esta semana — um amigo, uma linha de apoio, seu Círculo Familiar — pode aliviar o peso. Você também importa aqui." },
    { keys: ["sono", "dormir", "insônia", "insonia", "acordad", "noite"], text: "Sono interrompido desgasta rápido. Uma rotina suave antes de deitar — luz baixa, sem telas, algumas respirações lentas — ajuda a sinalizar o descanso. Se as noites estão difíceis com frequência, vale comentar com o seu médico." },
    { keys: ["raiva", "irritad", "frustrad", "ressenti"], text: "A frustração não faz de você um mau cuidador — é uma resposta normal a carregar muita coisa. Permita-se sentir sem julgamento e dê uma válvula de escape: uma caminhada curta, escrever o que sente ou desabafar com alguém de confiança." },
  ],
  es: [
    { keys: ["culpa", "culpable", "egoísta", "egoista", "mal"], text: "Sentir culpa muestra que te importa mucho — no es señal de que hagas algo mal. Necesitar descanso es humano, no egoísta. Reconoce una pequeña cosa que hiciste bien hoy y deja que eso baste por ahora." },
    { keys: ["cansad", "agotad", "exhaust", "sin energía", "sin energia", "pausa", "descanso", "descansar"], text: "Ese agotamiento es real y es tu cuerpo pidiendo cuidado también. Incluso una pausa de 10 minutos — una caminata, una bebida caliente, sentarte en silencio — cuenta como respiro. ¿Hay alguna tarea de hoy que puedas delegar o dejar para después?" },
    { keys: ["sol", "solit", "aislad", "nadie"], text: "Cuidar puede sentirse muy solitario, pero no tienes que cargarlo en soledad. Hablar con una persona esta semana — un amigo, una línea de apoyo, tu Círculo Familiar — puede aligerar el peso. Tú también importas aquí." },
    { keys: ["sueño", "sueno", "dormir", "insomnio", "despiert", "noche"], text: "El sueño interrumpido desgasta rápido. Una rutina suave antes de acostarte — luz tenue, sin pantallas, unas respiraciones lentas — ayuda a indicar descanso. Si las noches son difíciles con frecuencia, vale la pena comentarlo con tu médico." },
    { keys: ["enoj", "ira", "frustra", "resent"], text: "La frustración no te hace un mal cuidador — es una respuesta normal a cargar con mucho. Permítete sentirla sin juzgarte y dale una salida: una caminata corta, escribir lo que sientes o desahogarte con alguien de confianza." },
  ],
}

function fallbackReply(question: string, lang: keyof typeof SYSTEM): string {
  const q = question.toLowerCase()
  const table = FALLBACKS[lang] ?? FALLBACKS.en
  const match = table.find((row) => row.keys.some((k) => q.includes(k)))
  if (match) return match.text
  // Generic supportive default
  return table === FALLBACKS.pt
    ? "Obrigada por compartilhar como você está. Cuidar de alguém é exigente, e os seus sentimentos são válidos. Reserve um momento hoje só para você — respire fundo algumas vezes e reconheça o quanto você já faz. Se algo pesar demais, converse com alguém de confiança ou com um profissional."
    : table === FALLBACKS.es
    ? "Gracias por compartir cómo estás. Cuidar a alguien es exigente y tus sentimientos son válidos. Tómate un momento hoy solo para ti — respira hondo unas veces y reconoce todo lo que ya haces. Si algo pesa demasiado, habla con alguien de confianza o con un profesional."
    : "Thank you for sharing how you're doing. Caregiving is demanding, and your feelings are valid. Take a moment today just for yourself — a few slow breaths, and acknowledge how much you already do. If something feels like too much, reach out to someone you trust or a professional."
}

/** How many AI sessions the current user has used this calendar month. */
export async function getSessionUsage() {
  const userId = await getUserId()
  const [sub, rows] = await Promise.all([
    getSubscription(),
    db
      .select({ id: aiSessions.id })
      .from(aiSessions)
      .where(and(eq(aiSessions.userId, userId), gte(aiSessions.createdAt, startOfMonth()))),
  ])
  const pro = isPro(sub)
  const used = rows.length
  return { pro, used, limit: pro ? null : FREE_SESSION_LIMIT, remaining: pro ? null : Math.max(0, FREE_SESSION_LIMIT - used) }
}

export async function getRecentSessions(limit = 10) {
  const userId = await getUserId()
  return db
    .select()
    .from(aiSessions)
    .where(eq(aiSessions.userId, userId))
    .orderBy(desc(aiSessions.createdAt))
    .limit(limit)
}

export async function askLytli(input: { question: string; language?: string }): Promise<AskResult> {
  const userId = await getUserId()
  const question = input.question.trim()
  if (!question) throw new Error("Question required")

  const usage = await getSessionUsage()
  if (!usage.pro && usage.remaining !== null && usage.remaining <= 0) {
    return { ok: false, reason: "quota", remaining: 0 }
  }

  const lang = (input.language && SYSTEM[input.language] ? input.language : "en") as keyof typeof SYSTEM

  let answer = ""
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM[lang],
      prompt: question,
    })
    answer = text.trim()
  } catch (err) {
    // If the AI Gateway is unavailable (e.g. no billing/credits) we still give
    // the caregiver a supportive, non-clinical response instead of crashing.
    console.log("[v0] askLytli: AI Gateway unavailable, using fallback:", (err as Error)?.message)
    answer = fallbackReply(question, lang)
  }
  if (!answer) answer = fallbackReply(question, lang)

  await db.insert(aiSessions).values({ userId, question, answer })

  const remaining = usage.pro || usage.remaining === null ? null : Math.max(0, usage.remaining - 1)

  revalidatePath("/ask")
  return { ok: true, question, answer, remaining }
}
