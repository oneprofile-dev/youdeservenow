import type { Lang } from "@/lib/i18n";

export type HeroAudience = "self" | "loved_one" | "we";

/** Audience selector copy (EN-first; fallback English for other locales until translated). */
export function getAudienceCopy(lang: Lang) {
  const en = {
    label: "Who deserves the prescription?",
    hint: "Same science—tuned for solo wins, gifting, or shared wins.",
    justMe: "Just me",
    lovedOne: "Someone I love",
    bothOfUs: "Both of us",
    theirName: "Their first name",
    theirNamePlaceholder: "Alex",
    lovedOneValidation: "Add their first name so we can prescribe in their honor.",
    ariaGroup: "Who this justification is for",
  };

  const localized: Partial<Record<Lang, typeof en>> = {
    es: {
      ...en,
      label: "¿Quién merece la prescripción?",
      hint: "La misma ciencia — afinada para ti, un regalo o logros compartidos.",
      justMe: "Solo yo",
      lovedOne: "Alguien que quiero",
      bothOfUs: "Los dos",
      theirName: "Su nombre",
      theirNamePlaceholder: "Alex",
      lovedOneValidation: "Escribe su nombre para prescribir en su honor.",
      ariaGroup: "Para quién es esta justificación",
    },
    fr: {
      ...en,
      label: "Qui mérite l’ordonnance ?",
      hint: "La même science — ajustée pour vous seul·e, un cadeau ou un succès partagé.",
      justMe: "Moi",
      lovedOne: "Quelqu’un que j’aime",
      bothOfUs: "Nous deux",
      theirName: "Son prénom",
      theirNamePlaceholder: "Alex",
      lovedOneValidation: "Ajoutez leur prénom pour prescrire en leur honneur.",
      ariaGroup: "À qui s’adresse cette justification",
    },
  };

  return localized[lang] ?? en;
}
