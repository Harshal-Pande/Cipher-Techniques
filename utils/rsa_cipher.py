# =============================================================================
# utils/rsa_cipher.py
# Member 4: RSA Encryption using cryptography library
# Demonstrates key generation math and encryption/decryption formulas
# =============================================================================

import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding as rsa_padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend


def rsa_encrypt(plaintext: str) -> dict:
    """
    Generates RSA-2048 key pair, encrypts plaintext.
    Shows key generation math and encryption formula steps.
    """
    steps = []

    steps.append("📌 RSA-2048 Encryption")
    steps.append(f"📥 Input Text: '{plaintext}'")
    steps.append("─" * 50)

    # Step 1: Key Generation
    steps.append("🔑 STEP 1 — RSA Key Generation")
    steps.append("   RSA security is based on the difficulty of factoring large primes.")
    steps.append("")
    steps.append("   1a. Choose two large prime numbers:")
    steps.append("       p = large prime (2048-bit key uses ~1024-bit primes)")
    steps.append("       q = another large prime")
    steps.append("")
    steps.append("   1b. Compute modulus n:")
    steps.append("       n = p × q  →  This is the RSA modulus (public)")
    steps.append("")
    steps.append("   1c. Compute Euler's Totient Function:")
    steps.append("       φ(n) = (p-1) × (q-1)")
    steps.append("")
    steps.append("   1d. Choose public exponent e:")
    steps.append("       e = 65537  →  Common choice (prime, ensures fast encryption)")
    steps.append("       Condition: gcd(e, φ(n)) = 1")
    steps.append("")
    steps.append("   1e. Compute private exponent d:")
    steps.append("       d = e⁻¹ mod φ(n)  →  Modular inverse of e")
    steps.append("")
    steps.append("   Public Key  = (e, n)  →  Shared openly")
    steps.append("   Private Key = (d, n)  →  Kept SECRET")

    # Generate actual RSA key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    pub_numbers = public_key.public_key().public_numbers() if hasattr(public_key, 'public_key') else public_key.public_numbers()
    steps.append("")
    steps.append(f"   ✅ Key Pair Generated (RSA-2048)")
    steps.append(f"   Public Exponent (e) : {pub_numbers.e}")
    steps.append(f"   Modulus (n) first 64 bits: {hex(pub_numbers.n)[:18]}...")

    # Step 2: Encryption
    steps.append("─" * 50)
    steps.append("🔐 STEP 2 — RSA Encryption")
    steps.append("   Formula: C = M^e mod n")
    steps.append("   Where:")
    steps.append("   ├─ M = plaintext message (as integer block)")
    steps.append("   ├─ e = public exponent (65537)")
    steps.append("   ├─ n = RSA modulus")
    steps.append("   └─ C = ciphertext")
    steps.append("")
    steps.append("   Padding: OAEP-SHA256 (prevents chosen-plaintext attacks)")

    ciphertext_bytes = public_key.encrypt(
        plaintext.encode('utf-8'),
        rsa_padding.OAEP(
            mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    encrypted_b64 = base64.b64encode(ciphertext_bytes).decode('utf-8')

    # Serialize private key for decryption
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')

    steps.append(f"   ✅ Ciphertext (Base64, first 40 chars): {encrypted_b64[:40]}...")
    steps.append("─" * 50)
    steps.append("📡 RSA is used in TLS Handshake to exchange the symmetric session key.")
    steps.append("✅ RSA Encryption Complete")

    return {
        "encrypted": encrypted_b64,
        "private_key_pem": private_pem,
        "steps": steps
    }


def rsa_decrypt(encrypted_b64: str, private_key_pem: str) -> dict:
    """
    Decrypts RSA encrypted Base64 ciphertext using private key PEM.
    """
    steps = []
    steps.append("🔓 RSA Decryption")
    steps.append("─" * 50)
    steps.append("   Formula: M = C^d mod n")
    steps.append("   Where:")
    steps.append("   ├─ C = ciphertext")
    steps.append("   ├─ d = private exponent (secret)")
    steps.append("   ├─ n = RSA modulus")
    steps.append("   └─ M = recovered plaintext message")
    steps.append("")

    try:
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        ciphertext_bytes = base64.b64decode(encrypted_b64.encode('utf-8'))
        plaintext_bytes = private_key.decrypt(
            ciphertext_bytes,
            rsa_padding.OAEP(
                mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        decrypted = plaintext_bytes.decode('utf-8')
        steps.append(f"   OAEP Padding stripped")
        steps.append(f"   ✅ Decrypted Output: '{decrypted}'")
        return {"decrypted": decrypted, "steps": steps}

    except Exception as e:
        return {"decrypted": f"[RSA Decryption Error: {str(e)}]", "steps": steps}
