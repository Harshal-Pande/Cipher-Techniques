from flask import Flask, render_template, request, jsonify
from utils.caesar import caesar_encrypt, caesar_decrypt
from utils.vigenere import vigenere_encrypt, vigenere_decrypt
from utils.aes_cipher import aes_encrypt, aes_decrypt
from utils.rsa_cipher import rsa_encrypt, rsa_decrypt
from utils.hashing import sha256_hash
import traceback

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    try:
        data = request.json
        algo = data.get('algorithm')
        text = data.get('text')
        key = data.get('key', '')
        
        if not text:
            return jsonify({"error": "No text provided."}), 400

        result = {}

        if algo == 'caesar':
            try:
                shift = int(key)
            except ValueError:
                return jsonify({"error": "Caesar Cipher requires an integer key (shift)."}), 400
                
            enc_result = caesar_encrypt(text, shift)
            dec_result = caesar_decrypt(enc_result['encrypted'], shift)
            
            result = {
                "encrypted": enc_result['encrypted'],
                "decrypted": dec_result['decrypted'],
                "steps": enc_result['steps'] + [""] + dec_result['steps']
            }

        elif algo == 'vigenere':
            if not key.isalpha():
                 return jsonify({"error": "Vigenère Cipher requires an alphabetic key."}), 400
                 
            enc_result = vigenere_encrypt(text, key)
            dec_result = vigenere_decrypt(enc_result['encrypted'], key)
            
            result = {
                "encrypted": enc_result['encrypted'],
                "decrypted": dec_result['decrypted'],
                "steps": enc_result['steps'] + [""] + dec_result['steps']
            }

        elif algo == 'aes':
            if not key:
                return jsonify({"error": "AES requires a key (string)."}), 400
                
            enc_result = aes_encrypt(text, key)
            dec_result = aes_decrypt(enc_result['encrypted'], key)
            
            result = {
                "encrypted": enc_result['encrypted'],
                "decrypted": dec_result['decrypted'],
                "steps": enc_result['steps'] + [""] + dec_result['steps']
            }

        elif algo == 'rsa':
            enc_result = rsa_encrypt(text)
            dec_result = rsa_decrypt(enc_result['encrypted'], enc_result['private_key_pem'])
            
            result = {
                "encrypted": enc_result['encrypted'],
                "decrypted": dec_result['decrypted'],
                "steps": enc_result['steps'] + [""] + dec_result['steps']
            }

        elif algo == 'sha256':
            result = sha256_hash(text)
            # Hashing doesn't have a decrypt step mapping, hashing.py handles the struct

        else:
            return jsonify({"error": "Unknown algorithm."}), 400

        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Error processing request: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
