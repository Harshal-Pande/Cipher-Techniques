# =============================================================================
# utils/caesar.py
# Member 1: Caesar Cipher Implementation
# Performs character-level shift encryption with full step-by-step breakdown
# =============================================================================

def caesar_encrypt(plaintext: str, shift: int) -> dict:
    """
    Encrypts plaintext using Caesar Cipher.
    Returns encrypted text and detailed step-by-step visualization.
    """
    steps = []
    encrypted_chars = []

    shift = shift % 26  # Normalize shift value

    steps.append(f"📌 Caesar Cipher — Shift Value: {shift}")
    steps.append(f"📥 Input Text: '{plaintext}'")
    steps.append(f"🔑 Each character will be shifted by {shift} positions in the alphabet.")
    steps.append("─" * 50)

    for i, char in enumerate(plaintext):
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            original_pos = ord(char) - base
            new_pos = (original_pos + shift) % 26
            new_char = chr(new_pos + base)
            encrypted_chars.append(new_char)
            steps.append(
                f"[{i+1}] '{char}' → pos {original_pos} + shift {shift} = pos {new_pos} → '{new_char}'"
            )
        else:
            encrypted_chars.append(char)
            steps.append(f"[{i+1}] '{char}' → non-alphabetic, kept as-is")

    encrypted = ''.join(encrypted_chars)
    steps.append("─" * 50)
    steps.append(f"✅ Encrypted Output: '{encrypted}'")

    return {
        "encrypted": encrypted,
        "steps": steps
    }


def caesar_decrypt(ciphertext: str, shift: int) -> dict:
    """
    Decrypts Caesar Cipher text by reversing the shift.
    """
    steps = []
    decrypted_chars = []

    shift = shift % 26

    steps.append(f"🔓 Caesar Decryption — Reverse Shift: {shift}")
    steps.append(f"📥 Cipher Text: '{ciphertext}'")
    steps.append("─" * 50)

    for i, char in enumerate(ciphertext):
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            pos = ord(char) - base
            orig_pos = (pos - shift) % 26
            orig_char = chr(orig_pos + base)
            decrypted_chars.append(orig_char)
            steps.append(
                f"[{i+1}] '{char}' → pos {pos} - shift {shift} = pos {orig_pos} → '{orig_char}'"
            )
        else:
            decrypted_chars.append(char)
            steps.append(f"[{i+1}] '{char}' → kept as-is")

    decrypted = ''.join(decrypted_chars)
    steps.append("─" * 50)
    steps.append(f"✅ Decrypted Output: '{decrypted}'")

    return {
        "decrypted": decrypted,
        "steps": steps
    }
