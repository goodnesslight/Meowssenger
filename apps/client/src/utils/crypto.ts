export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
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
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(
  key: CryptoKey,
  plaintext: string
): Promise<{ iv: string; ciphertext: string }> {
  const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(
    new Uint8Array(12)
  );
  const pt: Uint8Array<ArrayBufferLike> = new TextEncoder().encode(plaintext);
  const ct: ArrayBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    pt
  );
  return {
    iv: Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    ciphertext: Array.from(new Uint8Array(ct))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  };
}

export async function decryptMessage(
  key: CryptoKey,
  data: { iv: string; ciphertext: string }
): Promise<string> {
  const iv = new Uint8Array(
    data.iv.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );
  const ct = new Uint8Array(
    data.ciphertext.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
