export const ALIENTO_EMOJIS = {
  fuego: '🔥',
  fuerza: '💪',
  aplauso: '👏',
  corazon: '❤️',
  estrella: '⭐',
} as const;

export type AlientoEmojiId = keyof typeof ALIENTO_EMOJIS;

export const ALIENTO_EMOJI_OPTIONS = (
  Object.entries(ALIENTO_EMOJIS) as [AlientoEmojiId, string][]
).map(([id, emoji]) => ({ id, emoji }));

export type AlientoRecibidoPayload = {
  desafioId: string;
  destinatarioUsuarioId: string;
  remitenteUsuarioId: string;
  remitenteAlias: string;
  emojiId: AlientoEmojiId;
  emoji: string;
};

export type AlientoAck = { ok: true } | { ok: false; message: string };
