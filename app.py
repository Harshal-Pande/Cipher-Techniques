from flask import Flask, render_template, request, jsonify
from utils.caesar import caesar_encrypt, caesar_decrypt
from utils.vigenere import vigenere_encrypt, vigenere_decrypt
from utils.aes_cipher import aes_encrypt, aes_decrypt
from utils.rsa_cipher import rsa_encrypt, rsa_decrypt
from utils.hashing import sha256_hash
from utils.network_simulator import apply_protocol_rules, build_packet, simulate_transport, simulate_osi_layers
import traceback

app = Flask(__name__)

def perform_encryption(algo, text, key):
    """Helper to handle the core encryption algorithms"""
    if algo == 'caesar':
        try:
            shift = int(key)
        except ValueError:
            raise ValueError("Caesar Cipher requires an integer key (shift).")
        enc_result = caesar_encrypt(text, shift)
        dec_result = caesar_decrypt(enc_result['encrypted'], shift)
        return {
            "encrypted": enc_result['encrypted'],
            "decrypted": dec_result['decrypted'],
            "encrypt_steps": enc_result['steps'],
            "decrypt_steps": dec_result['steps']
        }
    elif algo == 'vigenere':
        if not key.isalpha():
            raise ValueError("Vigenère Cipher requires an alphabetic key.")
        enc_result = vigenere_encrypt(text, key)
        dec_result = vigenere_decrypt(enc_result['encrypted'], key)
        return {
            "encrypted": enc_result['encrypted'],
            "decrypted": dec_result['decrypted'],
            "encrypt_steps": enc_result['steps'],
            "decrypt_steps": dec_result['steps']
        }
    elif algo == 'aes':
        if not key:
            raise ValueError("AES requires a key (string).")
        enc_result = aes_encrypt(text, key)
        dec_result = aes_decrypt(enc_result['encrypted'], key)
        return {
            "encrypted": enc_result['encrypted'],
            "decrypted": dec_result['decrypted'],
            "encrypt_steps": enc_result['steps'],
            "decrypt_steps": dec_result['steps']
        }
    elif algo == 'rsa':
        enc_result = rsa_encrypt(text)
        dec_result = rsa_decrypt(enc_result['encrypted'], enc_result['private_key_pem'])
        return {
            "encrypted": enc_result['encrypted'],
            "decrypted": dec_result['decrypted'],
            "encrypt_steps": enc_result['steps'],
            "decrypt_steps": dec_result['steps']
        }
    elif algo == 'sha256':
        hash_res = sha256_hash(text)
        return {
            "encrypted": hash_res['encrypted'],
            "decrypted": hash_res['decrypted'],
            "encrypt_steps": hash_res['steps'],
            "decrypt_steps": []
        }
    else:
        raise ValueError("Unknown algorithm.")

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

        result = perform_encryption(algo, text, key)
        return jsonify(result)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        app.logger.error(f"Error processing request: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/simulate_network', methods=['POST'])
def simulate_network():
    try:
        data = request.json
        algo = data.get('algorithm')
        text = data.get('text')
        key = data.get('key', '')
        protocol = data.get('protocol', 'HTTPS').upper()
        transport_type = data.get('transport', 'TCP').upper()
        
        if not text:
            return jsonify({"error": "No text provided."}), 400

        # 1. Base Encryption logic
        enc_result = perform_encryption(algo, text, key)
        
        # 2. Network protocol simulation
        encryption_required = True if enc_result.get('encrypted') else False
        has_algo = algo is not None and algo != ""
        protocol_rules = apply_protocol_rules(protocol, text, encryption_required and has_algo)
        
        # Determine payload
        payload = enc_result['encrypted'] if protocol_rules['is_encrypted'] else text
        
        # 3. Simulate Transport & build packet
        transport_info = simulate_transport(transport_type)
        packet = build_packet(payload, protocol, transport_type)
        
        # 4. Simulate OSI Layers
        layers = simulate_osi_layers(packet, protocol_rules, transport_info)
        
        # 5. Build final response
        return jsonify({
            **enc_result,
            "network": {
                "protocol": protocol,
                "transport": transport_type,
                "packet": packet,
                "layers": layers,
                "security": {
                    "encrypted": protocol_rules['is_encrypted'],
                    "note": protocol_rules['note'],
                    "warning": protocol_rules['warning'],
                    "ack_status": transport_info['ack']
                }
            }
        })

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        app.logger.error(f"Error processing network simulation: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
