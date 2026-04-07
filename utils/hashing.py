# =============================================================================
# utils/hashing.py
# Member 5: SHA-256 Hashing Integration
# Demonstrates one-way cryptographic hashing and the avalanche effect
# =============================================================================

import hashlib

def sha256_hash(plaintext: str) -> dict:
    """
    Computes SHA-256 hash of the input.
    Demonstrates avalanche effect by flipping one bit.
    """
    steps = []
    steps.append("📌 SHA-256 Cryptographic Hash")
    steps.append(f"📥 Input Text: '{plaintext}'")
    steps.append("─" * 50)
    steps.append("   SHA-256 generates a fixed 256-bit (64 hex character) signature.")
    steps.append("   It is a one-way function (cannot be decrypted).")

    # Standard Hash
    hash_object = hashlib.sha256(plaintext.encode('utf-8'))
    hex_dig = hash_object.hexdigest()
    steps.append(f"   ✅ Original Hash:")
    steps.append(f"      {hex_dig}")
    steps.append("─" * 50)

    # Avalanche Effect Demonstration
    steps.append("⚡ Avalanche Effect Demonstration:")
    steps.append("   Changing just ONE character completely changes the hash.")
    
    if len(plaintext) > 0:
        # Flip the last character for demonstration
        char_list = list(plaintext)
        last_char = char_list[-1]
        new_char = chr((ord(last_char) + 1) % 128)
        if new_char == '\x00': new_char = 'a'
        char_list[-1] = new_char
        modified_text = "".join(char_list)
        
        mod_hash = hashlib.sha256(modified_text.encode('utf-8')).hexdigest()
        
        steps.append(f"   Modified Input: '{modified_text}'")
        steps.append(f"   Modified Hash :")
        steps.append(f"      {mod_hash}")
        
        # Calculate differences (approximation for display)
        diff_count = sum(1 for a, b in zip(hex_dig, mod_hash) if a != b)
        steps.append(f"   Hex difference: ~{diff_count} out of 64 characters changed.")
    else:
        steps.append("   [Input is empty. Provide text to see avalanche effect.]")

    steps.append("─" * 50)
    steps.append("📡 Hashing is used for Data Integrity (checking if file/msg was altered).")

    return {
        "encrypted": hex_dig, # Reusing encrypted key for output display consistency
        "decrypted": "N/A (Hashing is a one-way function!)",
        "steps": steps
    }
