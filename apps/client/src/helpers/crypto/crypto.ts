import { ChatMessageSendDto } from '@shared';

const curve = 'P-256';
const aesAlg = { name: 'AES-GCM', length: 256 } as const;
const ivLength = 12;

export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: curve }, true, [
    'deriveKey',
  ]);
}

export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: curve },
    true,
    []
  );
}

export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    aesAlg,
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(buffer);
  let str = '';

  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }

  return btoa(str);
}

function fromBase64(b64: string): ArrayBuffer {
  const str: string = atob(b64);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes.buffer;
}

export async function encryptMessage(
  key: CryptoKey,
  plaintext: string
): Promise<ChatMessageSendDto> {
  const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(
    new Uint8Array(ivLength)
  );
  const data: Uint8Array<ArrayBufferLike> = new TextEncoder().encode(plaintext);
  const encrypted: ArrayBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return {
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(encrypted),
  };
}

export async function decryptMessage(
  key: CryptoKey,
  dto: ChatMessageSendDto
): Promise<string> {
  const iv: Uint8Array<ArrayBuffer> = new Uint8Array(fromBase64(dto.iv));
  const encrypted: ArrayBuffer = fromBase64(dto.ciphertext);
  const decrypted: ArrayBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
