# utils/vigenere.py
# Vigenère Cipher Implementation
# Polyalphabetic substitution with key expansion visualization

def vigenere_encrypt(plaintext: str, key: str) -> dict:
    """
    Encrypts plaintext using the Vigenère Cipher.
    Shows key expansion and per-character mapping steps.
    """
    steps = []
    encrypted_chars = []

    key = key.upper()
    key_len = len(key)

    steps.append(f"📌 Vigenère Cipher Encryption")
    steps.append(f"📥 Plaintext : '{plaintext}'")
    steps.append(f"🔑 Key       : '{key}'")
    steps.append("─" * 50)

    # Key Expansion
    key_repeated = []
    key_idx = 0
    for char in plaintext:
        if char.isalpha():
            key_repeated.append(key[key_idx % key_len])
            key_idx += 1
        else:
            key_repeated.append(None)

    expanded_key_display = ''.join(k if k else char for k, char in zip(key_repeated, plaintext))
    steps.append(f"🔄 Key Expansion: '{expanded_key_display}'")
    steps.append("─" * 50)
    steps.append("📊 Character Mapping Table:")
    steps.append(f"  {'Pos':<5} {'Plain':<8} {'Key':<8} {'Shift':<8} {'Cipher'}")

    for i, (char, k) in enumerate(zip(plaintext, key_repeated)):
        if char.isalpha() and k:
            base = ord('A') if char.isupper() else ord('a')
            p = ord(char.upper()) - ord('A')
            k_val = ord(k) - ord('A')
            enc_val = (p + k_val) % 26
            enc_char = chr(enc_val + (ord('A') if char.isupper() else ord('a')))
            encrypted_chars.append(enc_char)
            steps.append(f"  [{i+1:<3}] {char:<8} {k:<8} {k_val:<8} {enc_char}")
        else:
            encrypted_chars.append(char)
            steps.append(f"  [{i+1:<3}] {char:<8} {'—':<8} {'—':<8} {char}")

    encrypted = ''.join(encrypted_chars)
    steps.append("─" * 50)
    steps.append(f"✅ Encrypted Output: '{encrypted}'")

    return {
        "encrypted": encrypted,
        "steps": steps
    }


def vigenere_decrypt(ciphertext: str, key: str) -> dict:
    """
    Decrypts Vigenère Cipher text using reverse key application.
    """
    steps = []
    decrypted_chars = []

    key = key.upper()
    key_len = len(key)

    steps.append(f"🔓 Vigenère Decryption")
    steps.append(f"📥 Ciphertext: '{ciphertext}'")
    steps.append(f"🔑 Key       : '{key}'")
    steps.append("─" * 50)

    key_idx = 0
    for i, char in enumerate(ciphertext):
        if char.isalpha():
            k = key[key_idx % key_len]
            base = ord('A') if char.isupper() else ord('a')
            c_val = ord(char.upper()) - ord('A')
            k_val = ord(k) - ord('A')
            dec_val = (c_val - k_val) % 26
            dec_char = chr(dec_val + (ord('A') if char.isupper() else ord('a')))
            decrypted_chars.append(dec_char)
            steps.append(f"  [{i+1}] '{char}' - key '{k}'({k_val}) → pos {dec_val} → '{dec_char}'")
            key_idx += 1
        else:
            decrypted_chars.append(char)
            steps.append(f"  [{i+1}] '{char}' → kept as-is")

    decrypted = ''.join(decrypted_chars)
    steps.append("─" * 50)
    steps.append(f"✅ Decrypted Output: '{decrypted}'")

    return {
        "decrypted": decrypted,
        "steps": steps
    }
