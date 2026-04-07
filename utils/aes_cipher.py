# 
# utils/aes_cipher.py
# Member 3: AES-256 Encryption using cryptography library
# Demonstrates conceptual AES round steps alongside actual encryption
# 

import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend


def _pad_key(key: str) -> bytes:
    """Pad or truncate key to 32 bytes (AES-256)."""
    key_bytes = key.encode('utf-8')
    return key_bytes[:32].ljust(32, b'\0')


def aes_encrypt(plaintext: str, key: str) -> dict:
    """
    Encrypts plaintext using AES-256-CBC with PKCS7 padding.
    Returns Base64-encoded IV+ciphertext and visualization steps.
    """
    steps = []

    steps.append("📌 AES-256 Encryption (CBC Mode)")
    steps.append(f"📥 Input Text: '{plaintext}'")
    steps.append("─" * 50)

    # Step 1: Key preparation
    key_bytes = _pad_key(key)
    steps.append(f"🔑 STEP 1 — Key Preparation")
    steps.append(f"   Raw Key      : '{key}'")
    steps.append(f"   Padded Key   : {key_bytes.hex()} ({len(key_bytes)} bytes = 256-bit AES)")

    # Step 2: Block formation
    steps.append(f"📦 STEP 2 — Block Formation")
    steps.append(f"   AES works on 128-bit (16-byte) blocks.")
    text_bytes = plaintext.encode('utf-8')
    steps.append(f"   Plaintext bytes : {text_bytes.hex()}")
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(text_bytes) + padder.finalize()
    steps.append(f"   After PKCS7 pad : {padded_data.hex()} ({len(padded_data)} bytes)")

    # Step 3: IV Generation
    iv = os.urandom(16)
    steps.append(f"🎲 STEP 3 — IV Generation (Initialization Vector)")
    steps.append(f"   IV (hex) : {iv.hex()}  ← Random 128-bit value for CBC mode")

    # Step 4: AES Round Simulation (conceptual)
    steps.append(f"⚙️  STEP 4 — AES Round Operations (Simplified Conceptual View)")
    steps.append(f"   AES-256 performs 14 rounds. Each round consists of:")
    steps.append(f"   ├─ [SubBytes]   : Non-linear substitution using S-Box lookup")
    steps.append(f"   ├─ [ShiftRows]  : Cyclically shift rows of the state matrix")
    steps.append(f"   ├─ [MixColumns] : Matrix multiplication in GF(2^8) field")
    steps.append(f"   └─ [AddRoundKey]: XOR state with round key derived from key schedule")

    # Step 5: Actual encryption
    cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    steps.append(f"🔐 STEP 5 — Encryption Output")
    steps.append(f"   Raw Ciphertext (hex): {ciphertext.hex()}")

    # Step 6: Encode for transport
    combined = iv + ciphertext
    encoded = base64.b64encode(combined).decode('utf-8')
    steps.append(f"📡 STEP 6 — Base64 Encoding (Network Transport)")
    steps.append(f"   IV prepended to ciphertext → Base64 encoded for safe transmission")
    steps.append(f"   Final Output: {encoded}")
    steps.append("─" * 50)
    steps.append(f"✅ AES Encryption Complete — Used in HTTPS/TLS to secure data in transit")

    return {
        "encrypted": encoded,
        "steps": steps
    }


def aes_decrypt(token: str, key: str) -> dict:
    """
    Decrypts AES-256-CBC encrypted Base64 token.
    """
    steps = []
    steps.append("🔓 AES-256 Decryption (CBC Mode)")
    steps.append("─" * 50)

    key_bytes = _pad_key(key)

    try:
        combined = base64.b64decode(token.encode('utf-8'))
        iv = combined[:16]
        ciphertext = combined[16:]

        steps.append(f"   Extracted IV         : {iv.hex()}")
        steps.append(f"   Extracted Ciphertext : {ciphertext.hex()}")

        cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_plain = decryptor.update(ciphertext) + decryptor.finalize()

        unpadder = padding.PKCS7(128).unpadder()
        plaintext_bytes = unpadder.update(padded_plain) + unpadder.finalize()
        decrypted = plaintext_bytes.decode('utf-8')

        steps.append(f"   Reverse AddRoundKey → MixColumns → ShiftRows → SubBytes applied")
        steps.append(f"   PKCS7 Padding removed")
        steps.append(f"✅ Decrypted Output: '{decrypted}'")

        return {"decrypted": decrypted, "steps": steps}

    except Exception as e:
        return {"decrypted": f"[Decryption Error: {str(e)}]", "steps": steps}
