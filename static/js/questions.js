// 5 techniques × 3 levels × 10 questions = 150 total
// Format: { prompt, sub?, options: string[], answerIndex: number }
window.CRYPTO_QUIZ_BANK = {
  caesar: {
    easy: [
      { prompt: "Caesar cipher does what to letters?", options: ["Shifts letters by a fixed number", "Multiplies numbers by a key", "Hashes the message", "Uses public/private keys"], answerIndex: 0 },
      { prompt: "In Caesar cipher, A=0 and Z=?", options: ["24", "25", "26", "27"], answerIndex: 1 },
      { prompt: "If shift N=0, ciphertext is…", options: ["Random", "Same as plaintext", "Always empty", "Always numbers"], answerIndex: 1 },
      { prompt: "Which operation prevents overflow past Z?", options: ["Division", "Modulo 26", "XOR", "Sorting"], answerIndex: 1 },
      { prompt: "Caesar cipher is mainly a…", options: ["Substitution cipher", "Block cipher", "Hash function", "Asymmetric cipher"], answerIndex: 0 },
      { prompt: "If you increase shift N, what changes?", options: ["Key size", "Letter mapping", "Hash length", "Prime numbers"], answerIndex: 1 },
      { prompt: "Non-alphabetic characters (space, !) are usually…", options: ["Deleted", "Kept as-is", "Converted to numbers", "Always encrypted"], answerIndex: 1 },
      { prompt: "For Caesar encryption, we typically…", options: ["Add the shift", "Subtract the shift", "Multiply the shift", "Ignore the shift"], answerIndex: 0 },
      { prompt: "Caesar decryption typically…", options: ["Adds the shift", "Subtracts the shift", "Hashes the shift", "Uses a public key"], answerIndex: 1 },
      { prompt: "Caesar cipher is secure for modern use?", options: ["Yes", "No"], answerIndex: 1 }
    ],
    medium: [
      { prompt: "Encrypt 'C' with shift 2 (A=0).", options: ["D", "E", "F", "A"], answerIndex: 1 },
      { prompt: "Decrypt 'F' with shift 2.", options: ["D", "E", "C", "B"], answerIndex: 0 },
      { prompt: "If plaintext index=23 (X) and shift=5, new index is…", options: ["28", "2", "3", "4"], answerIndex: 2 },
      { prompt: "With shift=3, 'Z' becomes…", options: ["C", "B", "A", "D"], answerIndex: 0 },
      { prompt: "Formula for encryption index is…", options: ["(p + N) mod 26", "(p - N) mod 26", "p XOR N", "p × N"], answerIndex: 0 },
      { prompt: "If shift is 29, effective shift is…", options: ["29", "3", "2", "1"], answerIndex: 1 },
      { prompt: "Decrypt formula index is…", options: ["(c + N) mod 26", "(c - N) mod 26", "c XOR N", "c ÷ N"], answerIndex: 1 },
      { prompt: "Encrypt 'HELLO' shift 3 begins with 'H'→", options: ["J", "K", "L", "M"], answerIndex: 1 },
      { prompt: "If shift=13, Caesar becomes…", options: ["ROT13", "AES", "RSA", "SHA"], answerIndex: 0 },
      { prompt: "What is the key space size for Caesar?", options: ["26", "2^128", "2048", "Unlimited"], answerIndex: 0 }
    ],
    hard: [
      { prompt: "If shift = -3, equivalent positive shift is…", options: ["-3", "3", "23", "29"], answerIndex: 2 },
      { prompt: "Why is modulo needed?", options: ["To keep indices within 0..25", "To make ciphertext longer", "To generate primes", "To compress data"], answerIndex: 0 },
      { prompt: "If you know plaintext/ciphertext pair for 1 letter, can you recover shift?", options: ["Yes, easily", "No, impossible", "Only with primes", "Only with hashing"], answerIndex: 0 },
      { prompt: "Best description of Caesar weakness:", options: ["Vulnerable to brute force", "Perfect secrecy", "Collision resistance", "Non-reversible"], answerIndex: 0 },
      { prompt: "If shift changes per character, it becomes closer to…", options: ["Vigenère", "SHA-256", "RSA", "CBC mode"], answerIndex: 0 },
      { prompt: "Which is NOT a Caesar property?", options: ["Reversible", "Uses modulo 26", "Requires IV", "Uses fixed shift"], answerIndex: 2 },
      { prompt: "If shift=26, encryption output is…", options: ["Same as input", "All Z", "All A", "Random"], answerIndex: 0 },
      { prompt: "What happens to lowercase letters typically?", options: ["Same math, different ASCII base", "Always uppercased without math", "Removed", "Replaced with digits"], answerIndex: 0 },
      { prompt: "For English text, what attack works well on Caesar?", options: ["Frequency analysis", "RSA factoring", "Hash collision", "OAEP padding removal"], answerIndex: 0 },
      { prompt: "If plaintext contains Unicode emojis, Caesar implementation usually…", options: ["Leaves non-alpha unchanged", "Encrypts all bytes safely", "Always crashes", "Always hashes first"], answerIndex: 0 }
    ]
  },

  vigenere: {
    easy: [
      { prompt: "Vigenère cipher uses…", options: ["One fixed shift", "A repeating key with varying shifts", "Only prime numbers", "Only hashing"], answerIndex: 1 },
      { prompt: "Vigenère is a…", options: ["Polyalphabetic substitution cipher", "Block cipher", "Hash", "Asymmetric cipher"], answerIndex: 0 },
      { prompt: "Key is usually…", options: ["Alphabetic", "Only numbers", "Only binary", "Not needed"], answerIndex: 0 },
      { prompt: "If key is 'A' (shift 0), output is…", options: ["Same as plaintext", "Random", "All Z", "All A"], answerIndex: 0 },
      { prompt: "Vigenère key repeats to match…", options: ["Cipher length", "Plaintext length (letters)", "Hash length", "Prime count"], answerIndex: 1 },
      { prompt: "Non-letters are typically…", options: ["Dropped", "Kept as-is", "Converted to primes", "Always encrypted"], answerIndex: 1 },
      { prompt: "If key letter is B, shift value is…", options: ["0", "1", "2", "25"], answerIndex: 1 },
      { prompt: "Encryption combines plaintext index with key index using…", options: ["Addition mod 26", "Multiplication mod 26", "XOR", "Division"], answerIndex: 0 },
      { prompt: "Decryption uses…", options: ["Addition mod 26", "Subtraction mod 26", "Hashing", "OAEP"], answerIndex: 1 },
      { prompt: "Vigenère is stronger than Caesar because…", options: ["Shift changes per character", "Uses primes", "Uses IV", "Is one-way"], answerIndex: 0 }
    ],
    medium: [
      { prompt: "Key expansion means…", options: ["Repeating key across message letters", "Making key longer by hashing", "Generating RSA keys", "Compressing data"], answerIndex: 0 },
      { prompt: "Encrypt 'A' with key 'C' (shift 2):", options: ["A", "B", "C", "D"], answerIndex: 2 },
      { prompt: "Decrypt 'C' with key 'C':", options: ["A", "B", "C", "D"], answerIndex: 0 },
      { prompt: "If plaintext index=10 and key index=5, cipher index is…", options: ["15", "5", "10", "26"], answerIndex: 0 },
      { prompt: "If cipher index=3 and key index=5, plaintext index is…", options: ["8", "24", "2", "0"], answerIndex: 1 },
      { prompt: "In the classic example, ATTACK with key LEMON becomes…", options: ["LXFOPV", "KHOOR", "QEBNRF", "VJKUBK"], answerIndex: 0 },
      { prompt: "What does a key letter of 'Z' mean?", options: ["Shift 0", "Shift 25", "Shift 26", "Shift -1"], answerIndex: 1 },
      { prompt: "Formula (encryption) is…", options: ["(p + k) mod 26", "(p - k) mod 26", "p XOR k", "p × k"], answerIndex: 0 },
      { prompt: "Formula (decryption) is…", options: ["(c + k) mod 26", "(c - k) mod 26", "c XOR k", "c ÷ k"], answerIndex: 1 },
      { prompt: "If key length is 5 and you encrypt 12 letters, key repeats… times?", options: ["2", "3", "4", "5"], answerIndex: 1 }
    ],
    hard: [
      { prompt: "Vigenère weakness when key is short and reused:", options: ["Kasiski/frequency-based attacks", "Perfect secrecy", "Non-reversible", "Collision resistance"], answerIndex: 0 },
      { prompt: "If key is as long as message and truly random, Vigenère becomes…", options: ["One-time pad", "RSA", "AES", "SHA"], answerIndex: 0 },
      { prompt: "Key expansion typically skips non-letters so that…", options: ["Key aligns with alphabetic positions only", "Cipher becomes longer", "Hash becomes shorter", "Primes are generated"], answerIndex: 0 },
      { prompt: "If you uppercase plaintext, what changes in math?", options: ["Nothing; indices are 0..25", "Modulo changes to 52", "Key stops repeating", "It becomes hash"], answerIndex: 0 },
      { prompt: "Main security gain over Caesar is…", options: ["Multiple shifting alphabets", "Public/private keys", "S-box substitution", "IV chaining"], answerIndex: 0 },
      { prompt: "If attacker knows key, Vigenère is…", options: ["Trivially decryptable", "One-way", "Collision resistant", "Non-deterministic"], answerIndex: 0 },
      { prompt: "Which is NOT part of Vigenère?", options: ["Key", "Modulo 26", "Block chaining", "Letter indices"], answerIndex: 2 },
      { prompt: "If key contains non-letters, correct behavior is…", options: ["Reject or sanitize key", "Treat as shift 0 always", "Hash the key", "Convert to primes"], answerIndex: 0 },
      { prompt: "If ciphertext length differs from plaintext, typical reason is…", options: ["You changed alphabet set or encoding", "Modulo broke", "RSA used", "OAEP used"], answerIndex: 0 },
      { prompt: "Vigenère is best categorized as…", options: ["Classical cipher", "Modern block cipher", "Modern stream cipher", "Cryptographic hash"], answerIndex: 0 }
    ]
  },

  aes: {
    easy: [
      { prompt: "AES is a…", options: ["Symmetric block cipher", "Asymmetric cipher", "Hash function", "Compression algorithm"], answerIndex: 0 },
      { prompt: "AES block size is…", options: ["8 bytes", "16 bytes", "32 bytes", "64 bytes"], answerIndex: 1 },
      { prompt: "CBC mode needs a…", options: ["Public key", "Initialization Vector (IV)", "Prime number", "Salted hash"], answerIndex: 1 },
      { prompt: "In CBC, IV is typically…", options: ["Constant", "Random/unique per encryption", "Always zero", "The private key"], answerIndex: 1 },
      { prompt: "AES-256 refers to…", options: ["256-bit block size", "256-bit key size", "256 rounds", "256-bit IV"], answerIndex: 1 },
      { prompt: "PKCS7 padding is used to…", options: ["Make data length multiple of block size", "Generate primes", "Hash the key", "Encrypt the IV"], answerIndex: 0 },
      { prompt: "AES encryption with same key+IV is…", options: ["Deterministic", "Random each time", "One-way", "Asymmetric"], answerIndex: 0 },
      { prompt: "Which is an AES round concept?", options: ["SubBytes", "Kasiski", "OAEP", "Avalanche effect"], answerIndex: 0 },
      { prompt: "AES uses the same key for…", options: ["Encrypt and decrypt", "Only encrypt", "Only decrypt", "Key generation only"], answerIndex: 0 },
      { prompt: "If you reuse IV in CBC, risk is…", options: ["Information leakage patterns", "Better security", "Hash collisions", "Prime exposure"], answerIndex: 0 }
    ],
    medium: [
      { prompt: "CBC combines plaintext block with previous ciphertext using…", options: ["XOR", "Addition", "Multiplication", "Modulo"], answerIndex: 0 },
      { prompt: "First block in CBC is XORed with…", options: ["Key", "IV", "Public exponent", "Digest"], answerIndex: 1 },
      { prompt: "If plaintext length is already multiple of 16, PKCS7 padding…", options: ["Adds a full block of padding", "Adds nothing", "Deletes bytes", "Hashes it"], answerIndex: 0 },
      { prompt: "AES-256 performs how many rounds?", options: ["10", "12", "14", "16"], answerIndex: 2 },
      { prompt: "Which is NOT a real AES round step?", options: ["ShiftRows", "MixColumns", "AddRoundKey", "PrimeFactor"], answerIndex: 3 },
      { prompt: "In AES-CBC, ciphertext output commonly includes…", options: ["IV + ciphertext", "Only ciphertext", "Only IV", "Key + IV"], answerIndex: 0 },
      { prompt: "Why Base64 encode ciphertext?", options: ["Safe transport as text", "Increase security", "Reduce size", "Generate primes"], answerIndex: 0 },
      { prompt: "If wrong key used for decrypt, result is…", options: ["Garbage / padding error", "Always original plaintext", "Always empty", "Always same digest"], answerIndex: 0 },
      { prompt: "Purpose of AddRoundKey is…", options: ["XOR with round key", "Rotate rows", "Multiply columns", "Hash state"], answerIndex: 0 },
      { prompt: "Purpose of IV is…", options: ["Make first block non-repeating", "Replace the key", "Store public key", "Count rounds"], answerIndex: 0 }
    ],
    hard: [
      { prompt: "CBC mode prevents identical plaintext blocks from producing identical ciphertext blocks because…", options: ["XOR chaining with previous ciphertext/IV", "AES is random", "Base64 encoding", "Modulo 26"], answerIndex: 0 },
      { prompt: "If attacker flips a bit in CBC ciphertext block i, what happens?", options: ["Plaintext block i becomes random; block i+1 flips same bit position", "Nothing changes", "All blocks unchanged", "Hash collision"], answerIndex: 0 },
      { prompt: "Why must IV be unpredictable?", options: ["To avoid chosen-plaintext pattern attacks on first block", "To speed up AES", "To reduce key size", "To compute primes"], answerIndex: 0 },
      { prompt: "AES is considered secure when used with…", options: ["Proper mode + unique IV + key management", "Same IV always", "Caesar shift", "No padding ever"], answerIndex: 0 },
      { prompt: "In CBC, which must remain secret?", options: ["Key", "IV", "Both key and IV", "Neither"], answerIndex: 0 },
      { prompt: "PKCS7 padding bytes value equals…", options: ["Number of padding bytes", "Always 0", "Random", "Key length"], answerIndex: 0 },
      { prompt: "AES provides confidentiality but not integrity; typically add…", options: ["MAC/AEAD", "Modulo", "Prime generation", "Kasiski"], answerIndex: 0 },
      { prompt: "An AEAD alternative to CBC is…", options: ["GCM", "ROT13", "RSA", "SHA"], answerIndex: 0 },
      { prompt: "If IV repeats with same key, attackers can…", options: ["Infer whether first blocks are equal", "Recover RSA private key", "Force collisions in SHA", "Compute primes"], answerIndex: 0 },
      { prompt: "Which statement is true?", options: ["AES is symmetric; RSA is asymmetric", "AES is a hash; SHA is encryption", "RSA uses same key both ways", "SHA can be decrypted"], answerIndex: 0 }
    ]
  },

  rsa: {
    easy: [
      { prompt: "RSA is a…", options: ["Asymmetric (public-key) algorithm", "Symmetric cipher", "Hash function", "Compression method"], answerIndex: 0 },
      { prompt: "RSA uses… keys.", options: ["One", "Two (public and private)", "Three", "No"], answerIndex: 1 },
      { prompt: "Which key encrypts (typical case)?", options: ["Public key", "Private key", "IV", "Hash digest"], answerIndex: 0 },
      { prompt: "Which key decrypts (typical case)?", options: ["Private key", "Public key", "IV", "Shift N"], answerIndex: 0 },
      { prompt: "RSA security relies on difficulty of…", options: ["Factoring large integers", "Finding SHA collisions easily", "Modulo 26", "Sorting"], answerIndex: 0 },
      { prompt: "RSA modulus n equals…", options: ["p × q", "p + q", "p − q", "p ÷ q"], answerIndex: 0 },
      { prompt: "e in RSA is…", options: ["Public exponent", "Encrypted text", "Error", "Euler number"], answerIndex: 0 },
      { prompt: "d in RSA is…", options: ["Private exponent", "Digest", "Decrypt key for AES", "IV"], answerIndex: 0 },
      { prompt: "RSA often uses padding like…", options: ["OAEP", "PKCS7", "ROT13", "Vigenère"], answerIndex: 0 },
      { prompt: "RSA is commonly used in TLS for…", options: ["Key exchange / handshake", "Bulk data encryption only", "Hashing only", "Compression"], answerIndex: 0 }
    ],
    medium: [
      { prompt: "If p=11 and q=13, n is…", options: ["24", "121", "143", "169"], answerIndex: 2 },
      { prompt: "φ(n) for p=11,q=13 is…", options: ["120", "130", "143", "100"], answerIndex: 0 },
      { prompt: "d is defined as…", options: ["e⁻¹ mod φ(n)", "e × φ(n)", "φ(n) ÷ e", "e + φ(n)"], answerIndex: 0 },
      { prompt: "Which is true about public key?", options: ["It can be shared openly", "Must be secret", "Is random per message", "Is the IV"], answerIndex: 0 },
      { prompt: "Which is true about private key?", options: ["Must be kept secret", "Can be shared", "Is same as IV", "Is the ciphertext"], answerIndex: 0 },
      { prompt: "RSA ciphertext is computed as…", options: ["C = M^e mod n", "C = M + e", "C = M XOR e", "C = M / n"], answerIndex: 0 },
      { prompt: "RSA decryption is…", options: ["M = C^d mod n", "M = C + d", "M = C XOR d", "M = hash(C)"], answerIndex: 0 },
      { prompt: "Why OAEP padding?", options: ["Prevent chosen-plaintext attacks", "Make RSA faster", "Make key smaller", "Remove primes"], answerIndex: 0 },
      { prompt: "Compared to AES, RSA is…", options: ["Slower for bulk data", "Faster for bulk data", "Same speed", "One-way"], answerIndex: 0 },
      { prompt: "Best use case for RSA in systems:", options: ["Encrypt small secrets / keys", "Encrypt huge video streams directly", "Replace hashing", "Replace modulo"], answerIndex: 0 }
    ],
    hard: [
      { prompt: "If attacker factors n into p and q, they can…", options: ["Compute φ(n) and derive private key", "Only hash messages", "Only break AES", "Only break Caesar"], answerIndex: 0 },
      { prompt: "RSA without padding is vulnerable to…", options: ["Deterministic encryption attacks", "Modulo 26", "Avalanche effect", "CBC chaining"], answerIndex: 0 },
      { prompt: "RSA key sizes are larger because…", options: ["Math attacks need large n to resist factoring", "AES needs it", "SHA needs it", "Caesar needs it"], answerIndex: 0 },
      { prompt: "Which is NOT correct?", options: ["RSA is symmetric", "RSA uses (e,n) and (d,n)", "n=p×q", "d is modular inverse"], answerIndex: 0 },
      { prompt: "RSA is not used for bulk encryption mainly due to…", options: ["Performance", "It’s one-way", "No keys", "No modulo"], answerIndex: 0 },
      { prompt: "Digital signatures with RSA typically…", options: ["Use private key to sign, public key to verify", "Use IV to sign", "Use Caesar shift", "Use PKCS7"], answerIndex: 0 },
      { prompt: "What is the main goal of public exponent e choices like 65537?", options: ["Efficiency + security trade-off", "Make primes smaller", "Make modulo 26", "Make hashing reversible"], answerIndex: 0 },
      { prompt: "If e and φ(n) are not coprime, then…", options: ["d may not exist", "RSA becomes faster", "AES breaks", "SHA collides"], answerIndex: 0 },
      { prompt: "RSA depends on which arithmetic?", options: ["Modular exponentiation", "Matrix S-box lookups", "Modulo 26 shifts only", "Only XOR"], answerIndex: 0 },
      { prompt: "Correct statement:", options: ["RSA provides confidentiality; signatures provide authenticity", "RSA provides hashing", "RSA is a block cipher mode", "RSA uses IV chaining"], answerIndex: 0 }
    ]
  },

  sha256: {
    easy: [
      { prompt: "SHA-256 is a…", options: ["Cryptographic hash function", "Symmetric cipher", "Asymmetric cipher", "Padding scheme"], answerIndex: 0 },
      { prompt: "Hashing is…", options: ["One-way", "Two-way like encryption", "Same as Caesar", "Same as RSA"], answerIndex: 0 },
      { prompt: "SHA-256 output length is…", options: ["32 hex chars", "64 hex chars", "128 hex chars", "16 hex chars"], answerIndex: 1 },
      { prompt: "Hashes are used for…", options: ["Data integrity", "Decrypting ciphertext", "Key exchange only", "Modulo 26"], answerIndex: 0 },
      { prompt: "If input changes slightly, hash changes…", options: ["A little", "Completely (avalanche effect)", "Not at all", "Only at the end"], answerIndex: 1 },
      { prompt: "SHA-256 can be decrypted?", options: ["Yes", "No"], answerIndex: 1 },
      { prompt: "Hash output is called…", options: ["Digest", "IV", "Public key", "Shift"], answerIndex: 0 },
      { prompt: "Which is correct?", options: ["Same input → same hash", "Same input → random hash each time", "Hash is always reversible", "Hash uses public key"], answerIndex: 0 },
      { prompt: "A collision means…", options: ["Two inputs same hash", "One input two hashes", "Two keys same IV", "Two primes same n"], answerIndex: 0 },
      { prompt: "SHA-256 is mainly for…", options: ["Integrity, not confidentiality", "Confidentiality only", "Key exchange only", "Caesar shifting"], answerIndex: 0 }
    ],
    medium: [
      { prompt: "If you flip 1 bit in input, you expect…", options: ["Many output bits change", "No change", "Only 1 output bit changes", "Only length changes"], answerIndex: 0 },
      { prompt: "Why are hashes fixed length?", options: ["Design of hash function", "Because input is fixed length", "Because of RSA", "Because of AES"], answerIndex: 0 },
      { prompt: "A good cryptographic hash should be…", options: ["Preimage resistant", "Easily reversible", "Dependent on IV", "A substitution cipher"], answerIndex: 0 },
      { prompt: "Preimage resistance means…", options: ["Hard to find input for given hash", "Hard to find two same hashes", "Easy to decrypt", "Easy to factor"], answerIndex: 0 },
      { prompt: "Second-preimage resistance means…", options: ["Hard to find different input with same hash as a given input", "Hash changes slowly", "Hash decrypts", "Hash equals plaintext"], answerIndex: 0 },
      { prompt: "Collision resistance means…", options: ["Hard to find any two inputs with same hash", "Hash always unique guaranteed", "Hash reversible", "Hash uses public key"], answerIndex: 0 },
      { prompt: "Hashing a password should use…", options: ["Slow salted hashing (e.g., bcrypt/argon2)", "SHA-256 alone always", "Caesar", "RSA"], answerIndex: 0 },
      { prompt: "HMAC adds…", options: ["A secret key to hashing for authentication", "An IV to hashing", "Prime numbers", "Modulo 26"], answerIndex: 0 },
      { prompt: "SHA-256 hex digest is 64 chars because…", options: ["256 bits = 32 bytes = 64 hex chars", "It’s random", "It’s AES block size", "It’s RSA key size"], answerIndex: 0 },
      { prompt: "Best use of SHA-256 in networks:", options: ["Integrity checks", "Bulk encryption", "Key exchange", "Shift cipher"], answerIndex: 0 }
    ],
    hard: [
      { prompt: "Hashing is not encryption because…", options: ["No key and no inverse function", "It uses primes", "It uses IV", "It uses modulo 26"], answerIndex: 0 },
      { prompt: "If collisions were easy, what breaks first?", options: ["Digital signatures / integrity assumptions", "AES decryption", "RSA factoring", "Caesar shift"], answerIndex: 0 },
      { prompt: "Avalanche effect is important because…", options: ["Small input change → unpredictable output", "It compresses data", "It reveals patterns", "It makes decryption easier"], answerIndex: 0 },
      { prompt: "Which statement is true?", options: ["Same digest does not guarantee same input (but is very unlikely)", "Same digest always means different input", "Digest is reversible", "Digest contains the key"], answerIndex: 0 },
      { prompt: "A rainbow table attack targets…", options: ["Unsalted fast password hashes", "AES CBC IV", "RSA modulus", "Vigenère key"], answerIndex: 0 },
      { prompt: "Why add salt to password hashing?", options: ["Prevent precomputed table reuse", "Make hash reversible", "Make output shorter", "Make modulo 26"], answerIndex: 0 },
      { prompt: "SHA-256 is designed to be fast; for passwords we prefer…", options: ["Slow hashing (argon2/bcrypt/scrypt)", "Even faster hashing", "Caesar", "RSA"], answerIndex: 0 },
      { prompt: "Which is NOT a hash property?", options: ["Decryption", "Preimage resistance", "Collision resistance", "Determinism"], answerIndex: 0 },
      { prompt: "Integrity in transit is typically ensured by…", options: ["MAC/HMAC or signatures", "CBC alone", "Caesar shift", "Modulo 26"], answerIndex: 0 },
      { prompt: "If attacker can choose inputs and finds collision, they can…", options: ["Substitute content without changing hash", "Recover AES key instantly", "Compute p and q instantly", "Decrypt SHA"], answerIndex: 0 }
    ]
  }
};

